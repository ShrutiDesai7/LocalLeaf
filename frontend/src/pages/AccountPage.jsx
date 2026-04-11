import { useEffect, useMemo, useState } from 'react';
import { api, resolveApiUrl } from '../api';
import { Button } from '../components/Button';

function OrderSummaryCard({ order }) {
  const title = order.plant_name || `Plant #${order.plant_id}`;
  const nurseryLine = order.nursery_name ? ` · ${order.nursery_name}` : '';
  const price = order.plant_price ? Number(order.plant_price).toFixed(0) : null;
  const orderedAt = order.created_at ? new Date(order.created_at) : null;
  const image = order.plant_image_url
    ? resolveApiUrl(order.plant_image_url)
    : 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=600&q=80';

  return (
    <article className="rounded-3xl bg-white/70 p-5">
      <div className="flex gap-4">
        <img alt={title} className="h-20 w-20 rounded-3xl object-cover" src={image} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-leaf-forest">{title}</p>
          <p className="mt-1 truncate text-sm text-leaf-moss">
            {order.plant_category || 'Plant'}
            {nurseryLine}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-leaf-deep">
            <span className="rounded-full bg-leaf-sage/40 px-3 py-1">
              {order.status}
            </span>
            <span className="rounded-full bg-white px-3 py-1">
              Price: {price ? `Rs. ${price}` : '—'}
            </span>
            <span className="rounded-full bg-white px-3 py-1">
              {orderedAt ? `Ordered: ${orderedAt.toLocaleString()}` : 'Ordered: —'}
            </span>
          </div>

          <p className="mt-3 text-sm text-leaf-moss">Delivery: {order.address}</p>
        </div>
      </div>
    </article>
  );
}

