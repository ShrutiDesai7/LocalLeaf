export function PrivacyPage() {
  return (
    <section className="container-wide py-10">
      <div className="glass-panel p-6 sm:p-10">
        <p className="text-base uppercase tracking-[0.26em] text-leaf-moss">Help / Support</p>
        <h1 className="mt-4 font-display text-5xl leading-tight text-leaf-forest">
          Privacy Policy
        </h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] bg-white/70 p-6">
            <p className="text-lg font-semibold text-leaf-forest">Data we store</p>
            <p className="mt-3 text-lg leading-8 text-leaf-moss">
              Account profile details and order request information.
            </p>
          </div>
          <div className="rounded-[24px] bg-white/70 p-6">
            <p className="text-lg font-semibold text-leaf-forest">Your controls</p>
            <p className="mt-3 text-lg leading-8 text-leaf-moss">
              Update your profile and contact support for account removal requests.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
