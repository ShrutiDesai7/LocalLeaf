import { Button } from './Button';
import { resolveApiUrl } from '../api';

export function PlantCard({ plant, onRequest, onOpenGallery }) {
  const images = Array.isArray(plant?.image_urls)
    ? plant.image_urls
    : plant?.image_url
      ? [plant.image_url]
      : [];

  const imageSrc = images[0] ? resolveApiUrl(images[0]) : '';
  const extraCount = Math.max(0, images.length - 1);

  const fallbackDescription = (() => {
    switch (plant?.category) {
      case 'Indoor':
        return 'Low-maintenance greens for desks, shelves, and living rooms.';
      case 'Outdoor':
        return 'Sun-ready plants for balconies, patios, and garden corners.';
      case 'Flowering':
        return 'Seasonal blooms picked to brighten your space.';
      case 'Succulent':
        return 'Compact, drought-tolerant picks for busy days.';
      case 'Herbal':
        return 'Fresh herbs for kitchen windows and everyday cooking.';
      default:
        return 'Healthy nursery-grown plants selected for home and gifting.';
    }
  })();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-card transition duration-300 hover:-translate-y-1">
      <button
        type="button"
        className="relative h-64 w-full overflow-hidden text-left"
        onClick={() => onOpenGallery?.(plant)}
      >
        {imageSrc ? (
          <img
            alt={plant.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={imageSrc}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-leaf-sage/50 to-leaf-forest/25 text-sm font-semibold text-leaf-forest">
            No image
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-leaf-forest">
          {plant.category}
        </div>
        {extraCount > 0 && (
          <div className="absolute right-4 top-4 rounded-full bg-leaf-forest/90 px-3 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-white">
            +{extraCount} photos
          </div>
        )}
        <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-leaf-forest">
          View gallery
        </div>
      </button>

      <div className="flex flex-1 flex-col space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="line-clamp-2 font-display text-2xl text-leaf-forest">
              {plant.name}
            </h3>
            <p className="mt-1 text-base text-leaf-moss">
              {plant.nursery_name || 'Local Nursery'}
            </p>
          </div>
          <p className="rounded-full bg-leaf-sage/50 px-3 py-2 text-sm font-semibold text-leaf-deep">
            ₹{Number(plant.price).toFixed(0)}
          </p>
        </div>

        <p className="line-clamp-3 overflow-hidden text-ellipsis text-base leading-7 text-leaf-moss">
          {plant.short_description?.trim() || plant.description?.trim() || fallbackDescription}
        </p>

        <Button className="mt-auto w-full" onClick={() => onRequest(plant)}>
          Request Plant
        </Button>
      </div>
    </article>
  );
}
