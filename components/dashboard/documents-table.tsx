"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog"
import { deleteDocument } from "@/lib/actions/documents"
import type { DocumentRecord, DocumentStatus } from "@/lib/types"

const STATUS_VARIANT: Record<DocumentStatus, "default" | "secondary" | "outline"> = {
  draft: "outline",
  published: "default",
  archived: "secondary",
}

export function DocumentsTable({
  documents,
  workspaceSlug,
  collectionSlug,
}: {
  documents: Pick<DocumentRecord, "id" | "slug" | "status" | "visibility" | "version_count" | "updated_at">[]
  workspaceSlug: string
  collectionSlug: string
}) {
  const router = useRouter()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Visibility</TableHead>
          <TableHead>Versions</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>
              <Link
                href={`/dashboard/workspaces/${workspaceSlug}/collections/${collectionSlug}/documents/${doc.slug}`}
                className="font-mono text-sm font-medium hover:underline"
              >
                {doc.slug}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[doc.status]} className="capitalize">
                {doc.status}
              </Badge>
            </TableCell>
            <TableCell className="capitalize text-muted-foreground">{doc.visibility}</TableCell>
            <TableCell className="text-muted-foreground">{doc.version_count}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(doc.updated_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    render={
                      <Link
                        href={`/dashboard/workspaces/${workspaceSlug}/collections/${collectionSlug}/documents/${doc.slug}`}
                      />
                    }
                  >
                    Open
                  </DropdownMenuItem>
                  <ConfirmDeleteDialog
                    trigger={
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive"
                      >
                        <Trash2 data-icon="inline-start" />
                        Delete
                      </DropdownMenuItem>
                    }
                    title="Delete document?"
                    description="This permanently deletes the document and all of its versions."
                    onConfirm={async () => {
                      await deleteDocument(doc.id)
                      router.refresh()
                    }}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
