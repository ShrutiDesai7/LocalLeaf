import { Link } from 'react-router-dom';

function FooterLink({ to, children }) {
  return (
    <Link className="text-lg sm:text-xl text-leaf-moss transition hover:text-leaf-forest" to={to}>
      {children}
    </Link>
  );
}

export function Footer({ user }) {
  const year = new Date().getFullYear();
  const isOwner = user?.role === 'owner';

  return (
    <footer className="mt-10 border-t border-white/50 bg-white/40">
      <div className="container-wide py-14">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.8fr_0.85fr]">
          <div>
            <Link className="inline-flex items-baseline gap-2" to="/">
              <span className="font-display text-4xl text-leaf-forest">LocalLeaf</span>
              <span className="text-lg uppercase tracking-[0.28em] text-leaf-moss">
                Nursery Ordering
              </span>
            </Link>
            <p className="mt-5 max-w-md text-xl leading-8 text-leaf-moss">
              Discover healthy plants from nearby nurseries and request them in just a few
              clicks - built for customers and nursery owners alike.
            </p>
            <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/70 px-5 py-2.5 text-lg font-semibold uppercase tracking-[0.18em] text-leaf-forest">
              Fresh picks, local roots
            </div>
          </div>

          <div>
            <p className="text-xl font-semibold uppercase tracking-[0.22em] text-leaf-forest">
              Explore
            </p>
            <div className="mt-5 grid gap-3">
              <FooterLink to="/">Browse plants</FooterLink>
              {user ? (
                <>
                  <FooterLink to="/account">Your account</FooterLink>
                  {isOwner && <FooterLink to="/dashboard">Owner dashboard</FooterLink>}
                  {isOwner && <FooterLink to="/nursery">Subscription</FooterLink>}
                </>
              ) : (
                <>
                  <FooterLink to="/register">Create account</FooterLink>
                  <FooterLink to="/login">Log in</FooterLink>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-xl font-semibold uppercase tracking-[0.22em] text-leaf-forest">
              Support
            </p>
            <p className="mt-5 text-xl leading-8 text-leaf-moss">
              Quick answers, policies, and ways to reach us.
            </p>
            <div className="mt-5 grid gap-3">
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/contact">Contact Us</FooterLink>
              <FooterLink to="/terms">Terms &amp; Conditions</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/60 pt-7">
          <p className="text-lg uppercase tracking-[0.22em] text-leaf-moss">
            (c) {year} LocalLeaf. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
