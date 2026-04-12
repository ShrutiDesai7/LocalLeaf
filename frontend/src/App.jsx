import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { api, setAuthToken } from './api';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { AccountPage } from './pages/AccountPage';
import { ContactPage } from './pages/ContactPage';
import { DashboardPage } from './pages/DashboardPage';
import { FaqPage } from './pages/FaqPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { RegisterPage } from './pages/RegisterPage';
import { NurserySettingsPage } from './pages/NurserySettingsPage';
import { TermsPage } from './pages/TermsPage';

const tokenKey = 'localleaf-token';
const userKey = 'localleaf-user';

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => window.localStorage.getItem(tokenKey) || '');
  const [user, setUser] = useState(() => {
    const saved = window.localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : null;
  });

  const [plants, setPlants] = useState([]);
  const [plantsPagination, setPlantsPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });
  const [orders, setOrders] = useState([]);

  const [plantsLoading, setPlantsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [plantsError, setPlantsError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [flash, setFlash] = useState(null);

  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    setAuthToken(token);

    if (token) {
      loadSession();
    }
  }, [token]);

  useEffect(() => {
    if (!flash?.text || flash.kind !== 'success') return;
    const timer = setTimeout(() => setFlash(null), 2000);
    return () => clearTimeout(timer);
  }, [flash?.text, flash?.kind]);

  useEffect(() => {
    fetchPlants({ page: 1, limit: 24 });
  }, []);

  useEffect(() => {
    if (user?.role === 'owner') {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  async function loadSession() {
    try {
      setAuthLoading(true);
      const data = await api.me();
      setUser(data.user);
      window.localStorage.setItem(userKey, JSON.stringify(data.user));
    } catch (error) {
      handleLogout();
    } finally {
      setAuthLoading(false);
    }
  }

  async function fetchPlants(params = {}, options = {}) {
    try {
      setPlantsLoading(true);
      setPlantsError('');
      const data = await api.getPlants(params);
      const nextPlants = Array.isArray(data?.plants) ? data.plants : [];
      const nextPagination = data?.pagination || null;

      if (options.append) {
        setPlants((current) => {
          const byId = new Map(current.map((plant) => [plant.id, plant]));
          for (const plant of nextPlants) {
            byId.set(plant.id, plant);
          }
          return Array.from(byId.values());
        });
      } else {
        setPlants(nextPlants);
      }

      if (nextPagination) {
        setPlantsPagination(nextPagination);
      }
    } catch (error) {
      setPlantsError(error.message);
    } finally {
      setPlantsLoading(false);
    }
  }

  async function loadMorePlants() {
    if (plantsLoading) return;
    if (plantsPagination.page >= plantsPagination.totalPages) return;

    await fetchPlants(
      { page: plantsPagination.page + 1, limit: plantsPagination.limit },
      { append: true }
    );
  }

  async function fetchOrders() {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      const data = await api.getOrders();
      setOrders(data);
    } catch (error) {
      setOrdersError(error.message);
    } finally {
      setOrdersLoading(false);
    }
  }

  function patchOrder(updated) {
    if (!updated?.id) return;
    setOrders((current) =>
      current.map((order) => (order.id === updated.id ? { ...order, ...updated } : order))
    );
  }

  async function handleLogin(payload) {
    try {
      setLoggingIn(true);
      setFlash(null);
      const data = await api.login(payload);
      setToken(data.token);
      window.localStorage.setItem(tokenKey, data.token);
      setUser(data.user);
      window.localStorage.setItem(userKey, JSON.stringify(data.user));
      setFlash({ kind: 'success', text: 'Logged in successfully.' });
      navigate(data.user.role === 'owner' ? '/dashboard' : '/');
    } catch (error) {
      setFlash({ kind: 'error', text: error.message });
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleRegister(payload) {
    try {
      setRegistering(true);
      setFlash(null);
      const { documents, ...registerPayload } = payload || {};
      const data = await api.register(registerPayload);
      setAuthToken(data.token);
      setToken(data.token);
      window.localStorage.setItem(tokenKey, data.token);
      setUser(data.user);
      window.localStorage.setItem(userKey, JSON.stringify(data.user));

      if (data.user.role === 'owner' && documents?.length) {
        for (const doc of documents) {
          await api.uploadNurseryDocument({
            doc_type: doc.doc_type,
            file: doc.file
          });
        }
      }

      setFlash({ kind: 'success', text: 'Account created successfully.' });
      navigate(data.user.role === 'owner' ? '/dashboard' : '/');
    } catch (error) {
      setFlash({ kind: 'error', text: error.message });
    } finally {
      setRegistering(false);
    }
  }

  async function handleCreateOrder(payload) {
    try {
      setOrderSubmitting(true);
      setFlash(null);
      await api.createOrder(payload);
      setFlash({ kind: 'success', text: 'Plant request submitted.' });
      if (user?.role === 'owner') {
        fetchOrders();
      }
    } catch (error) {
      setFlash({ kind: 'error', text: error.message });
      throw error;
    } finally {
      setOrderSubmitting(false);
    }
  }

  function handleLogout() {
    setToken('');
    setUser(null);
    setOrders([]);
    setAuthToken('');
    window.localStorage.removeItem(tokenKey);
    window.localStorage.removeItem(userKey);
    setFlash({ kind: 'success', text: 'Logged out.' });
    navigate('/');
  }

  return (
    <div className="page-shell">
      <Navbar onLogout={handleLogout} user={user} />

      <Toast
        kind={authLoading ? 'success' : flash?.kind}
        text={authLoading ? 'Loading session...' : flash?.text}
      />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                error={plantsError}
                loading={plantsLoading}
                onCreateOrder={handleCreateOrder}
                orderSubmitting={orderSubmitting}
                plants={plants}
                plantsPagination={plantsPagination}
                onLoadMorePlants={loadMorePlants}
                user={user}
              />
            }
          />
          <Route
            path="/login"
            element={<LoginPage loggingIn={loggingIn} onLogin={handleLogin} />}
          />
          <Route
            path="/register"
            element={
              <RegisterPage onRegister={handleRegister} registering={registering} />
            }
          />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route
            path="/dashboard"
            element={
              user?.role === 'owner' ? (
                <DashboardPage
                  error={ordersError}
                  loading={ordersLoading}
                  onOrderPatched={patchOrder}
                  onRefreshOrders={fetchOrders}
                  onPlantsChanged={() =>
                    fetchPlants(
                      { page: 1, limit: plantsPagination?.limit || 24 },
                      { append: false }
                    )
                  }
                  orders={orders}
                  user={user}
                />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          <Route
            path="/nursery"
            element={
              user?.role === 'owner' ? (
                <NurserySettingsPage user={user} />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          <Route
            path="/account"
            element={
              user ? (
                <AccountPage
                  user={user}
                  onUserUpdated={(next) => {
                    setUser(next);
                    window.localStorage.setItem(userKey, JSON.stringify(next));
                  }}
                />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
        </Routes>
      </main>

      <Footer user={user} />
    </div>
  );
}