export function AccountPage({ user }) {
  const [message, setMessage] = useState('');

  const [nursery, setNursery] = useState(null);
  const [nurseryLoading, setNurseryLoading] = useState(false);
  const [nurseryError, setNurseryError] = useState('');

  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('');
  const [docFile, setDocFile] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const subscriptionLabel = useMemo(() => {
    const status = nursery?.subscription_status;
    if (status === 'active') return 'Active';
    if (status === 'inactive') return 'Inactive';
    if (status === 'pending') return 'Pending';
    return '—';
  }, [nursery]);

  const currentOrders = useMemo(
    () => orders.filter((order) => order.status === 'pending'),
    [orders]
  );

  const historyOrders = useMemo(
    () => orders.filter((order) => order.status !== 'pending'),
    [orders]
  );

  useEffect(() => {
    setMessage('');

    if (user?.role === 'owner') {
      loadNursery();
      loadDocuments();
    }

    if (user?.role === 'customer') {
      loadOrders();
    }
  }, [user?.role]);

  async function loadNursery() {
    try {
      setNurseryLoading(true);
      setNurseryError('');
      const data = await api.getMyNursery();
      setNursery(data.nursery);
    } catch (err) {
      setNurseryError(err.message);
    } finally {
      setNurseryLoading(false);
    }
  }

  async function loadDocuments() {
    try {
      setDocsLoading(true);
      setDocsError('');
      const data = await api.listNurseryDocuments();
      setDocs(data.documents || []);
    } catch (err) {
      setDocsError(err.message);
    } finally {
      setDocsLoading(false);
    }
  }

  async function loadOrders() {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      const data = await api.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function handleSubscribe() {
    try {
      setMessage('');
      const data = await api.subscribe(1);
      setNursery(data.nursery);
      setMessage('Subscription activated.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleUploadDocument() {
    if (!docType || !docFile) {
      setMessage('Please provide doc type and choose a file.');
      return;
    }

    try {
      setUploading(true);
      setMessage('');
      await api.uploadNurseryDocument({ doc_type: docType, file: docFile });
      setDocType('');
      setDocFile(null);
      await loadDocuments();
      setMessage('Document uploaded.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteDocument(id) {
    try {
      setMessage('');
      await api.deleteNurseryDocument(id);
      await loadDocuments();
      setMessage('Document deleted.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!user) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[36px] bg-leaf-forest px-6 py-8 text-white shadow-card sm:px-8">
        <p className="text-sm uppercase tracking-[0.24em] text-white/70">Account</p>
        <h1 className="mt-4 font-display text-4xl">
          {user.role === 'owner' ? 'Nursery Owner' : 'Customer'} profile
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
          {user.name} · {user.phone}
        </p>
      </div>

      {message && (
        <div className="mt-6 glass-panel p-5 text-sm text-leaf-forest">{message}</div>
      )}

      {user.role === 'customer' && (
        <div className="mt-8 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-leaf-moss">
                  Current Orders
                </p>
                <p className="mt-2 text-sm text-leaf-deep">
                  Your active requests (pending).
                </p>
              </div>
              <Button variant="secondary" onClick={loadOrders}>
                Refresh
              </Button>
            </div>

            {ordersLoading ? (
              <p className="mt-4 text-sm text-leaf-moss">Loading orders...</p>
            ) : ordersError ? (
              <p className="mt-4 text-sm text-rose-700">{ordersError}</p>
            ) : currentOrders.length === 0 ? (
              <p className="mt-4 text-sm text-leaf-moss">No current orders.</p>
            ) : (
              <div className="mt-5 space-y-4">
                {currentOrders.map((order) => (
                  <OrderSummaryCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-leaf-moss">
                  Past Orders
                </p>
                <p className="mt-2 text-sm text-leaf-deep">
                  Accepted or rejected requests.
                </p>
              </div>
              <Button variant="secondary" onClick={() => setShowHistory((s) => !s)}>
                {showHistory ? 'Hide past orders' : 'View past orders'}
              </Button>
            </div>

            {showHistory && (
              <>
                {ordersLoading ? (
                  <p className="mt-4 text-sm text-leaf-moss">Loading orders...</p>
                ) : ordersError ? (
                  <p className="mt-4 text-sm text-rose-700">{ordersError}</p>
                ) : historyOrders.length === 0 ? (
                  <p className="mt-4 text-sm text-leaf-moss">No past orders yet.</p>
                ) : (
                  <div className="mt-5 space-y-4">
                    {historyOrders.map((order) => (
                      <OrderSummaryCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {user.role === 'owner' && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-leaf-moss">
              Nursery Info
            </p>
            {nurseryLoading ? (
              <p className="mt-4 text-sm text-leaf-moss">Loading nursery...</p>
            ) : nurseryError ? (
              <p className="mt-4 text-sm text-rose-700">{nurseryError}</p>
            ) : nursery ? (
              <div className="mt-4 space-y-2 text-sm text-leaf-deep">
                <p>
                  <span className="font-semibold">Nursery:</span> {nursery.name}
                </p>
                <p>
                  <span className="font-semibold">Address:</span> {nursery.address}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="rounded-full bg-leaf-sage/40 px-4 py-2 text-sm text-leaf-forest">
                    Subscription: {subscriptionLabel}
                  </div>
                  {nursery.subscription_status !== 'active' && (
                    <Button variant="secondary" onClick={handleSubscribe}>
                      Activate Subscription
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-leaf-moss">No nursery profile found.</p>
            )}
          </div>

          <div className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-leaf-moss">
              Documents
            </p>
            <p className="mt-2 text-sm leading-6 text-leaf-deep">
              Upload required documents for verification.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                className="field-input"
                placeholder="Document type (e.g. GST, License)"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              />
              <input
                className="field-input"
                type="file"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="mt-4 flex gap-3">
              <Button disabled={uploading} onClick={handleUploadDocument}>
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
              <Button variant="secondary" onClick={loadDocuments}>
                Refresh List
              </Button>
            </div>

            {docsLoading ? (
              <p className="mt-4 text-sm text-leaf-moss">Loading documents...</p>
            ) : docsError ? (
              <p className="mt-4 text-sm text-rose-700">{docsError}</p>
            ) : docs.length === 0 ? (
              <p className="mt-4 text-sm text-leaf-moss">No documents uploaded yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-3 rounded-3xl bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-leaf-forest">
                        {doc.doc_type}
                      </p>
                      <p className="truncate text-sm text-leaf-moss">
                        {doc.original_name}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        className="rounded-full bg-leaf-sage/40 px-4 py-2 text-sm text-leaf-forest"
                        href={resolveApiUrl(`/uploads/${doc.stored_name}`)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                      <Button
                        variant="secondary"
                        className="border-rose-200 text-rose-700 hover:bg-rose-50"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
