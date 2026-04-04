import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  PiggyBank,
  ReceiptText,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { LogoMark } from "@/components/app/logo-mark";
import { redirectIfAuthenticated } from "@/data/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Finance Map | A calmer way to manage money",
  description:
    "Finance Map helps you spread money into real-life wallets, track spending clearly, and build a more intentional personal finance routine.",
};

const principles = [
  "One balance can hold many responsibilities.",
  "Wallets make those responsibilities visible.",
  "Clear money creates calmer decisions.",
] as const;

const features = [
  {
    title: "Purpose-led wallets",
    description:
      "Separate bills, savings, essentials, and free spending the way people already do mentally.",
    icon: WalletCards,
  },
  {
    title: "Simple tracking",
    description:
      "Record income, expenses, and transfers in one place without the weight of a traditional finance tool.",
    icon: ReceiptText,
  },
  {
    title: "Savings with intention",
    description:
      "Keep goals visible so saving becomes an active decision, not whatever happens to be left over.",
    icon: PiggyBank,
  },
] as const;

const audience = [
  "People who want to know what is actually safe to spend",
  "Developers, freelancers, workers, and students balancing multiple priorities",
  "Anyone who wants money management to feel elegant, clear, and usable",
] as const;

const snapshotStats = [
  { value: "6", label: "wallets for real-life money roles" },
  { value: "1", label: "clear view across spending and saving" },
  { value: "24/7", label: "confidence before you spend" },
] as const;

const usageSteps = [
  {
    step: "01",
    title: "Create the wallets your life already needs",
    description:
      "Start with the real categories behind your money like bills, savings, essentials, transport, and flexible spending.",
  },
  {
    step: "02",
    title: "Assign your money with intention",
    description:
      "When income comes in, spread it across those wallets so each amount already has a job before spending begins.",
  },
  {
    step: "03",
    title: "Track what moves",
    description:
      "Record expenses, transfers, and income updates so the picture stays accurate and each wallet remains trustworthy.",
  },
] as const;

const habitSteps = [
  {
    title: "Check in briefly every day",
    description:
      "A quick look before you spend keeps the system useful. You do not need a long session, just a small moment of awareness.",
  },
  {
    title: "Review and rebalance each week",
    description:
      "Move money when priorities change, top up the wallets under pressure, and keep your plan aligned with real life.",
  },
  {
    title: "Keep the routine light",
    description:
      "The habit works because it is simple. Open the app, understand your position, make one good decision, and move on.",
  },
] as const;

