import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './Button';

export function Navbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-leaf-cream/85 backdrop-blur">
      <div className="container-wide flex items-center justify-between py-5">
        <div>
          <Link className="block text-left" to="/">
            <p className="font-display text-3xl text-leaf-forest">LocalLeaf</p>
            <p className="text-base uppercase tracking-[0.24em] text-leaf-moss">
              Nursery Ordering System
            </p>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            className={`text-xl font-semibold transition ${
              location.pathname === '/'
                ? 'text-leaf-forest'
                : 'text-leaf-deep/80 hover:text-leaf-forest'
            }`}
            to="/"
          >
            Explore Plants
          </Link>
          {user && (
            <Link
              className={`text-xl font-semibold transition ${
                location.pathname === '/account'
                  ? 'text-leaf-forest'
                  : 'text-leaf-deep/80 hover:text-leaf-forest'
              }`}
              to="/account"
            >
              Account
            </Link>
          )}
          {user?.role === 'owner' && (
            <Link
              className={`text-xl font-semibold transition ${
                location.pathname === '/dashboard'
                  ? 'text-leaf-forest'
                  : 'text-leaf-deep/80 hover:text-leaf-forest'
              }`}
              to="/dashboard"
            >
              Dashboard
            </Link>
          )}
          {user?.role === 'owner' && (
            <Link
              className={`text-xl font-semibold transition ${
                location.pathname === '/nursery'
                  ? 'text-leaf-forest'
                  : 'text-leaf-deep/80 hover:text-leaf-forest'
              }`}
              to="/nursery"
            >
              Subscription
            </Link>
          )}
          {!user && (
            <Link
              className={`text-xl font-semibold transition ${
                location.pathname === '/register'
                  ? 'text-leaf-forest'
                  : 'text-leaf-deep/80 hover:text-leaf-forest'
              }`}
              to="/register"
            >
              Register
            </Link>
          )}
          {!user && (
            <Link
              className={`text-xl font-semibold transition ${
                location.pathname === '/login'
                  ? 'text-leaf-forest'
                  : 'text-leaf-deep/80 hover:text-leaf-forest'
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
              <div className="hidden rounded-full bg-white/80 px-4 py-2 text-lg text-leaf-forest sm:block">
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
