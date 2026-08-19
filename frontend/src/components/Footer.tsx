export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-12 lg:px-8">

      <div className="mx-auto max-w-7xl">

        <div className="grid gap-10 md:grid-cols-4">

          <div className="md:col-span-2">

            <a
              href="/"
              className="text-2xl font-extrabold tracking-tight"
            >
              Lekha<span className="text-pink-500">Pulse</span>
            </a>

            <p className="mt-4 max-w-md text-sm leading-6 text-gray-400">
              AI-powered transaction categorization built for modern
              accountants and accounting teams.
            </p>

          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Product
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>
                <a href="#features" className="hover:text-white">
                  Features
                </a>
              </li>

              <li>
                <a href="#how-it-works" className="hover:text-white">
                  How It Works
                </a>
              </li>

              <li>
                <a href="/register" className="hover:text-white">
                  Get Started
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Company
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>
                <a href="/login" className="hover:text-white">
                  Login
                </a>
              </li>

              <li>
                <a href="/register" className="hover:text-white">
                  Register
                </a>
              </li>

              <li>
                <a href="mailto:support@lekhapulse.io" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} LekhaPulse. All rights reserved.
          </p>

          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-gray-300">
              Privacy
            </a>

            <a href="/terms" className="hover:text-gray-300">
              Terms
            </a>
          </div>

        </div>

      </div>

    </footer>
  );
}
