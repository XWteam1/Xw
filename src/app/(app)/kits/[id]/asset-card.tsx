"use client";

import { useState } from "react";
import { OwnerAvatar } from "@/components/owner-avatar";
import { PlatformIcon } from "@/components/platform-icon";
import { OWNERS, PLATFORMS, FORMATS_BY_PLATFORM, type Platform } from "@/lib/owners";
import { statusLabel, statusClasses } from "@/lib/status";
import { updateAsset, deleteAsset, moveAsset } from "@/lib/actions/kits";

type AssetData = {
  id: string;
  owner: string;
  platform: string;
  format: string;
  status: string;
};

export function AssetCard({
  asset,
  kitId,
  isFirst,
  isLast,
  locked,
  canEdit,
}: {
  asset: AssetData;
  kitId: string;
  isFirst: boolean;
  isLast: boolean;
  locked: boolean;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [platform, setPlatform] = useState(asset.platform);
  const [format, setFormat] = useState(asset.format);

  const formats = FORMATS_BY_PLATFORM[platform as Platform] ?? [];

  function onPlatformChange(next: string) {
    setPlatform(next);
    const nextFormats = FORMATS_BY_PLATFORM[next as Platform] ?? [];
    if (!nextFormats.includes(format)) setFormat(nextFormats[0]);
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-paper-raised px-4 py-3">
      {!editing ? (
        <>
          <OwnerAvatar owner={asset.owner} />
          <span className="text-sm font-semibold text-ink">{asset.owner}</span>
          <PlatformIcon platform={asset.platform} />
          <span className="text-sm font-semibold text-ink">{asset.format}</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses(asset.status)}`}>
            {statusLabel(asset.status)}
          </span>
        </>
      ) : (
        <form action={updateAsset} onSubmit={() => setEditing(false)} className="flex flex-1 flex-wrap items-center gap-2">
          <input type="hidden" name="assetId" value={asset.id} />
          <input type="hidden" name="kitId" value={kitId} />
          <select name="owner" defaultValue={asset.owner} className="rounded-lg border border-line-strong bg-paper px-2.5 py-1.5 text-sm text-ink">
            {OWNERS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <select
            name="platform"
            value={platform}
            onChange={(e) => onPlatformChange(e.target.value)}
            className="rounded-lg border border-line-strong bg-paper px-2.5 py-1.5 text-sm text-ink"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            name="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="rounded-lg border border-line-strong bg-paper px-2.5 py-1.5 text-sm text-ink"
          >
            {formats.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <button type="button" onClick={() => setEditing(false)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-paper-sunken">
            Cancel
          </button>
          <button type="submit" className="rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-accent-strong">
            Save
          </button>
        </form>
      )}

      {canEdit && (
        <div className="ml-auto flex items-center gap-1">
          <form action={moveAsset}>
            <input type="hidden" name="assetId" value={asset.id} />
            <input type="hidden" name="kitId" value={kitId} />
            <input type="hidden" name="direction" value="up" />
            <button type="submit" disabled={isFirst} className="flex h-6 w-6 items-center justify-center rounded border border-line-strong text-ink-soft disabled:opacity-30">↑</button>
          </form>
          <form action={moveAsset}>
            <input type="hidden" name="assetId" value={asset.id} />
            <input type="hidden" name="kitId" value={kitId} />
            <input type="hidden" name="direction" value="down" />
            <button type="submit" disabled={isLast} className="flex h-6 w-6 items-center justify-center rounded border border-line-strong text-ink-soft disabled:opacity-30">↓</button>
          </form>
          {!editing && !locked && (
            <>
              <button type="button" onClick={() => setEditing(true)} className="rounded-md border border-line-strong px-2.5 py-1 text-xs font-semibold text-ink hover:border-ink-faint">
                Edit
              </button>
              <form
                action={deleteAsset}
                onSubmit={(e) => {
                  if (!confirm("Delete this asset?")) e.preventDefault();
                }}
              >
                <input type="hidden" name="assetId" value={asset.id} />
                <input type="hidden" name="kitId" value={kitId} />
                <button type="submit" className="flex h-6 w-6 items-center justify-center rounded text-ink-faint hover:bg-bad-soft hover:text-bad">✕</button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
