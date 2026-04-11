import { Button } from './Button';
import { resolveApiUrl } from '../api';

export function PlantCard({ plant, onRequest }) {
  const imageSrc = plant?.image_url ? resolveApiUrl(plant.image_url) : '';

  return (
    <article className="group overflow-hidden rounded-[28px] bg-white shadow-card transition duration-300 hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
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
        <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-leaf-forest">
          {plant.category}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-leaf-forest">{plant.name}</h3>
            <p className="mt-1 text-sm text-leaf-moss">
              {plant.nursery_name || 'Local Nursery'}
            </p>
          </div>
          <p className="rounded-full bg-leaf-sage/50 px-3 py-2 text-sm font-semibold text-leaf-deep">
            ₹{Number(plant.price).toFixed(0)}
          </p>
        </div>

        <p className="text-sm leading-6 text-leaf-moss">
          Healthy, presentation-ready nursery stock chosen for homes, balconies, and green gifting.
        </p>

        <Button className="w-full" onClick={() => onRequest(plant)}>
          Request Plant
        </Button>
      </div>
    </article>
  );
}
