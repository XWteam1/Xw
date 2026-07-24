"use client";

import { useState } from "react";
import type { PostFile } from "@/lib/actions/posts";

function ThumbContent({ file }: { file: PostFile }) {
  if (file.type.startsWith("image/")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={file.url} alt="" className="h-full w-full object-cover" />;
  }
  if (file.type.startsWith("video/")) {
    return <video src={file.url} className="h-full w-full object-cover" muted />;
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink-faint">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
        <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M14 3v5h5" />
      </svg>
      <span className="max-w-[90%] truncate text-[10px]">{file.name}</span>
    </div>
  );
}

export function PostFilesGallery({ files }: { files: PostFile[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const active = openIndex !== null ? files[openIndex] : null;

  return (
    <>
      <div className={`grid h-36 gap-0.5 bg-paper-sunken ${files.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {files.slice(0, 4).map((f, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="overflow-hidden bg-paper-sunken text-left"
          >
            <ThumbContent file={f} />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div onClick={(e) => e.stopPropagation()} className="flex max-h-[85vh] max-w-[90vw] flex-col items-center gap-3">
            {active.type.startsWith("image/") && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.url} alt="" className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain" />
            )}
            {active.type.startsWith("video/") && (
              <video src={active.url} controls autoPlay className="max-h-[80vh] max-w-[90vw] rounded-lg" />
            )}
            {!active.type.startsWith("image/") && !active.type.startsWith("video/") && (
              <iframe src={active.url} title={active.name} className="h-[80vh] w-[85vw] rounded-lg bg-white" />
            )}
            <span className="text-xs text-white/70">{active.name}</span>
          </div>

          {files.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((openIndex! - 1 + files.length) % files.length);
                }}
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((openIndex! + 1) % files.length);
                }}
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
