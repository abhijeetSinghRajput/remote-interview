"use client"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  IconArrowRight,
  IconBan,
  IconBrain,
  IconChartBar,
  IconCodeblock,
  IconLock,
  IconMicrophone,
  IconVideo,
} from "@tabler/icons-react"
import { Show, SignIn, SignInButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"

const FEATURES = [
  {
    icon: <IconCodeblock />,
    title: "Live Code Editor",
    desc: "Real-time collaborative coding with syntax highlighting across 10+ languages.",
    accent: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/20",
  },
  {
    icon: <IconVideo />,
    title: "HD Video Calls",
    desc: "Crystal-clear video conferencing built directly into the interview flow.",
    accent: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/20",
  },
  {
    icon: <IconBrain />,
    title: "AI Problem Bank",
    desc: "Curated DSA and JavaScript challenges with auto-grading and test cases.",
    accent: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20",
  },
  {
    icon: <IconChartBar />,
    title: "Interview Analytics",
    desc: "Track candidate performance, code quality, and problem-solving patterns.",
    accent: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20",
  },
  {
    icon: <IconLock />,
    title: "Secure Sessions",
    desc: "End-to-end encrypted interviews with role-based access control via Clerk.",
    accent: "from-rose-500/20 to-rose-500/5",
    border: "border-rose-500/20",
  },
  {
    icon: <IconVideo />,
    title: "Instant Rooms",
    desc: "Create and share interview rooms in one click. No downloads, no friction.",
    accent: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/20",
  },
]

const STEPS = [
  {
    step: "01",
    title: "Create a Room",
    desc: "Set up your interview session in seconds with your preferred language and problem set.",
  },
  {
    step: "02",
    title: "Invite Candidate",
    desc: "Share a secure link. They join instantly — no account needed.",
  },
  {
    step: "03",
    title: "Code Together",
    desc: "Real-time editor, video call, and whiteboard all in one unified workspace.",
  },
  {
    step: "04",
    title: "Review & Decide",
    desc: "Get structured reports and playback to make confident hiring decisions.",
  },
]

const TESTIMONIALS = [
  {
    name: "Priya Mehta",
    role: "Engineering Lead @ Razorpay",
    avatar: "PM",
    quote:
      "We cut our interview setup time by 80%. The live editor is silky smooth — candidates always compliment it.",
  },
  {
    name: "David Chen",
    role: "CTO @ Finstack",
    avatar: "DC",
    quote:
      "Finally an interview tool that doesn't feel like it was built in 2012. Clean, fast, and the problem bank is excellent.",
  },
  {
    name: "Aisha Patel",
    role: "Senior Recruiter @ Atlassian",
    avatar: "AP",
    quote:
      "The analytics alone are worth it. I can show hiring managers exactly how a candidate thinks through a problem.",
  },
]

const STATS = [
  { value: "12k+", label: "Interviews conducted" },
  { value: "340+", label: "Companies hiring" },
  { value: "98%", label: "Uptime SLA" },
  { value: "4.9★", label: "Average rating" },
]

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-background font-sans antialiased">
      {/* No ambient background */}

      {/* ── Navbar ── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border border-b bg-[#09090b]/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold">
              R
            </div>
            <span className="font-semibold tracking-tight">
              RemoteInterview
            </span>
          </div>

          {/* CTA */}
          <div className="items-center gap-3 md:flex">
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton>
                <Button size="sm" className="font-medium">
                  Sign in
                </Button>
              </SignInButton>
            </Show>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative px-6 pt-40 pb-28 text-center">
          <div className="mx-auto max-w-4xl">
            <Badge
            // variant="outline"
            >
              ✦ Now with AI-powered suggestions
            </Badge>

            <h1 className="mb-6 text-5xl leading-[1.05] font-bold tracking-tight md:text-7xl">
              Technical interviews done right.
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              A collaborative interview platform with live code editing, video
              calls, and a curated problem bank — all in one seamless workspace.
            </p>

            <div className="flex items-center justify-center gap-3">
              <Show when="signed-out">
                <SignInButton>
                  <Button size="lg">Start interviewing free</Button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Button asChild size="lg">
                  <Link href="/dashboard" className="h-12 px-6">
                    Dashboard
                    <IconArrowRight />
                  </Link>
                </Button>
              </Show>
              <Button asChild variant="outline" size="lg" className="h-12 px-6">
                <Link href="/problems">
                Explore
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero preview card */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            {/* No gradient overlay */}
            <div className="overflow-hidden rounded-2xl border border-muted shadow-2xl backdrop-blur-sm">
              {/* Fake window bar */}
              <div className="/2 flex items-center gap-2 border border-b px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-rose-500/60" />
                <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 text-center">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    remoteinterview.io/room/abc-xyz-123
                  </span>
                </div>
              </div>
              {/* Fake editor layout */}
              <div className="grid h-72 grid-cols-5 md:h-96">
                {/* Sidebar */}
                <div className="col-span-1 hidden border border-r bg-black/20 p-3 md:block">
                  <p className="mb-3 text-[10px] tracking-widest text-muted-foreground uppercase">
                    Problems
                  </p>
                  {["Two Sum", "Valid Parens", "LRU Cache", "Debounce"].map(
                    (p, i) => (
                      <div
                        key={p}
                        className={`mb-1 cursor-pointer rounded px-2 py-1.5 text-[11px] ${
                          i === 0
                            ? "bg-primary/20"
                            : "text-muted-foreground hover:text-muted-foreground"
                        }`}
                      >
                        {p}
                      </div>
                    )
                  )}
                </div>
                {/* Code area */}
                <div className="col-span-5 overflow-hidden bg-black/30 p-4 text-left font-mono text-[12px] md:col-span-3">
                  <div className="mb-2 text-[10px] text-muted-foreground">
                    solution.js
                  </div>
                  <pre className="leading-relaxed">
                    {`<span class="text-violet-400">function</span> <span class="text-cyan-400">twoSum</span>(nums, target) {
  <span class="text-violet-400">const</span> map = <span class="text-violet-400">new</span> Map();
  
  <span class="text-violet-400">for</span> (<span class="text-violet-400">let</span> i = <span class="text-amber-400">0</span>; i < nums.length; i++) {
    <span class="text-violet-400">const</span> comp = target - nums[i];
    
    <span class="text-violet-400">if</span> (map.has(comp)) {
      <span class="text-violet-400">return</span> [map.get(comp), i];
    }
    map.set(nums[i], i);
  }
}`}
                  </pre>
                </div>
                {/* Video panel */}
                <div className="col-span-1 hidden flex-col gap-3 border border-l bg-black/20 p-3 md:flex">
                  <div className="flex flex-1 items-center justify-center rounded-lg text-2xl">
                    👤
                  </div>
                  <div className="flex flex-1 items-center justify-center rounded-lg border bg-card/20 text-2xl">
                    👤
                  </div>
                  <div className="flex justify-center gap-2">
                    <div className="/5 flex h-7 w-7 items-center justify-center rounded-full text-[10px]">
                      <IconMicrophone className="size-4 text-muted-foreground" />
                    </div>
                    <div className="/5 flex h-7 w-7 items-center justify-center rounded-full text-[10px]">
                      <IconVideo className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-[10px]">
                      <IconBan className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="border border-y px-6 py-16">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold tracking-tight md:text-4xl">
                  {value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <Badge>Everything you need</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                Built for serious hiring teams.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Every feature designed around one goal — finding the right
                engineer, faster.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon, title, desc, accent, border }) => (
                <Card
                  key={title}
                  className={`cursor-default border border-muted bg-card transition-transform duration-200 hover:scale-[1.01]`}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 text-3xl">{icon}</div>
                    <h3 className="mb-2 text-base font-semibold">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="border border-t px-6 py-28">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <Badge
                variant="outline"
                className="mb-4 border text-xs text-muted-foreground"
              >
                How it works
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                From zero to interview in 60 seconds.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {STEPS.map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="group relative rounded-2xl border bg-card p-6 pt-10 transition-colors duration-200"
                >
                  <span className="font-black/4 absolute top-4 right-6 font-mono text-6xl text-muted transition-colors group-hover:text-foreground/8">
                    {step}
                  </span>
                  <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="border border-t px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <Badge
                variant="outline"
                className="mb-4 border text-xs text-muted-foreground"
              >
                Testimonials
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                Trusted by engineering teams.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {TESTIMONIALS.map(({ name, role, avatar, quote }) => (
                <Card
                  key={name}
                  className="/3 hover:/5 border-white/8 transition-colors duration-200"
                >
                  <CardContent className="p-6">
                    <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                      "{quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-xs font-medium">
                          {avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-6 py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="relative overflow-hidden rounded-3xl border border-muted bg-card p-12 md:p-20">
              {/* No radial gradient overlay */}
              <h2 className="relative mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                Ready to hire better?
              </h2>
              <p className="relative mb-10 text-lg text-muted-foreground">
                Join hundreds of teams running technical interviews the modern
                way.
              </p>
              <div className="relative flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 px-10 text-base font-semibold"
                >
                  Get started — it's free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="/5 hover:/10 h-12 border px-8"
                >
                  Book a demo
                </Button>
              </div>
              <p className="relative mt-6 text-xs text-muted-foreground">
                No credit card · 10 free interviews/month · Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border border-t px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold">
                R
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                RemoteInterview
              </span>
            </div>
            <div className="flex items-center gap-8">
              {["Privacy", "Terms", "Docs", "Status", "Contact"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-xs text-muted-foreground transition-colors hover:text-muted-foreground"
                >
                  {item}
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              © 2025 RemoteInterview. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
