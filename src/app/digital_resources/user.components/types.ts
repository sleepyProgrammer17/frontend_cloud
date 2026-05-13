export interface Book {
  id: number
  title: string
  author: string
  cover: string
  genre?: string
}

export interface BookOfYearEntry {
  rank: number
  title: string
  author: string
  genre: string
  color: string
}