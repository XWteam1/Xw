import { OWNER_COLOR, type Owner } from "@/lib/owners";

export function OwnerAvatar({ owner, size = 24 }: { owner: string; size?: number }) {
  const color = OWNER_COLOR[owner as Owner] ?? "#8A939A";
  const initials = owner.slice(0, 2).toUpperCase();
  return (
    <span
      style={{ background: color, width: size, height: size, fontSize: size * 0.42 }}
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
    >
      {initials}
    </span>
  );
}
