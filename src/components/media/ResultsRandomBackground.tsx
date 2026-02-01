import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type MediaKind = "image" | "video";

export type ResultsBackgroundItem = {
  kind: MediaKind;
  src: string;
};

type Props = {
  className?: string;
  /** Backend bucket id (optional; if empty/unavailable we fall back to fallbackItems) */
  bucketId?: string;
  /** Folder within bucket */
  prefix?: string;
  /** Used when bucket has no items or cannot be listed */
  fallbackItems: ResultsBackgroundItem[];
  /** Adds a dark overlay on top of the media */
  overlayOpacity?: number;
};

function inferKindFromPath(path: string): MediaKind {
  const ext = path.split("?")[0]?.split("#")[0]?.split(".").pop()?.toLowerCase();
  if (!ext) return "image";
  if (["mp4", "webm", "ogg"].includes(ext)) return "video";
  return "image";
}

export function ResultsRandomBackground({
  className,
  bucketId = "results-media",
  prefix = "results",
  fallbackItems,
  overlayOpacity = 0.7,
}: Props) {
  const [item, setItem] = useState<ResultsBackgroundItem | null>(null);

  const normalizedFallback = useMemo<ResultsBackgroundItem[]>(
    () =>
      fallbackItems
        .filter((x) => !!x?.src)
        .map((x) => ({ ...x, kind: x.kind ?? inferKindFromPath(x.src) })),
    [fallbackItems],
  );

  useEffect(() => {
    let cancelled = false;

    async function pickRandom() {
      // 1) Try backend storage list
      try {
        const { data, error } = await supabase.storage.from(bucketId).list(prefix, {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });

        if (!error && Array.isArray(data) && data.length > 0) {
          const candidates = data
            .filter((o) => o.name && !o.name.endsWith("/"))
            .map((o) => {
              const objectPath = `${prefix}/${o.name}`;
              const publicUrl = supabase.storage.from(bucketId).getPublicUrl(objectPath).data
                .publicUrl;
              return {
                kind: inferKindFromPath(objectPath),
                src: publicUrl,
              } satisfies ResultsBackgroundItem;
            })
            .filter((x) => !!x.src);

          if (candidates.length > 0) {
            const next = candidates[Math.floor(Math.random() * candidates.length)] ?? null;
            if (!cancelled) setItem(next);
            return;
          }
        }
      } catch {
        // swallow; fallback below
      }

      // 2) Fallback to bundled/public assets
      if (normalizedFallback.length > 0) {
        const next =
          normalizedFallback[Math.floor(Math.random() * normalizedFallback.length)] ?? null;
        if (!cancelled) setItem(next);
      }
    }

    pickRandom();
    return () => {
      cancelled = true;
    };
  }, [bucketId, prefix, normalizedFallback]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {item?.kind === "video" ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={item.src} />
        </video>
      ) : item?.src ? (
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={item.src}
          alt=""
          loading="lazy"
        />
      ) : null}

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `hsl(var(--overlay) / ${overlayOpacity})` }}
      />
    </div>
  );
}
