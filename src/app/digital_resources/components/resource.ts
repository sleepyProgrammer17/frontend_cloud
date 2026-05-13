//resource.ts

export interface Resource {
  id: string
  title: string

  author: string

  category?: string | null

  category_name?: string | null
  year: number

  abstract: string
  keywords: string[]

  type?: string | null       

  publisher?: string | null

  readUrl: string | null
  imageUrl: string | null

  timesViewed?: number
  uploadedBy?: string | null
}