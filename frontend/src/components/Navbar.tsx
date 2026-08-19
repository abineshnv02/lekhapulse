export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

        <a
          href="/"
          className="text-2xl font-extrabold tracking-tight"
        >
          Lekha<span className="text-pink-500">Pulse</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            How It Works
          </a>

          <a
            href="#why-lekhapulse"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Why LekhaPulse
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10 sm:block"
          >
            Login
          </a>

          <a
            href="/register"
            className="rounded-lg bg-gradient-to-r from-red-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:scale-105"
          >
            Get Started
          </a>
        </div>

      </nav>
    </header>
  );
}
