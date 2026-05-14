export interface Copy {
  id:          string
  copy_number: number
  status:      string
  barcode:     string
  book:        string
  created_at:  string
}

export interface Resource {
  id:    string
  title: string

  author:         string
  category?:      string | null
  category_name?: string | null

  isbn:             string | null
  copies_total:     number | null
  copies_available: number
  copies:           Copy[]          // ← add this

  abstract:  string
  keywords:  string[]

  type?:        string | null
  year?:        string | null
  call_number?: string | null
  publisher?:   string | null

  imageUrl: string | null

  timesBorrowed?: number
  uploadedBy?:    string | null
}