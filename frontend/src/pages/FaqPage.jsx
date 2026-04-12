export function FaqPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="glass-panel p-6 sm:p-10">
        <p className="text-sm uppercase tracking-[0.26em] text-leaf-moss">Help / Support</p>
        <h1 className="mt-4 font-display text-5xl leading-tight text-leaf-forest">
          FAQ
        </h1>

        <div className="mt-8 space-y-6">
          <div className="rounded-[24px] bg-white/70 p-6">
            <p className="font-semibold text-leaf-forest">How do plant requests work?</p>
            <p className="mt-2 text-sm leading-6 text-leaf-moss">
              Browse plants, submit a request, and the nursery owner will confirm availability and next steps.
            </p>
          </div>
          <div className="rounded-[24px] bg-white/70 p-6">
            <p className="font-semibold text-leaf-forest">Do I need an account?</p>
            <p className="mt-2 text-sm leading-6 text-leaf-moss">
              Yes. Creating an account helps nurseries contact you and keep your requests in one place.
            </p>
          </div>
          <div className="rounded-[24px] bg-white/70 p-6">
            <p className="font-semibold text-leaf-forest">I am a nursery owner - what next?</p>
            <p className="mt-2 text-sm leading-6 text-leaf-moss">
              Register as an owner to manage plants and handle incoming customer requests from the dashboard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

