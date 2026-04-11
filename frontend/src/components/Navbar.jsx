import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './Button';

export function Navbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-leaf-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link className="block text-left" to="/">
            <p className="font-display text-2xl text-leaf-forest">LocalLeaf</p>
            <p className="text-xs uppercase tracking-[0.24em] text-leaf-moss">
              Nursery Ordering System
            </p>
          </Link>
        </div>

        <nav className="hidden items-center gap-5 md:flex">
          <Link
            className={`text-sm transition ${
              location.pathname === '/' ? 'text-leaf-forest' : 'text-leaf-moss'
            }`}
            to="/"
          >
            Explore Plants
          </Link>
          {user && (
            <Link
              className={`text-sm transition ${
                location.pathname === '/account'
                  ? 'text-leaf-forest'
                  : 'text-leaf-moss'
              }`}
              to="/account"
            >
              Account
            </Link>
          )}
          {user?.role === 'owner' && (
            <Link
              className={`text-sm transition ${
                location.pathname === '/dashboard'
                  ? 'text-leaf-forest'
                  : 'text-leaf-moss'
              }`}
              to="/dashboard"
            >
              Dashboard
            </Link>
          )}
          {user?.role === 'owner' && (
            <Link
              className={`text-sm transition ${
                location.pathname === '/nursery'
                  ? 'text-leaf-forest'
                  : 'text-leaf-moss'
              }`}
              to="/nursery"
            >
              Subscription
            </Link>
          )}
          {!user && (
            <Link
              className={`text-sm transition ${
                location.pathname === '/register'
                  ? 'text-leaf-forest'
                  : 'text-leaf-moss'
              }`}
              to="/register"
            >
              Register
            </Link>
          )}
          {!user && (
            <Link
              className={`text-sm transition ${
                location.pathname === '/login'
                  ? 'text-leaf-forest'
                  : 'text-leaf-moss'
              }`}
              to="/login"
            >
              Login
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden rounded-full bg-white/70 px-4 py-2 text-sm text-leaf-forest sm:block">
                {user.name} · {user.role === 'owner' ? 'Nursery Owner' : 'Customer'}
              </div>
              <Button variant="secondary" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate('/login')}>Login</Button>
          )}
        </div>
      </div>
    </header>
  );
}
