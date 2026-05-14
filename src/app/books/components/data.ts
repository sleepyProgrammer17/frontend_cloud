import type { Book, BookOfYearEntry } from "./types"

export const trendingBooks: Book[] = [
  { id: 1, title: "A Palm from Our Future", author: "Simon Noah", cover: "https://covers.openlibrary.org/b/id/8739161-M.jpg", genre: "Fiction" },
  { id: 2, title: "The Black Universe", author: "Chris Mar Evans", cover: "https://covers.openlibrary.org/b/id/8228691-M.jpg", genre: "Sci-Fi" },
  { id: 3, title: "Nefarious Games", author: "Ana Park", cover: "https://covers.openlibrary.org/b/id/10909258-M.jpg", genre: "Thriller" },
  { id: 4, title: "The Four of Us", author: "Claudia Wilson", cover: "https://covers.openlibrary.org/b/id/8739398-M.jpg", genre: "Romance" },
  { id: 5, title: "Midnight Garden", author: "Lena Cole", cover: "https://xesriqgabqpgkbkubpll.supabase.co/storage/v1/object/public/tets/Academic-Book-Cover-Template-edit-online.png", genre: "Mystery" },
  { id: 6, title: "Broken Threads", author: "Marco Vidal", cover: "https://covers.openlibrary.org/b/id/10527843-M.jpg", genre: "Drama" },
  { id: 10, title: "Our Last Summer", author: "Celine Dubois", cover: "https://covers.openlibrary.org/b/id/8739398-M.jpg", genre: "Romance" },
  { id: 11, title: "The Quiet Hours", author: "James Farrow", cover: "https://xesriqgabqpgkbkubpll.supabase.co/storage/v1/object/public/tets/Academic-Book-Cover-Template-edit-online.png", genre: "Fiction" },
  { id: 12, title: "Urban Roots", author: "Zara Okonkwo", cover: "https://covers.openlibrary.org/b/id/10527843-M.jpg", genre: "Biography" },
]

export const recommendedBooks: Book[] = [
  { id: 7, title: "Journaling", author: "Laura Stoddard", cover: "https://covers.openlibrary.org/b/id/8739161-M.jpg", genre: "Self-Help" },
  { id: 8, title: "Things I Never Said", author: "Emilie Claessens", cover: "https://covers.openlibrary.org/b/id/8228691-M.jpg", genre: "Memoir" },
  { id: 9, title: "Daily Beauty Tips", author: "Olivia Wilson", cover: "https://covers.openlibrary.org/b/id/10909258-M.jpg", genre: "Lifestyle" },
  { id: 10, title: "Our Last Summer", author: "Celine Dubois", cover: "https://covers.openlibrary.org/b/id/8739398-M.jpg", genre: "Romance" },
  { id: 11, title: "The Quiet Hours", author: "James Farrow", cover: "https://xesriqgabqpgkbkubpll.supabase.co/storage/v1/object/public/tets/Academic-Book-Cover-Template-edit-online.png", genre: "Fiction" },
  { id: 12, title: "Urban Roots", author: "Zara Okonkwo", cover: "https://covers.openlibrary.org/b/id/10527843-M.jpg", genre: "Biography" },
  { id: 7, title: "Journaling", author: "Laura Stoddard", cover: "https://covers.openlibrary.org/b/id/8739161-M.jpg", genre: "Self-Help" },
  { id: 8, title: "Things I Never Said", author: "Emilie Claessens", cover: "https://covers.openlibrary.org/b/id/8228691-M.jpg", genre: "Memoir" },
  { id: 9, title: "Daily Beauty Tips", author: "Olivia Wilson", cover: "https://covers.openlibrary.org/b/id/10909258-M.jpg", genre: "Lifestyle" },
  { id: 10, title: "Our Last Summer", author: "Celine Dubois", cover: "https://covers.openlibrary.org/b/id/8739398-M.jpg", genre: "Romance" },
  { id: 11, title: "The Quiet Hours", author: "James Farrow", cover: "https://xesriqgabqpgkbkubpll.supabase.co/storage/v1/object/public/tets/Academic-Book-Cover-Template-edit-online.png", genre: "Fiction" },
  { id: 12, title: "Urban Roots", author: "Zara Okonkwo", cover: "https://covers.openlibrary.org/b/id/10527843-M.jpg", genre: "Biography" },
]

export const bookOfYear: BookOfYearEntry[] = [
  { rank: 1, title: "Happiness is Habit", author: "Margarita Perez", genre: "Self-Help", color: "#f59e0b" },
  { rank: 2, title: "The Value of Design", author: "Patrick Ness", genre: "Philosophy", color: "#8b5cf6" },
  { rank: 3, title: "The Guardian of Life", author: "Eric Drooker", genre: "Fiction", color: "#10b981" },
  { rank: 4, title: "Friend", author: "Daniel Gallego", genre: "Drama", color: "#3b82f6" },
  { rank: 5, title: "How to be Creative", author: "Kumbokaima", genre: "Self-Improvement", color: "#f43f5e" },
]