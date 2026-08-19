"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { History, Loader2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { restoreDocumentVersion } from "@/lib/actions/documents"
import type { DocumentVersion } from "@/lib/types"

export function VersionHistory({
  documentId,
  versions,
}: {
  documentId: string
  versions: Pick<DocumentVersion, "id" | "version_number" | "status" | "visibility" | "created_at">[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  async function handleRestore(versionId: string) {
    setRestoringId(versionId)
    const result = await restoreDocumentVersion(documentId, versionId)
    setRestoringId(null)
    if (result.ok) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <History data-icon="inline-start" />
          History ({versions.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-mono">Version history</SheetTitle>
          <SheetDescription>Previous saved states of this document. Restoring creates a new version.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4">
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No previous versions yet.</p>
          ) : (
            versions
              .slice()
              .reverse()
              .map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Version {v.version_number}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {v.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(v.created_at).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={restoringId === v.id}
                    onClick={() => handleRestore(v.id)}
                  >
                    {restoringId === v.id ? (
                      <Loader2 className="animate-spin" data-icon="inline-start" />
                    ) : (
                      <RotateCcw data-icon="inline-start" />
                    )}
                    Restore
                  </Button>
                </div>
              ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
