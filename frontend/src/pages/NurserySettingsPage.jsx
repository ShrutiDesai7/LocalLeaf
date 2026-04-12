import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { Button } from '../components/Button';

const plans = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: 199,
    months: 1,
    description: 'Best for trying out'
  },
  {
    id: 'quarterly',
    label: 'Quarterly',
    price: 499,
    months: 3,
    description: 'Save vs monthly'
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: 1499,
    months: 12,
    description: 'Best value'
  }
];

export function NurserySettingsPage() {
  const [nursery, setNursery] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('monthly');
  const [activePlanId, setActivePlanId] = useState(null);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) || plans[0],
    [selectedPlanId]
  );

  useEffect(() => {
    loadNursery();
  }, []);

  function inferPlanIdFromNursery(n) {
    if (!n?.subscription_expires_at || !n?.subscribed_at) return null;
    const start = new Date(n.subscribed_at);
    const end = new Date(n.subscription_expires_at);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      return null;
    }

    const approxMonths = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
    );

    if (approxMonths >= 12) return 'yearly';
    if (approxMonths >= 3) return 'quarterly';
    return 'monthly';
  }

  async function loadNursery() {
    try {
      const data = await api.getMyNursery();
      const loaded = data.nursery;
      setNursery(loaded);
      const inferred = inferPlanIdFromNursery(loaded);
      setActivePlanId(inferred);
      if (inferred) {
        setSelectedPlanId(inferred);
      }
      setMessage('');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleSubscribe() {
    try {
      setSubscriptionLoading(true);
      setMessage('');
      await api.subscribe(selectedPlan.months);
      setMessage('Subscription updated.');
      await loadNursery();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubscriptionLoading(false);
    }
  }

  const statusBadge =
    nursery?.subscription_status === 'active'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-amber-100 text-amber-700';

  return (
    <section className="container-wide py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="text-center">
          <p className="text-lg uppercase tracking-[0.24em] text-leaf-moss">
            Subscription
          </p>
          <h1 className="mt-3 font-display text-4xl text-leaf-forest">
            Choose a plan for your nursery
          </h1>
          <p className="mt-3 text-lg leading-8 text-leaf-moss">
            Subscriptions unlock adding, editing, and deleting plants.
          </p>
        </div>

        {message && (
          <div className="glass-panel px-5 py-4 text-lg text-leaf-forest">
            {message}
          </div>
        )}

        {nursery ? (
          <div className="glass-panel p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-lg uppercase tracking-[0.22em] text-leaf-moss">
                  Nursery
                </p>
                <h2 className="mt-2 truncate font-display text-3xl text-leaf-forest">
                  {nursery.name}
                </h2>
                <p className="mt-2 text-lg text-leaf-moss">{nursery.address}</p>
                {nursery.subscription_status === 'active' && activePlanId && (
                  <p className="mt-3 text-lg text-leaf-deep">
                    Active plan:{' '}
                    <span className="font-semibold text-leaf-forest">
                      {plans.find((p) => p.id === activePlanId)?.label || 'Active'}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-5 py-2.5 text-lg font-semibold ${statusBadge}`}>
                  {nursery.subscription_status.toUpperCase()}
                </span>
                {nursery.subscription_expires_at && (
                  <span className="rounded-full bg-white/70 px-5 py-2.5 text-lg text-leaf-forest">
                    Expires:{' '}
                    {new Date(nursery.subscription_expires_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-8 text-center text-leaf-moss">
            Loading nursery...
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const selected = plan.id === selectedPlanId;
            const isActive =
              nursery?.subscription_status === 'active' && plan.id === activePlanId;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`glass-panel p-6 text-left transition ${
                  selected ? 'ring-2 ring-leaf-forest' : 'hover:shadow-card'
                }`}
              >
                <p className="text-lg uppercase tracking-[0.22em] text-leaf-moss">
                  {plan.label}
                </p>
                <p className="mt-3 font-display text-4xl text-leaf-forest">
                  ₹{plan.price}
                </p>
                <p className="mt-2 text-lg text-leaf-moss">{plan.description}</p>
                {isActive && (
                <div className="mt-4 inline-flex rounded-full bg-emerald-100 px-4 py-1.5 text-lg font-semibold text-emerald-700">
                  Active
                </div>
              )}
                <p className="mt-4 text-lg text-leaf-moss">
                  Duration: {plan.months} month{plan.months === 1 ? '' : 's'}
                </p>
              </button>
            );
          })}
        </div>

        <div className="glass-panel p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-leaf-forest">
                Selected: {selectedPlan.label} (₹{selectedPlan.price})
              </p>
              <p className="mt-1 text-lg text-leaf-moss">
                Duration: {selectedPlan.months} month{selectedPlan.months === 1 ? '' : 's'}
              </p>
            </div>
            <Button
              onClick={handleSubscribe}
              disabled={!nursery || subscriptionLoading}
            >
              {subscriptionLoading ? 'Updating...' : 'Activate plan'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
