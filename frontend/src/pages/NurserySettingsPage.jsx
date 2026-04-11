import { useEffect, useState } from 'react';
import { api } from '../api';
import { Button } from '../components/Button';
import { PlantForm } from '../components/PlantForm'; // Reuse styling

export function NurserySettingsPage({ user }) {
  const [nursery, setNursery] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadNursery();
  }, []);

  async function loadNursery() {
    try {
      const data = await api.getMyNursery();
      setNursery(data.nursery);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleSubscribe() {
    try {
      setSubscriptionLoading(true);
      setMessage('');
      await api.subscribe(1); // 1 month
      setMessage('Subscription activated! You can now manage plants.');
      loadNursery();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubscriptionLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.24em] text-leaf-moss">
            Nursery Setup
          </p>
          <h1 className="mt-4 font-display text-4xl text-leaf-forest">
            Get started with your nursery
          </h1>
        </div>

        {nursery ? (
          <div className="space-y-6">
            <div className="glass-panel p-8 text-center">
              <h2 className="text-2xl font-semibold text-leaf-forest">{nursery.name}</h2>
              <p className="mt-2 text-leaf-moss">{nursery.address}</p>
              <p className="mt-4 text-sm">
                Status: <span className={`font-semibold px-3 py-1 rounded-full ${
                  nursery.subscription_status === 'active' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {nursery.subscription_status.toUpperCase()}
                </span>
              </p>
              {nursery.subscription_expires_at && (
                <p className="mt-1 text-xs text-leaf-moss">
                  Expires: {new Date(nursery.subscription_expires_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {nursery.subscription_status !== 'active' && (
              <div className="glass-panel p-8">
                <h3 className="text-xl font-semibold mb-4 text-leaf-forest">
                  Activate subscription to manage plants
                </h3>
                <Button 
                  onClick={handleSubscribe} 
                  loading={subscriptionLoading}
                  className="w-full max-w-sm mx-auto"
                >
                  Subscribe (1 month)
                </Button>
                <p className="mt-3 text-xs text-leaf-moss text-center">
                  Enable plant CRUD, order management
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel p-8 text-center">
            <p className="text-leaf-moss">Loading nursery...</p>
            {message && <p className="mt-2 text-rose-700">{message}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
