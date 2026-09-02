/* Reference-led rule: the shared star-and-sound mark must remain clearly visible rather than becoming a tiny decorative favicon. */
import Image from "next/image";
import { STORY_ASSETS } from "@/lib/seed";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return <Image alt="Reader Leader" className={cn("size-14 object-contain", className)} height={56} src={STORY_ASSETS.brandMark} width={56} />;
}
