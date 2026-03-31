import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { revalidatePath } from 'next/cache'

const BodySchema = z.object({ ids: z.array(z.string().min(1)).min(1) })

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  }

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'local'
  const rl = await rateLimit(`admin:${session.user.id}:bulkDelete`, 5, 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch (e) {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parse = BodySchema.safeParse(body)
  if (!parse.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  const ids = parse.data.ids

  try {
    // find affected recipes to revalidate after deletion
    const affected = await prisma.comment.findMany({ where: { id: { in: ids } }, select: { recipe: { select: { slug: true } } } })

    await prisma.comment.deleteMany({ where: { id: { in: ids } } })

    const slugs = Array.from(new Set(affected.map((a) => a.recipe.slug)))
    for (const slug of slugs) {
      revalidatePath(`/recipes/${slug}`)
    }
    revalidatePath('/dashboard')

    return NextResponse.json({ ok: true })
  } catch (err) {
    const { logger } = await import('@/lib/logger')
    logger.error(err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
