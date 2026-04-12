export function ContactPage() {
  return (
    <section className="container-wide py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[36px] bg-leaf-forest px-6 py-10 text-white shadow-card sm:px-8">
          <p className="text-base uppercase tracking-[0.26em] text-white/65">Help / Support</p>
          <h1 className="mt-4 font-display text-5xl leading-tight">Contact Us</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/82">
            Reach out for account help, order questions, or nursery onboarding. We typically respond within 1-2 business days.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-10">
          <h2 className="font-display text-3xl text-leaf-forest">Support channels</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] bg-white/70 p-6">
              <p className="text-lg uppercase tracking-[0.22em] text-leaf-moss">Email</p>
              <p className="mt-2 text-lg text-leaf-deep">
                <a className="font-semibold text-leaf-forest underline" href="mailto:support@localleaf.example">
                  support@localleaf.example
                </a>
              </p>
              <p className="mt-3 text-lg leading-8 text-leaf-moss">
                Include your registered phone number for faster assistance.
              </p>
            </div>

            <div className="rounded-[24px] bg-white/70 p-6">
              <p className="text-lg uppercase tracking-[0.22em] text-leaf-moss">Business hours</p>
              <p className="mt-3 text-lg leading-8 text-leaf-moss">
                Mon-Fri, 10:00-18:00 IST
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
