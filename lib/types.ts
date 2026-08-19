export type DocumentStatus = "draft" | "published" | "archived"
export type DocumentVisibility = "private" | "public" | "unlisted"

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export type SchemaFieldType =
  | "string"
  | "text"
  | "number"
  | "boolean"
  | "url"
  | "date"
  | "array"
  | "object"
  | "markdown"
  | "json"

export interface SchemaField {
  key: string
  label: string
  type: SchemaFieldType
  required: boolean
}

export interface Schema {
  id: string
  user_id: string
  workspace_id?: string
  name: string
  fields: SchemaField[]
  created_at: string
  updated_at: string
}

export interface Collection {
  id: string
  user_id: string
  workspace_id?: string
  name: string
  slug: string
  description: string | null
  schema_id: string | null
  default_visibility: DocumentVisibility
  created_at: string
  updated_at: string
  document_count?: number
}

export interface DocumentRecord {
  id: string
  user_id: string
  collection_id: string
  slug: string
  data: Record<string, unknown>
  status: DocumentStatus
  visibility: DocumentVisibility
  version_count: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  data: Record<string, unknown>
  status: DocumentStatus
  visibility: DocumentVisibility
  created_by: string | null
  created_at: string
}

export interface ApiKey {
  id: string
  user_id: string
  workspace_id?: string
  name: string
  key_prefix: string
  key_hash: string
  created_by: string | null
  last_used_at: string | null
  created_at: string
  revoked_at: string | null
}

export interface AuditLog {
  id: string
  user_id: string | null
  workspace_id?: string | null
  actor_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}
