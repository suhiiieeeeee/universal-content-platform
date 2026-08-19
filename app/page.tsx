import Link from "next/link"
import { ArrowRight, Braces, Database, LockKeyhole, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  { icon: Braces, title: "One API surface", description: "Ship content to any frontend through predictable, typed JSON endpoints." },
  { icon: Database, title: "Structured by default", description: "Model collections and fields once. Keep your content clean as it grows." },
  { icon: LockKeyhole, title: "Private until ready", description: "Draft, review, publish, and control visibility without redeploying." },
]

export default function Page() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Datakit home">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Database className="size-4" /></span>
          <span className="font-mono text-sm font-semibold tracking-tight">datakit<span className="text-primary">_</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild><Link href="/login">Sign in</Link></Button>
          <Button asChild><Link href="/signup">Start building <ArrowRight data-icon="inline-end" /></Link></Button>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:px-8 lg:pb-32 lg:pt-24">
        <div className="flex flex-col gap-8">
          <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">
            <Zap className="size-3 text-primary" /> Content infrastructure for small teams
          </div>
          <div className="flex flex-col gap-5">
            <h1 className="max-w-3xl text-balance font-mono text-5xl font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">Your content.<br /><span className="text-primary">One API.</span></h1>
            <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground">Datakit is the calm, developer-first CMS for teams who want to manage structured content without touching JSON files or redeploying their frontend.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild><Link href="/signup">Create your account <ArrowRight data-icon="inline-end" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/login">Open dashboard</Link></Button>
          </div>
          <p className="font-mono text-xs text-muted-foreground">No credit card · Built for Next.js, Astro, and any HTTP client</p>
        </div>

        <div className="relative rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-primary/5">
          <div className="flex items-center justify-between border-b border-border px-2 pb-4 font-mono text-xs text-muted-foreground"><span>GET /api/v1/docs</span><span className="text-success">200 OK</span></div>
          <pre className="overflow-x-auto px-2 py-5 font-mono text-sm leading-7 text-muted-foreground"><code>{`{
  "data": {
    "title": "A quieter way to ship",
    "slug": "a-quieter-way-to-ship",
    "status": "published",
    "author": "Datakit team"
  },
  "meta": { "version": 3 }
}`}</code></pre>
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 font-mono text-xs text-secondary-foreground"><span className="size-2 rounded-full bg-success" /> Live content, ready when you are.</div>
        </div>
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-px bg-border md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => <article key={title} className="flex flex-col gap-4 bg-background p-8 lg:p-10"><Icon className="size-5 text-primary" /><h2 className="font-mono text-base font-semibold">{title}</h2><p className="text-sm leading-6 text-muted-foreground">{description}</p></article>)}
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">A quieter workflow</p>
          <h2 className="mt-3 text-balance font-mono text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Model once. Edit clearly. Publish with confidence.</h2>
        </div>
        <div className="grid gap-px border border-border bg-border md:grid-cols-3">
          {[
            ["01", "Define", "Create a collection with the fields your product actually needs."],
            ["02", "Compose", "Write structured content in a focused editor with drafts and history."],
            ["03", "Deliver", "Use one predictable endpoint across your website, app, or device."],
          ].map(([number, title, description]) => (
            <article key={number} className="flex min-h-48 flex-col justify-between gap-8 bg-background p-6 lg:p-8">
              <span className="font-mono text-xs text-muted-foreground">{number}</span>
              <div className="flex flex-col gap-2"><h3 className="font-mono text-base font-semibold">{title}</h3><p className="text-sm leading-6 text-muted-foreground">{description}</p></div>
            </article>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-border px-6 py-8 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>datakit_</span><span>Content should be easy to change.</span></footer>
    </main>
  )
}
