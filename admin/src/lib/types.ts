export type ProjectRow = {
  id: string
  title: string
  category: string | null
  location: string | null
  duration: string | null
  area: string | null
  cost: string | null
  description: string | null
  cover_url: string | null
  images: string[] | null
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type ReviewRow = {
  id: string
  name: string | null
  project_name: string | null
  rating: number | null
  content: string
  avatar_url: string | null
  approved: boolean
  pinned: boolean
  created_at: string
  updated_at: string
}

export type LeadRow = {
  id: string
  name: string
  phone: string
  message: string
  contact_type: "immediate" | "appointment"
  appointment_time: string | null
  status: "new" | "contacted" | "done"
  note: string | null
  created_at: string
  updated_at: string
}


