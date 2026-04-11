import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { api, setAuthToken } from './api';
import { Navbar } from './components/Navbar';
import { AccountPage } from './pages/AccountPage';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NurserySettingsPage } from './pages/NurserySettingsPage';

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
  const [orders, setOrders] = useState([]);

  const [plantsLoading, setPlantsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [plantsError, setPlantsError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [globalMessage, setGlobalMessage] = useState('');

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
    fetchPlants();
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

  async function fetchPlants(params = {}) {
    try {
      setPlantsLoading(true);
      setPlantsError('');
      const data = await api.getPlants(params);
      setPlants(Array.isArray(data?.plants) ? data.plants : []);
    } catch (error) {
      setPlantsError(error.message);
    } finally {
      setPlantsLoading(false);
    }
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

  async function handleLogin(payload) {
    try {
      setLoggingIn(true);
      setGlobalMessage('');
      const data = await api.login(payload);
      setToken(data.token);
      window.localStorage.setItem(tokenKey, data.token);
      setUser(data.user);
      window.localStorage.setItem(userKey, JSON.stringify(data.user));
      setGlobalMessage('Logged in successfully.');
      navigate(data.user.role === 'owner' ? '/dashboard' : '/');
    } catch (error) {
      setGlobalMessage(error.message);
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleRegister(payload) {
    try {
      setRegistering(true);
      setGlobalMessage('');
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

      setGlobalMessage('Account created successfully.');
      navigate(data.user.role === 'owner' ? '/dashboard' : '/');
    } catch (error) {
      setGlobalMessage(error.message);
    } finally {
      setRegistering(false);
    }
  }

  async function handleCreateOrder(payload) {
    try {
      setOrderSubmitting(true);
      setGlobalMessage('');
      await api.createOrder(payload);
      setGlobalMessage('Plant request submitted.');
      if (user?.role === 'owner') {
        fetchOrders();
      }
    } catch (error) {
      setGlobalMessage(error.message);
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
    setGlobalMessage('Logged out.');
    navigate('/');
  }

  return (
    <div className="page-shell">
      <Navbar onLogout={handleLogout} user={user} />

      {(authLoading || globalMessage) && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white px-5 py-4 text-sm text-leaf-forest shadow-card">
            {authLoading ? 'Loading session...' : globalMessage}
          </div>
        </div>
      )}

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
          element={<RegisterPage onRegister={handleRegister} registering={registering} />}
        />
        <Route
          path="/dashboard"
          element={
            user?.role === 'owner' ? (
              <DashboardPage error={ordersError} loading={ordersLoading} orders={orders} user={user} />
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
          element={user ? <AccountPage user={user} /> : <Navigate replace to="/login" />}
        />
      </Routes>
    </div>
  );
}
