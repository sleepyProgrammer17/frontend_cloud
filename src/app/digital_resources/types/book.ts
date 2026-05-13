//book.ts

export interface Book {
    id: string
    title: string

    author: string

    category?: string | null


    category_name?: string | null

    copies_total?: number | null

    copies_available: number 

    isbn: string | null

    year: number

    abstract: string
    keywords: string[]

    type?: string | null

    publisher?: string | null

    imageUrl: string | null

    timesBorrowed?: number

}