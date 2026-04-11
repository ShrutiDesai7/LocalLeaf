import { useEffect, useState } from 'react';
import { Button } from './Button';
import { resolveApiUrl } from '../api';

export function RequestModal({ plant, open, onClose, onSubmit, submitting, user }) {
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    address: ''
  });

  const imageSrc = plant?.image_url ? resolveApiUrl(plant.image_url) : '';

  useEffect(() => {
    if (open) {
      setForm({
        customer_name: user?.role === 'customer' ? user.name : '',
        phone: user?.role === 'customer' ? user.phone : '',
        address: ''
      });
    }
  }, [open, user]);

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
            <div className="absolute bottom-0 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/75">
                Plant Request
              </p>
              <h3 className="mt-2 font-display text-3xl">{plant.name}</h3>
              <p className="mt-2 text-sm text-white/80">
                Rs. {Number(plant.price).toFixed(0)} · {plant.category}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-display text-2xl text-leaf-forest">
                  Request this plant
                </h4>
                <p className="mt-2 text-sm leading-6 text-leaf-moss">
                  Share your details and the nursery can accept or reject the order.
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