export default async function WelcomePage() {
  await redirectIfAuthenticated();

  return (
    <main className="min-h-screen bg-white text-[#171411]">
      <section className="px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white px-5 py-5 md:px-8 md:py-7">
          <header className="flex flex-col gap-5 pb-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <LogoMark />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2b7d61]">
                  Finance Map
                </p>
                <p className="text-sm text-black/50">Personal finance, designed with restraint</p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-4 text-sm text-black/58">
              <a href="#story" className="transition hover:text-black">
                Story
              </a>
              <a href="#features" className="transition hover:text-black">
                Features
              </a>
              <a href="#who" className="transition hover:text-black">
                Who it&apos;s for
              </a>
              <Button
                asChild
                className="rounded-full bg-[#1b1a18] px-5 text-[#f8f3ea] hover:bg-black"
              >
                <Link href="/auth/sign-up">Get started</Link>
              </Button>
            </nav>
          </header>

          <div className="grid gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-16">
            <section className="max-w-4xl">
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.06em] md:text-7xl">
                Money management,
                <br />
                with more grace and less noise.
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-8 text-black/62 md:text-lg">
                Finance Map is built around a simple idea: the money in your bank may sit
                in one place, but in real life it already has different jobs. So instead
                of managing one vague balance, you spread it into wallets that reflect how
                you actually live, spend, and save.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-[#1b1a18] px-7 text-[#f8f3ea] hover:bg-black"
                >
                  <Link href="/auth/sign-up">
                    Create your account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-black/12 bg-transparent px-7 text-[#171411] hover:bg-black/3"
                >
                  <Link href="/auth/sign-in">Sign in</Link>
                </Button>
              </div>

              <div className="mt-14 grid gap-4 md:grid-cols-3">
                {snapshotStats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.5rem] bg-[#f7f7f4] p-5">
                    <p className="text-4xl font-semibold tracking-[-0.06em] text-[#171411]">
                      {stat.value}
                    </p>
                    <p className="mt-3 max-w-[14rem] text-sm leading-6 text-black/56">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="flex flex-col justify-between rounded-[2rem] bg-[#f7f7f4] p-6 md:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2b7d61]">
                  The concept
                </p>
                <p className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.04em]">
                  Your account stores the money.
                  <br />
                  Your wallets define the money.
                </p>
              </div>

              <div className="mt-10 rounded-[1.5rem] bg-white p-5 shadow-[0_12px_30px_rgba(23,20,17,0.04)]">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6b3d]">
                      Monthly balance rhythm
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171411]">
                      Calm, visible, intentional
                    </p>
                  </div>
                  <span className="rounded-full bg-[#edf5f0] px-3 py-1 text-xs font-medium text-[#2b7d61]">
                    On track
                  </span>
                </div>

                <div className="mt-8 flex h-36 items-end gap-3">
                  {[
                    { h: "34%", tone: "bg-[#d7e8dd]" },
                    { h: "52%", tone: "bg-[#cadfce]" },
                    { h: "68%", tone: "bg-[#bdd6c3]" },
                    { h: "60%", tone: "bg-[#a8ccb3]" },
                    { h: "82%", tone: "bg-[#8fbea1]" },
                    { h: "74%", tone: "bg-[#2b7d61]" },
                  ].map((bar, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-3">
                      <div
                        className={`w-full rounded-full ${bar.tone}`}
                        style={{ height: bar.h }}
                      />
                      <span className="text-[10px] uppercase tracking-[0.18em] text-black/35">
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {principles.map((item) => (
                  <div key={item} className="pt-2 first:pt-0">
                    <p className="text-sm leading-7 text-black/62">{item}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="story" className="px-4 py-12 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8a6b3d]">
              The story behind it
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
              Built by Augustine Cobbold, first for himself, then for everyone else.
            </h2>

            <div className="mt-10 rounded-[1.75rem] bg-[#f7f7f4] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2b7d61]">
                Visual idea
              </p>
              <div className="mt-6 rounded-[1.5rem] bg-white p-5 shadow-[0_12px_30px_rgba(23,20,17,0.04)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-black/60">One income, many jobs</p>
                  <p className="text-sm font-semibold text-[#171411]">GHS 8,400</p>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { label: "Bills", width: "32%", color: "bg-[#1b1a18]" },
                    { label: "Savings", width: "24%", color: "bg-[#2b7d61]" },
                    { label: "Essentials", width: "20%", color: "bg-[#c7b28c]" },
                    { label: "Flex", width: "12%", color: "bg-[#d8ded7]" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-black/42">
                        <span>{item.label}</span>
                        <span>{item.width}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#efede8]">
                        <div
                          className={`h-2.5 rounded-full ${item.color}`}
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-base leading-8 text-black/64">
            <p>
              Augustine Cobbold is a developer who needed a better way to track his own
              finances. He wanted something clearer than a spreadsheet and more personal
              than a generic finance app.
            </p>
            <p>
              The insight was simple. Even when your money sits in one bank account, it
              does not behave like one thing. Some of it is for bills. Some is for saving.
              Some is for everyday life. Some should never be touched casually.
            </p>
            <p>
              Finance Map was designed around that truth. Wallets behave like real
              wallets, so you can spread your money with intention and understand how to
              spend it without second-guessing yourself.
            </p>
            <p>
              It began as a tool Augustine wanted to use every day. Then it became a
              product made available to anyone who wants more clarity, more structure, and
              a calmer relationship with money.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-4 md:px-6 md:py-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#181715] px-6 py-8 text-[#f8f3ea] md:px-8 md:py-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8dcbb1]">
              Product features
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
              A finance product that feels polished, thoughtful, and easy to return to.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article key={feature.title} className="rounded-[1.5rem] bg-white/[0.03] p-6 md:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/6">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/66">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8a6b3d]">
              Why it works
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
              Less pressure.
              <br />
              Better visibility.
              <br />
              More intentional spending.
            </h2>
          </div>

          <div className="space-y-5">
            {[
              "You can instantly see what money is meant for what.",
              "You stop treating savings like spare cash.",
              "You spend from context instead of from guesswork.",
            ].map((point) => (
              <div
                key={point}
                className="flex items-start gap-4 rounded-[1.25rem] bg-[#f7f7f4] p-5 text-base leading-8 text-black/64"
              >
                <Check className="mt-2 h-4 w-4 shrink-0 text-[#2b7d61]" />
                <p>{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-4 md:px-6 md:py-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#f7f7f4] px-6 py-8 md:px-8 md:py-10">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8a6b3d]">
                How to use it
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
                A clean system in
                <br />
                three simple steps.
              </h2>
              <p className="mt-6 max-w-md text-base leading-8 text-black/62">
                Finance Map works best when it mirrors your real money routine. Start
                simple, stay consistent, and let the wallets carry the structure.
              </p>
            </div>

            <div className="grid gap-4">
              {usageSteps.map((item) => (
                <article key={item.step} className="rounded-[1.5rem] bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2b7d61]">
                    Step {item.step}
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
                    {item.title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-black/64">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8a6b3d]">
              Make it a habit
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
              The goal is not more effort.
              <br />
              The goal is a better rhythm.
            </h2>
          </div>

          <div className="space-y-5">
            {habitSteps.map((item) => (
              <div key={item.title} className="rounded-[1.5rem] bg-[#f7f7f4] p-6">
                <h3 className="text-2xl font-semibold tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-black/64">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="who" className="px-4 py-4 md:px-6 md:py-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white px-6 py-8 md:px-8 md:py-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8a6b3d]">
                Who can use it
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
                Not just finance people.
                <br />
                Real people.
              </h2>
            </div>

            <div className="space-y-5">
              {audience.map((item, index) => {
                const Icon = index === 0 ? Sparkles : index === 1 ? WalletCards : PiggyBank;

                return (
                  <div
                    key={item}
                    className="flex items-start gap-4 rounded-[1.25rem] bg-[#f7f7f4] p-5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#efe7d9] text-[#2b7d61]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="max-w-xl text-base leading-8 text-black/64">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8a6b3d]">
            A final word
          </p>
          <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-6xl">
            Finance Map brings elegance to the everyday reality of managing money.
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-black/62 md:text-lg">
            Built from Augustine Cobbold&apos;s own need for a better system, then made
            available to everyone else. If you want more clarity without more clutter,
            this is where to begin.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[#1b1a18] px-7 text-[#f8f3ea] hover:bg-black"
            >
              <Link href="/auth/sign-up">
                Start with Finance Map
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-black/12 bg-transparent px-7 text-[#171411] hover:bg-black/3"
            >
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
