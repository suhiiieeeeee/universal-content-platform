import { MailCheck } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"

export default function SignupSuccessPage() {
  return (
    <AuthShell
      panelTitle="Almost there"
      panelBody="Confirm your email to unlock your files, collections, and public API."
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-accent">
          <MailCheck className="size-6 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We sent a confirmation link to your inbox. Click it to activate your account before signing in.
          </p>
        </div>
      </div>
    </AuthShell>
  )
}
