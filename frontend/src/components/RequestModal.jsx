import { useEffect, useMemo, useState } from 'react';
import { Button } from './Button';
import { resolveApiUrl } from '../api';

function getRequestCopy(plant) {
  const fallbackTitle = plant?.name ? `Request ${plant.name}` : 'Request this plant';

  const fallbackMessage = (() => {
    switch (plant?.category) {
      case 'Indoor':
        return 'Tell us where you plan to keep it (light/space). The nursery will confirm availability.';
      case 'Outdoor':
        return 'Share delivery details and your sun/shade spot. The nursery will confirm the best pick.';
      case 'Flowering':
        return 'Mention the occasion or preferred color. The nursery will confirm what’s in bloom.';
      case 'Succulent':
        return 'Share your delivery details. The nursery will confirm a healthy, well-rooted plant.';
      case 'Herbal':
        return 'Tell us if it’s for cooking or gifting. The nursery will confirm availability.';
      default:
        return 'Share your details and the nursery will confirm availability.';
    }
  })();

  return {
    title: plant?.request_title?.trim() || fallbackTitle,
    message:
      plant?.request_message?.trim() ||
      plant?.description?.trim() ||
      plant?.short_description?.trim() ||
      fallbackMessage
  };
}

export function RequestModal({ plant, open, onClose, onSubmit, submitting, user }) {
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    address: ''
  });

  const images = useMemo(() => {
    const fromArray = Array.isArray(plant?.image_urls) ? plant.image_urls : [];
    const fromCover = plant?.image_url ? [plant.image_url] : [];
    const merged = [...fromArray, ...fromCover].filter(Boolean);
    return Array.from(new Set(merged.map((value) => String(value).trim()).filter(Boolean)));
  }, [plant]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageSrc = images[activeImageIndex] ? resolveApiUrl(images[activeImageIndex]) : '';
  const requestCopy = useMemo(() => getRequestCopy(plant), [plant]);

  useEffect(() => {
    if (open) {
      setForm({
        customer_name: user?.role === 'customer' ? user.name : '',
        phone: user?.role === 'customer' ? user.phone : '',
        address: ''
      });
    }
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    setActiveImageIndex(0);
  }, [open, plant?.id]);

  if (!open || !plant) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-leaf-deep/45 px-4 py-8">
      <div className="glass-panel w-full max-w-2xl overflow-hidden">
        <div className="grid gap-0 md:grid-cols-[1.05fr_1fr]">
          <div className="relative min-h-[280px]">
            {imageSrc ? (
              <img
                alt={plant.name}
                className="h-full w-full object-cover"
                src={imageSrc}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-leaf-sage/50 to-leaf-forest/25 text-sm font-semibold text-leaf-forest">
                No image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-leaf-deep/80 via-leaf-deep/10 to-transparent" />
            {images.length > 1 && (
              <div className="absolute bottom-28 left-6 right-6 z-10 flex gap-2 overflow-x-auto pb-2">
                {images.map((url, index) => {
                  const selected = index === activeImageIndex;
                  return (
                    <button
                      key={`${url}-${index}`}
                      aria-label={`View photo ${index + 1}`}
                      className={`h-12 w-12 flex-none overflow-hidden rounded-xl border transition ${
                        selected ? 'border-white' : 'border-white/30 hover:border-white/60'
                      }`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img
                        alt=""
                        className="h-full w-full object-cover"
                        src={resolveApiUrl(url)}
                      />
                    </button>
                  );
                })}
              </div>
            )}
            <div className="absolute bottom-0 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/75">
                Plant Request
              </p>
              <h3 className="mt-2 font-display text-3xl">{plant.name}</h3>
              <p className="mt-2 text-sm text-white/80">
                ₹{Number(plant.price).toFixed(0)} · {plant.category}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-display text-2xl text-leaf-forest">
                  {requestCopy.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-leaf-moss">
                  {requestCopy.message}
                </p>
              </div>
              <button
                aria-label="Close modal"
                className="rounded-full bg-leaf-sage/40 px-3 py-2 text-sm text-leaf-forest"
                type="button"
                onClick={onClose}
              >
                Close
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit({
                  ...form,
                  plant_id: plant.id
                });
              }}
            >
              <input
                required
                className="field-input"
                placeholder="Your name"
                value={form.customer_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customer_name: event.target.value
                  }))
                }
              />
              <input
                required
                className="field-input"
                placeholder="Phone number"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
              />
              <textarea
                required
                className="field-input min-h-32 resize-none"
                placeholder="Delivery address"
                value={form.address}
                onChange={(event) =>
                  setForm((current) => ({ ...current, address: event.target.value }))
                }
              />

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button className="flex-1" disabled={submitting} type="submit">
                  {submitting ? 'Sending request...' : 'Submit Request'}
                </Button>
                <Button
                  className="flex-1"
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
