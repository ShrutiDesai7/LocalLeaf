import { useEffect, useMemo, useState } from 'react';
import { resolveApiUrl } from '../api';

function normalizeUrls(plant) {
  const urls = [];

  if (Array.isArray(plant?.image_urls)) {
    urls.push(...plant.image_urls);
  } else if (typeof plant?.image_urls === 'string') {
    try {
      const parsed = JSON.parse(plant.image_urls);
      if (Array.isArray(parsed)) urls.push(...parsed);
    } catch {
      urls.push(
        ...plant.image_urls
          .split(/[,\n]/g)
          .map((value) => value.trim())
          .filter(Boolean)
      );
    }
  }

  if (plant?.image_url) urls.push(plant.image_url);

  const deduped = Array.from(
    new Set(urls.map((value) => String(value).trim()).filter(Boolean))
  );
  return deduped;
}

export function GalleryModal({ open, plant, onClose }) {
  const images = useMemo(() => normalizeUrls(plant), [plant]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
  }, [open, plant?.id]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => Math.min(images.length - 1, current + 1));
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => Math.max(0, current - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [images.length, onClose, open]);

  if (!open || !plant) return null;

  const active = images[activeIndex] ? resolveApiUrl(images[activeIndex]) : '';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-leaf-deep/60 px-4 py-8">
      <div className="glass-panel w-full max-w-4xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-white/30 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-leaf-moss">Gallery</p>
            <h3 className="mt-1 font-display text-2xl text-leaf-forest">{plant.name}</h3>
          </div>
          <button
            aria-label="Close gallery"
            className="rounded-full bg-leaf-sage/40 px-3 py-2 text-sm text-leaf-forest"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-[1fr_360px]">
          <div className="relative bg-black/10">
            {active ? (
              <img alt={plant.name} className="h-[60vh] w-full object-contain" src={active} />
            ) : (
              <div className="flex h-[60vh] w-full items-center justify-center text-sm font-semibold text-leaf-forest">
                No photos available
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous photo"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-leaf-forest disabled:opacity-40"
                  type="button"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
                >
                  Prev
                </button>
                <button
                  aria-label="Next photo"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-leaf-forest disabled:opacity-40"
                  type="button"
                  disabled={activeIndex >= images.length - 1}
                  onClick={() =>
                    setActiveIndex((current) => Math.min(images.length - 1, current + 1))
                  }
                >
                  Next
                </button>
              </>
            )}
          </div>

          <div className="border-t border-white/30 p-6 md:border-l md:border-t-0">
            <p className="text-sm font-semibold text-leaf-forest">
              Photos ({images.length || 0})
            </p>
            <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-3">
              {images.map((url, index) => {
                const selected = index === activeIndex;
                return (
                  <button
                    key={`${url}-${index}`}
                    aria-label={`View photo ${index + 1}`}
                    className={`aspect-square overflow-hidden rounded-xl border transition ${
                      selected
                        ? 'border-leaf-forest'
                        : 'border-leaf-moss/25 hover:border-leaf-moss/60'
                    }`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                  >
                    <img alt="" className="h-full w-full object-cover" src={resolveApiUrl(url)} />
                  </button>
                );
              })}
            </div>

            {plant?.description && (
              <p className="mt-5 text-sm leading-6 text-leaf-moss">
                {String(plant.description).trim()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

