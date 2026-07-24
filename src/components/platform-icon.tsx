const BG: Record<string, string> = {
  Instagram: "linear-gradient(135deg,#c8378f,#e0995e)",
  LinkedIn: "#1f6fb2",
  YouTube: "#d13a2f",
};

export function PlatformIcon({ platform, size = 22 }: { platform: string; size?: number }) {
  return (
    <span
      style={{ background: BG[platform] ?? "#8A939A", width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-md text-white"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" style={{ width: size * 0.55, height: size * 0.55 }}>
        {platform === "Instagram" && (
          <>
            <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
            <circle cx="12" cy="12" r="3.6" />
            <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
          </>
        )}
        {platform === "LinkedIn" && (
          <path
            fill="currentColor"
            stroke="none"
            d="M6.9 9.5H4.1V19h2.8V9.5ZM5.5 8.2A1.6 1.6 0 1 0 5.5 5a1.6 1.6 0 0 0 0 3.2ZM19.9 19h-2.8v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.4-2 2.7V19H10.6V9.5h2.7v1.3h0c.4-.7 1.3-1.5 2.7-1.5 2.9 0 3.9 1.9 3.9 4.4V19Z"
          />
        )}
        {platform === "YouTube" && (
          <>
            <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
            <path fill="currentColor" stroke="none" d="M10.5 9.5v5l4.5-2.5z" />
          </>
        )}
      </svg>
    </span>
  );
}
