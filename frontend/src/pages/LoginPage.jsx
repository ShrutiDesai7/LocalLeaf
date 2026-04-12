import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export function LoginPage({ onLogin, loggingIn }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <section className="container-wide py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[36px] bg-leaf-forest px-6 py-10 text-white shadow-card sm:px-8">
          <p className="text-sm uppercase tracking-[0.26em] text-white/65">
            Welcome back
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight">
            Log in to LocalLeaf.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/78">
            Use the phone + password you registered with. Owners can manage plants
            and orders from the nursery dashboard.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8">
          <h2 className="font-display text-3xl text-leaf-forest">Login</h2>
          <p className="mt-2 text-sm leading-6 text-leaf-moss">
            New here?{' '}
            <Link className="font-semibold text-leaf-forest underline" to="/register">
              Create an account
            </Link>
            .
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              onLogin({ phone, password });
            }}
          >
            <input
              required
              className="field-input"
              placeholder="Phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <input
              required
              className="field-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button className="w-full" disabled={loggingIn} type="submit">
              {loggingIn ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
