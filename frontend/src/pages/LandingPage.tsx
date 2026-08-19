import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#050505] text-white">

      <Navbar />

      {/* HERO */}
      <section className="relative isolate flex min-h-screen items-center px-6 pt-32 lg:px-8">

        {/* Red background glow */}
        <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-red-700/20 blur-[140px]" />

        <div className="mx-auto max-w-7xl">

          <div className="max-w-4xl">

            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-pink-400">
              AI-powered accounting workflow
            </p>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">

              Turn messy transactions into

              <span className="block bg-gradient-to-r from-red-500 via-pink-500 to-fuchsia-400 bg-clip-text text-transparent">
                organized accounting.
              </span>

            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-400 sm:text-xl">
              LekhaPulse helps accountants automatically categorize
              client transactions using AI, review suggestions, and
              confirm accurate accounting categories in one place.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">

              <a
                href="/register"
                className="rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-7 py-4 text-center font-bold shadow-xl shadow-pink-500/20 transition hover:scale-105"
              >
                Start Using LekhaPulse
              </a>

              <a
                href="#how-it-works"
                className="rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-center font-semibold text-gray-200 backdrop-blur transition hover:bg-white/10"
              >
                See How It Works
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* PROBLEM */}
      <section
        id="why-lekhapulse"
        className="relative border-t border-white/10 px-6 py-28 lg:px-8"
      >

        <div className="mx-auto max-w-7xl">

          <div className="max-w-3xl">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
              The problem
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Accounting teams shouldn't spend their day categorizing
              transactions manually.
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-400">
              Client transaction data can arrive with inconsistent
              descriptions, different sources, and thousands of records.
              Reviewing every transaction manually is repetitive and
              time-consuming.
            </p>

          </div>

        </div>

      </section>


      {/* FEATURES */}
      <section
        id="features"
        className="relative px-6 py-28 lg:px-8"
      >

        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
              What LekhaPulse does
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              A smarter transaction workflow.
            </h2>

          </div>


          <div className="mt-16 grid gap-6 md:grid-cols-3">

            <FeatureCard
              number="01"
              title="AI Categorization"
              description="Automatically analyze transaction descriptions and generate accounting category suggestions with confidence scores."
            />

            <FeatureCard
              number="02"
              title="Accountant Review"
              description="Review AI-generated suggestions before they become confirmed accounting classifications."
            />

            <FeatureCard
              number="03"
              title="Organized Client Data"
              description="Keep clients, transactions, categories, and accounting workflows organized inside one secure platform."
            />

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="border-y border-white/10 bg-white/[0.02] px-6 py-28 lg:px-8"
      >

        <div className="mx-auto max-w-7xl">

          <div className="max-w-3xl">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
              How it works
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              From transaction to confirmed category.
            </h2>

          </div>


          <div className="mt-16 grid gap-6 md:grid-cols-4">

            <WorkflowStep
              number="01"
              title="Add"
              description="Add a client transaction to LekhaPulse."
            />

            <WorkflowStep
              number="02"
              title="Analyze"
              description="Our AI analyzes the transaction description and financial context."
            />

            <WorkflowStep
              number="03"
              title="Review"
              description="The accountant reviews the suggested category and confidence."
            />

            <WorkflowStep
              number="04"
              title="Confirm"
              description="Approve the category and create a confirmed accounting classification."
            />

          </div>

        </div>

      </section>


      {/* AI SECTION */}
      <section className="relative px-6 py-32 lg:px-8">

        <div className="absolute right-0 top-1/2 -z-10 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-pink-600/10 blur-[120px]" />

        <div className="mx-auto max-w-7xl">

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-red-950/40 via-black to-pink-950/20 p-8 sm:p-12 lg:p-16">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
              Built with AI
            </p>

            <h2 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Let AI handle repetitive categorization.
              Let accountants make the final decision.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              LekhaPulse is designed around human review. AI provides
              suggestions; accountants remain in control of confirmed
              classifications.
            </p>

          </div>

        </div>

      </section>


      {/* FINAL CTA */}
      <section className="px-6 py-28 text-center lg:px-8">

        <div className="mx-auto max-w-3xl">

          <h2 className="text-4xl font-black tracking-tight sm:text-6xl">
            Ready to simplify transaction categorization?
          </h2>

          <p className="mt-6 text-lg text-gray-400">
            Start building a faster accounting workflow with LekhaPulse.
          </p>

          <a
            href="/register"
            className="mt-10 inline-block rounded-xl bg-gradient-to-r from-red-600 to-pink-500 px-8 py-4 font-bold shadow-xl shadow-pink-500/20 transition hover:scale-105"
          >
            Create Your Account
          </a>

        </div>

      </section>


      <Footer />

    </div>
  );
}


function FeatureCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition hover:-translate-y-1 hover:border-pink-500/30 hover:bg-white/[0.05]">

      <div className="text-sm font-bold text-pink-400">
        {number}
      </div>

      <h3 className="mt-6 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-gray-400">
        {description}
      </p>

    </div>
  );
}


function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">

      <div className="text-5xl font-black text-white/10">
        {number}
      </div>

      <h3 className="mt-4 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-400">
        {description}
      </p>

    </div>
  );
}
