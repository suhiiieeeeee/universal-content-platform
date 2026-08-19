import Link from "next/link"
import { Database } from "lucide-react"

export function AuthShell({
  children,
  panelTitle,
  panelBody,
}: {
  children: React.ReactNode
  panelTitle: string
  panelBody: string
}) {
  return (
    <div className="grid min-h-svh w-full lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 md:p-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold">
          <Database className="size-4" />
          Datakit
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">{children}</div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Datakit. Structured content, one API.
        </p>
      </div>
      <div className="relative hidden flex-col justify-between overflow-hidden border-l border-border bg-card p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
        <div className="relative z-10 max-w-sm">
          <h2 className="text-balance text-2xl font-semibold tracking-tight">{panelTitle}</h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">{panelBody}</p>
        </div>
        <div className="relative z-10 rounded-lg border border-border bg-background/80 p-4 font-mono text-xs leading-relaxed text-muted-foreground backdrop-blur">
          <div className="mb-2 flex gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/60" />
            <span className="size-2.5 rounded-full bg-warning/60" />
            <span className="size-2.5 rounded-full bg-success/60" />
          </div>
          <pre className="overflow-x-auto">
            <code>{`GET /api/v1/u/acme/posts
{
  "data": [
    { "slug": "hello-world",
      "title": "Hello, world" }
  ],
  "meta": { "version": 4 }
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
