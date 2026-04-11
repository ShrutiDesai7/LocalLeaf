import { Button } from './Button';
import { resolveApiUrl } from '../api';

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
            onClick={() => onUpdateStatus(order.id, 'accepted')}
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
    </article>
  );
}

