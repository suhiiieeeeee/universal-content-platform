"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createCollection } from "@/lib/actions/collections"

export function NewCollectionDialog({ workspaceId, workspaceSlug }: { workspaceId: string; workspaceSlug: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await createCollection(workspaceId, formData)
    setPending(false)
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.")
      return
    }
    setOpen(false)
    router.push(`/dashboard/workspaces/${workspaceSlug}/collections/${result.data?.slug}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus data-icon="inline-start" />New collection</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono">New collection</DialogTitle>
          <DialogDescription>Collections group documents that share a schema.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="collection-name">Name</FieldLabel>
              <Input id="collection-name" name="name" placeholder="Blog posts" required autoFocus disabled={pending} />
            </Field>
            <Field>
              <FieldLabel htmlFor="collection-description">Description (optional)</FieldLabel>
              <Textarea id="collection-description" name="description" rows={2} disabled={pending} />
            </Field>
            <Field>
              <FieldLabel htmlFor="collection-visibility">Default visibility</FieldLabel>
              <Select name="default_visibility" defaultValue="private" disabled={pending}>
                <SelectTrigger id="collection-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
              Create collection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
