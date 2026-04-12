import { Button } from './Button';
import { resolveApiUrl } from '../api';
import { useMemo, useState } from 'react';

function getStatusClasses(status) {
  if (status === 'accepted') {
    return 'status-pill bg-emerald-100 text-emerald-700';
  }

  if (status === 'rejected') {
    return 'status-pill bg-rose-100 text-rose-700';
  }

  return 'status-pill bg-amber-100 text-amber-700';
}

export function OrderCard({ order, onUpdateStatus, updatingStatus }) {
  const createdAt = order.created_at ? new Date(order.created_at) : null;
  const canUpdate = typeof onUpdateStatus === 'function';
  const title = order.plant_name || `Plant #${order.plant_id}`;
  const imageRaw =
    order.plant_image_url ||
    order.plant_image ||
    'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=600&q=80';
  const image = resolveApiUrl(imageRaw);

  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [acceptForm, setAcceptForm] = useState({
    delivery_eta: '',
    delivery_partner_name: '',
    delivery_partner_phone: ''
  });

  const acceptDisabled = useMemo(() => {
    if (updatingStatus) return true;
    if (!acceptForm.delivery_eta.trim()) return true;
    if (
      !acceptForm.delivery_partner_name.trim() &&
      !acceptForm.delivery_partner_phone.trim()
    ) {
      return true;
    }
    return false;
  }, [acceptForm.delivery_eta, acceptForm.delivery_partner_name, acceptForm.delivery_partner_phone, updatingStatus]);

  return (
    <article className="glass-panel p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <img
            alt={title}
            className="h-24 w-24 rounded-3xl object-cover"
            src={image}
          />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-2xl text-leaf-forest">{title}</h3>
              <span className={getStatusClasses(order.status)}>{order.status}</span>
            </div>
            <p className="text-sm text-leaf-moss">
              Plant ID #{order.plant_id}
              {order.plant_category ? ` \u00b7 ${order.plant_category}` : ''}
            </p>
            {order.nursery_name && (
              <p className="text-sm text-leaf-moss">{order.nursery_name}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2 text-sm text-leaf-deep sm:grid-cols-2 lg:min-w-[360px]">
          <p>
            <span className="font-semibold">Customer:</span> {order.customer_name}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {order.phone}
          </p>
          <p className="sm:col-span-2">
            <span className="font-semibold">Address:</span> {order.address}
          </p>
          <p>
            <span className="font-semibold">Requested:</span>{' '}
            {createdAt ? createdAt.toLocaleString() : '\u2014'}
          </p>
        </div>
      </div>

      {canUpdate && (
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            className="min-w-[120px]"
            disabled={updatingStatus}
            onClick={() => setShowAcceptForm(true)}
          >
            {updatingStatus ? 'Updating...' : 'Accept'}
          </Button>
          <Button
            className="min-w-[120px] border-rose-200 text-rose-700 hover:bg-rose-50"
            disabled={updatingStatus}
            variant="secondary"
            onClick={() => onUpdateStatus(order.id, 'rejected')}
          >
            Reject
          </Button>
        </div>
      )}

      {canUpdate && showAcceptForm && (
        <div className="mt-5 rounded-3xl bg-white/70 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-leaf-forest">Delivery details</p>
            <button
              type="button"
              className="text-sm text-leaf-moss hover:text-leaf-forest"
              onClick={() => setShowAcceptForm(false)}
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-leaf-moss">
                ETA / Duration
              </label>
              <input
                className="field-input"
                placeholder="e.g. 2 days"
                value={acceptForm.delivery_eta}
                onChange={(e) =>
                  setAcceptForm((c) => ({ ...c, delivery_eta: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-leaf-moss">
                Partner name
              </label>
              <input
                className="field-input"
                placeholder="Optional"
                value={acceptForm.delivery_partner_name}
                onChange={(e) =>
                  setAcceptForm((c) => ({
                    ...c,
                    delivery_partner_name: e.target.value
                  }))
                }
              />
            </div>
            <div className="sm:col-span-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-leaf-moss">
                Partner phone
              </label>
              <input
                className="field-input"
                placeholder="Optional"
                value={acceptForm.delivery_partner_phone}
                onChange={(e) =>
                  setAcceptForm((c) => ({
                    ...c,
                    delivery_partner_phone: e.target.value
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              className="min-w-[140px]"
              disabled={acceptDisabled}
              onClick={() =>
                onUpdateStatus(order.id, 'accepted', {
                  delivery_eta: acceptForm.delivery_eta,
                  delivery_partner_name: acceptForm.delivery_partner_name,
                  delivery_partner_phone: acceptForm.delivery_partner_phone
                })
              }
            >
              Confirm accept
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowAcceptForm(false)}
              disabled={updatingStatus}
            >
              Cancel
            </Button>
          </div>

          {acceptDisabled && (
            <p className="mt-3 text-xs text-leaf-moss">
              Add an ETA and at least one delivery partner detail.
            </p>
          )}
        </div>
      )}
    </article>
  );
}
