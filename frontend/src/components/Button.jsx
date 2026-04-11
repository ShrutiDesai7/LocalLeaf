export function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}) {
  const variants = {
    primary:
      'bg-leaf-forest text-white hover:bg-leaf-deep focus:ring-leaf-moss',
    secondary:
      'bg-white text-leaf-forest border border-leaf-moss/20 hover:bg-leaf-sage/40 focus:ring-leaf-sage',
    ghost:
      'bg-transparent text-leaf-forest hover:bg-leaf-sage/40 focus:ring-leaf-sage'
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
