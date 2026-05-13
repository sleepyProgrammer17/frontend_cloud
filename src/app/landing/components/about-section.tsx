"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CardDecorator } from '@/components/ui/card-decorator'
import { BookOpen, Users, Search, ShieldCheck } from 'lucide-react'

const values = [
  {
    icon: BookOpen,
    title: 'Rich Collections',
    description: 'Access thousands of books, journals, theses, and digital resources carefully curated to support every course and research need.'
  },
  {
    icon: Search,
    title: 'Easy Resource Discovery',
    description: 'Our online catalog and database subscriptions make finding the right materials fast and straightforward — whether on-campus or off.'
  },
  {
    icon: Users,
    title: 'Community-Centered',
    description: 'We serve students, faculty, and staff with equal dedication, fostering a culture of learning, collaboration, and academic excellence.'
  },
  {
    icon: ShieldCheck,
    title: 'Trusted & Reliable',
    description: 'Our library system ensures accurate records, secure borrowing transactions, and up-to-date information you can always count on.'
  }
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            About the Library
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Your gateway to knowledge and learning
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            The college library is more than just a place to borrow books — it is a dynamic learning hub dedicated to supporting the academic success of every student and faculty member. With a growing collection of print and digital resources, modern study spaces, and a team of knowledgeable librarians, we are committed to making research and learning accessible to all.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 mb-12">
          {values.map((value, index) => (
            <Card key={index} className='group shadow-xs py-2'>
              <CardContent className='p-8'>
                <div className='flex flex-col items-center text-center'>
                  <CardDecorator>
                    <value.icon className='h-6 w-6' aria-hidden />
                  </CardDecorator>
                  <h3 className='mt-6 font-medium text-balance'>{value.title}</h3>
                  <p className='text-muted-foreground mt-3 text-sm'>{value.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-muted-foreground">📚 Proudly serving our academic community</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="cursor-pointer" asChild>
              <a href="#catalog">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse the Catalog
              </a>
            </Button>
            <Button size="lg" variant="outline" className="cursor-pointer" asChild>
              <a href="#contact">
                Contact a Librarian
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}