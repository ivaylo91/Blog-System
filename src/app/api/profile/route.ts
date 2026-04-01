import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { logger } from "@/lib/logger";

const uploadsDirectory = path.join(process.cwd(), "public", "uploads", "avatars");
const maxImageSizeBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function getImageExtension(file: File) {
  const mapping: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };

  return mapping[file.type] ?? ".img";
}

async function saveAvatar(file: File) {
  if (file.size === 0) return null;
  if (!allowedImageTypes.has(file.type)) throw new Error("Изображението трябва да е JPG, PNG или WebP.");
  if (file.size > maxImageSizeBytes) throw new Error("Изображението трябва да е до 5 MB.");

  await mkdir(uploadsDirectory, { recursive: true });
  const fileName = `${randomUUID()}${getImageExtension(file)}`;
  const filePath = path.join(uploadsDirectory, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return `/uploads/avatars/${fileName}`;
}

function isUploadPath(imagePath?: string | null) {
  return Boolean(imagePath && imagePath.startsWith("/uploads/avatars/"));
}

async function deleteUploadedAvatar(imagePath?: string | null) {
  if (!imagePath || !isUploadPath(imagePath)) return;
  const uploadedFilePath = path.join(process.cwd(), "public", imagePath.replace(/^\//, ""));
  await unlink(uploadedFilePath).catch(() => undefined);
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, image: true } });

  return NextResponse.json({ user });
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const formData = await req.formData();
  const name = (formData.get("name") as string) ?? null;
  const image = formData.get("image");

  // rate-limit profile updates per user
  try {
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'local';
    const { rateLimit } = await import('@/lib/rate-limit');
    const key = `profile:${session.user.id}:${ip}`;
    const rl = await rateLimit(key, 6, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }
  } catch (rateLimitErr) {
    logger.error(rateLimitErr);
  }

  // basic name validation
  if (name && name.length > 100) {
    return NextResponse.json({ error: 'name_too_long' }, { status: 400 });
  }

  let uploadedPath: string | null = null;
  try {
    if (image && image instanceof File) {
      uploadedPath = await saveAvatar(image);
    }

    const existing = await prisma.user.findUnique({ where: { id: session.user.id }, select: { image: true } });

    const updated = await prisma.user.update({ where: { id: session.user.id }, data: { name: name ?? undefined, image: uploadedPath ?? existing?.image ?? undefined } });

    if (uploadedPath && existing?.image && existing.image !== uploadedPath) {
      await deleteUploadedAvatar(existing.image);
    }

    return NextResponse.json({ user: { id: updated.id, name: updated.name, email: updated.email, image: updated.image } });
  } catch (err) {
    if (uploadedPath) {
      await deleteUploadedAvatar(uploadedPath);
    }
    logger.error(err);
    return NextResponse.json({ error: "Неуспешна актуализация на профила." }, { status: 400 });
  }
}
