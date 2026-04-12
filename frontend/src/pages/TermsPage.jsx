export function TermsPage() {
  return (
    <section className="container-wide py-10">
      <div className="glass-panel p-6 sm:p-10">
        <p className="text-base uppercase tracking-[0.26em] text-leaf-moss">Help / Support</p>
        <h1 className="mt-4 font-display text-5xl leading-tight text-leaf-forest">
          Terms &amp; Conditions
        </h1>

        <div className="mt-8 rounded-[24px] bg-white/70 p-6">
          <p className="text-lg font-semibold text-leaf-forest">Summary</p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-lg leading-8 text-leaf-moss">
            <li>Users submit requests; nurseries confirm availability.</li>
            <li>Do not share passwords or misuse accounts.</li>
            <li>Policies may change with notice.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
