import Image from "next/image";

type RecipeImageProps = {
  src: string;
  alt: string;
  sizes?: string;
};

export function RecipeImage({ src, alt, sizes = "100vw" }: RecipeImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover object-center"
      unoptimized={src.endsWith(".svg")}
    />
  );
}