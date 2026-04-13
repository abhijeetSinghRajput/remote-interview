import Image from "next/image";

export default function HeroPreview() {
  return (
    <div className="relative mx-auto mt-20 max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-muted shadow-2xl backdrop-blur-sm">
        <Image
          src="/hero-preview-light.png"
          width={800}
          height={450}
          alt="Hero preview of the code editor and video call interface"
          className={"imgLight"}
          fetchPriority="high"
        />
        <Image
          src="/hero-preview-dark.png"
          width={800}
          height={450}
          alt="Hero preview of the code editor and video call interface"
          className={"imgDark"}
          fetchPriority="high"
        />
      </div>
    </div>
  );
}