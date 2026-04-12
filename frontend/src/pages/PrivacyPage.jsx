export function PrivacyPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="glass-panel p-6 sm:p-10">
        <p className="text-sm uppercase tracking-[0.26em] text-leaf-moss">Help / Support</p>
        <h1 className="mt-4 font-display text-5xl leading-tight text-leaf-forest">
          Privacy Policy
        </h1>
        <p className="mt-6 text-sm leading-7 text-leaf-moss">
          This is a placeholder Privacy Policy page. Replace this with your real policy describing what data
          you collect (e.g., name, phone), why you collect it, and how users can request deletion.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] bg-white/70 p-6">
            <p className="font-semibold text-leaf-forest">Data we store</p>
            <p className="mt-2 text-sm leading-6 text-leaf-moss">
              Account profile details and order request information.
            </p>
          </div>
          <div className="rounded-[24px] bg-white/70 p-6">
            <p className="font-semibold text-leaf-forest">Your controls</p>
            <p className="mt-2 text-sm leading-6 text-leaf-moss">
              Update your profile and contact support for account removal requests.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

