import { Link } from 'react-router-dom';
import { OrderCard } from '../components/OrderCard';
import { PlantForm } from '../components/PlantForm';
import { api, resolveApiUrl } from '../api';
import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';

export function DashboardPage({
  user,
  orders,
  loading,
  error,
  onRefreshOrders,
  onOrderPatched,
  onPlantsChanged
}) {
  const acceptedCount = orders.filter((order) => order.status === 'accepted').length;
  const pendingCount = orders.filter((order) => order.status === 'pending').length;
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);

  const [myPlants, setMyPlants] = useState([]);
  const [myPlantsLoading, setMyPlantsLoading] = useState(false);
  const [myPlantsError, setMyPlantsError] = useState('');
  const [editingPlant, setEditingPlant] = useState(null);
  const [addingPlant, setAddingPlant] = useState(false);
  const [plantFormLoading, setPlantFormLoading] = useState(false);
  const [plantMessage, setPlantMessage] = useState('');
  const [plantMessageIsError, setPlantMessageIsError] = useState(false);

  const [nursery, setNursery] = useState(null);
  const [nurseryLoading, setNurseryLoading] = useState(false);

  useEffect(() => {
    loadNursery();
    loadMyPlants();
  }, []);

  useEffect(() => {
    if (!message || messageIsError) return;
    const timer = setTimeout(() => setMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [message, messageIsError]);

  useEffect(() => {
    if (!plantMessage || plantMessageIsError) return;
    const timer = setTimeout(() => setPlantMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [plantMessage, plantMessageIsError]);

  async function loadNursery() {
    try {
      setNurseryLoading(true);
      const data = await api.getMyNursery();
      setNursery(data.nursery || null);
    } catch {
      setNursery(null);
    } finally {
      setNurseryLoading(false);
    }
  }

  async function loadMyPlants() {
    try {
      setMyPlantsLoading(true);
      setMyPlantsError('');
      const data = await api.getMyPlants();
      setMyPlants(Array.isArray(data) ? data : []);
    } catch (err) {
      setMyPlantsError(err.message);
    } finally {
      setMyPlantsLoading(false);
    }
  }

  async function handleCreatePlant(formData) {
    try {
      setPlantFormLoading(true);
      setPlantMessage('');
      setPlantMessageIsError(false);
      await api.createPlant(formData);
      setPlantMessage('Plant added successfully!');
      setAddingPlant(false);
      loadMyPlants();
      if (typeof onPlantsChanged === 'function') {
        onPlantsChanged();
      }
    } catch (err) {
      setPlantMessage(err.message);
      setPlantMessageIsError(true);
    } finally {
      setPlantFormLoading(false);
    }
  }

  async function handleUpdatePlant(formData) {
    if (!editingPlant) return;
    try {
      setPlantFormLoading(true);
      setPlantMessage('');
      setPlantMessageIsError(false);
      await api.updatePlant(editingPlant.id, formData);
      setPlantMessage('Plant updated successfully!');
      setEditingPlant(null);
      loadMyPlants();
      if (typeof onPlantsChanged === 'function') {
        onPlantsChanged();
      }
    } catch (err) {
      setPlantMessage(err.message);
      setPlantMessageIsError(true);
    } finally {
      setPlantFormLoading(false);
    }
  }

  async function handleDeletePlant(id) {
    if (!confirm('Delete this plant?')) return;
    try {
      setPlantMessage('');
      setPlantMessageIsError(false);
      await api.deletePlant(id);
      setPlantMessage('Plant deleted successfully!');
      loadMyPlants();
      if (typeof onPlantsChanged === 'function') {
        onPlantsChanged();
      }
    } catch (err) {
      setPlantMessage(err.message);
      setPlantMessageIsError(true);
    }
  }

  async function handleUpdateStatus(id, status, extra = {}) {
    try {
      setUpdatingOrderId(id);
      setMessage('');
      setMessageIsError(false);
      const data = await api.updateOrderStatus(id, { status, ...extra });
      if (data?.order && typeof onOrderPatched === 'function') {
        onOrderPatched(data.order);
      }
      setMessage(`Order ${status}.`);
      if (typeof onRefreshOrders === 'function') {
        onRefreshOrders();
      }
    } catch (err) {
      setMessage(err.message);
      setMessageIsError(true);
    } finally {
      setUpdatingOrderId(null);
    }
  }


  return (
    <section className="container-wide py-10">
      <Toast
        kind={messageIsError ? 'error' : 'success'}
        text={message}
        topClass="top-4"
      />
      <Toast
        kind={plantMessageIsError ? 'error' : 'success'}
        text={plantMessage}
        topClass="top-20"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
        <div className="rounded-[36px] bg-leaf-forest px-6 py-8 text-white shadow-card sm:px-8">
          <p className="text-base uppercase tracking-[0.24em] text-white/70">
            Nursery Dashboard
          </p>
          <h1 className="mt-4 font-display text-4xl">
            Manage incoming plant requests with clarity.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/82">
            Review customer details, track request status, and respond quickly from one calm, organized space.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-lg">
            <span className="rounded-full bg-white/12 px-5 py-2.5">
              Owner: {user?.name || 'Nursery Owner'}
            </span>
            <span className="rounded-full bg-white/12 px-5 py-2.5">
              Pending: {pendingCount}
            </span>
            <span className="rounded-full bg-white/12 px-5 py-2.5">
              Accepted: {acceptedCount}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="glass-panel p-6">
            <p className="text-base uppercase tracking-[0.22em] text-leaf-moss">
              Total Orders
            </p>
            <p className="mt-3 font-display text-5xl text-leaf-forest">{orders.length}</p>
          </div>
          <div className="glass-panel p-6">
            <p className="text-base uppercase tracking-[0.22em] text-leaf-moss">
              Subscription
            </p>
            <p className="mt-3 text-lg text-leaf-deep">
              {nurseryLoading
                ? 'Loading...'
                : nursery
                  ? `Status: ${nursery.subscription_status}`
                  : 'Not available'}
            </p>
            <div className="mt-4">
              <Link
                className="inline-flex items-center rounded-full bg-leaf-forest px-5 py-2.5 text-base font-semibold text-white"
                to="/nursery"
              >
                Manage plan
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 glass-panel p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg uppercase tracking-[0.22em] text-leaf-moss">
              My Plants
            </p>
            <p className="mt-2 text-lg text-leaf-deep">
              Manage your nursery plants (Add/Edit/Delete)
            </p>
          </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadMyPlants}>
            Refresh
          </Button>
          <Button onClick={() => setAddingPlant(true)}>+ Add Plant</Button>
        </div>
      </div>

        {!nurseryLoading &&
          nursery &&
          nursery.subscription_status !== 'active' && (
            <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-base text-amber-900">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Subscription required</p>
                  <p className="mt-1 text-amber-800/90">
                    Activate subscription to add, edit, or delete plants.
                  </p>
                </div>
                <Link
                  className="inline-flex items-center rounded-full bg-leaf-forest px-5 py-2.5 text-base font-semibold text-white"
                  to="/nursery"
                >
                  Choose plan
                </Link>
              </div>
            </div>
          )}

{(addingPlant || editingPlant) ? (
          <PlantForm
            defaultValues={editingPlant || {}}
            onSubmit={editingPlant ? handleUpdatePlant : handleCreatePlant}
            onCancel={() => {
              setAddingPlant(false);
              setEditingPlant(null);
            }}
            submitLabel={editingPlant ? 'Update Plant' : 'Add Plant'}
            isLoading={plantFormLoading}
          />
        ) : myPlantsLoading ? (
          <p className="mt-4 text-base text-leaf-moss">Loading plants...</p>
        ) : myPlantsError ? (
          <p className="mt-4 text-base text-rose-700">{myPlantsError}</p>
        ) : myPlants.length === 0 ? (
          <p className="mt-4 text-base text-leaf-moss">
            No plants found for this nursery yet. Add your first plant!
          </p>
        ) : (
          <div className="mt-5 grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {myPlants.map((plant) => (
              <div
                key={plant.id}
                className="flex h-full flex-col rounded-[24px] bg-white/70 p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative mb-4 overflow-hidden rounded-2xl bg-white/70">
                  {plant.image_urls?.[0] || plant.image_url ? (
                    <img
                      src={resolveApiUrl(plant.image_urls?.[0] || plant.image_url)}
                      alt={plant.name}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-leaf-sage/50 to-leaf-forest/25 text-base font-semibold text-leaf-forest">
                      No image
                    </div>
                  )}
                  {Array.isArray(plant.image_urls) && plant.image_urls.length > 1 && (
                    <div className="absolute right-3 top-3 rounded-full bg-leaf-forest/90 px-3 py-1 text-base font-semibold uppercase tracking-[0.18em] text-white">
                      +{plant.image_urls.length - 1}
                    </div>
                  )}
                </div>
                <p className="line-clamp-2 text-lg font-semibold text-leaf-forest">
                  {plant.name}
                </p>
                <p className="mt-1 text-lg text-leaf-moss">{plant.category}</p>
                {(plant.short_description || plant.description) && (
                  <p className="mt-3 line-clamp-2 overflow-hidden text-ellipsis text-lg leading-8 text-leaf-moss">
                    {String(plant.short_description || plant.description).trim()}
                  </p>
                )}
                <p className="mt-4 text-lg font-semibold text-leaf-deep">
                  ₹{Number(plant.price).toFixed(0)}
                </p>
                <div className="mt-auto flex gap-2 pt-4">
                  <Button variant="secondary" onClick={() => setEditingPlant(plant)} className="flex-1">
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDeletePlant(plant.id)}
                    className="flex-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base uppercase tracking-[0.22em] text-leaf-moss">Orders</p>
            <p className="mt-2 text-base text-leaf-deep">Accept or reject customer requests.</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => (typeof onRefreshOrders === 'function' ? onRefreshOrders() : window.location.reload())}
          >
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="glass-panel p-8 text-center text-leaf-moss">
            Loading orders...
          </div>
        ) : error ? (
          <div className="glass-panel p-8 text-center text-rose-700">{error}</div>
        ) : orders.length === 0 ? (
          <div className="glass-panel p-8 text-center text-leaf-moss">
            No orders yet. Customer requests will appear here.
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              updatingStatus={updatingOrderId === order.id}
              onUpdateStatus={handleUpdateStatus}
            />
          ))
        )}
      </div>

    </section>
  );
}
