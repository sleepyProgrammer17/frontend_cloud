"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

type Testimonial = {
  name: string
  role: string
  image: string
  quote: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Angela Reyes',
    role: 'BS Nursing, 3rd Year',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-1',
    quote:
      'The library has been my second home throughout college. The nursing references and medical journals available here are incredibly up-to-date, and the staff always help me find exactly what I need for my case studies.',
  },
  {
    name: 'Marco Santiago',
    role: 'BS Computer Science, 4th Year',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-1',
    quote: 'The online database access is a game changer. I can access research papers and e-books even off-campus. Highly recommend setting up your library account early.',
  },
  {
    name: 'Isabelle Cruz',
    role: 'AB Communication, 2nd Year',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-2',
    quote:
      "I love the quiet study rooms — they're perfect for group work and thesis writing. The librarians are also very approachable and always willing to guide you on how to properly cite your sources.",
  },
  {
    name: 'Rafael Domingo',
    role: 'College Librarian',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-2',
    quote:
      'Our goal has always been to make the library a welcoming and resource-rich environment. With the new library system, processing borrowings and managing reservations has become significantly faster and more efficient.',
  },
  {
    name: 'Camille Flores',
    role: 'MA Education, Graduate Student',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-3',
    quote:
      "As a graduate student, I rely heavily on the library for thesis research. The inter-library loan service has been invaluable — I've accessed materials from partner universities that I wouldn't have found anywhere else. The reference librarians are genuinely knowledgeable and patient.",
  },
  {
    name: 'Jerome Villanueva',
    role: 'BS Accountancy, 3rd Year',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-3',
    quote: "The library's online renewal system saves me so much time. I no longer have to rush back to campus just to extend my borrowed books during exam season.",
  },
  {
    name: 'Patricia Lim',
    role: 'Faculty, Department of English',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-4',
    quote:
      "I regularly recommend the library to my students for research purposes. The journal subscriptions and digital archives have grown substantially over the past few years. My students' research papers have noticeably improved in quality since they started using the library databases.",
  },
  {
    name: 'Kevin Tan',
    role: 'BS Architecture, 4th Year',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-4',
    quote: 'The architecture and design section is well-curated. I always find relevant references for my studio projects. The large-format printing service nearby is also a huge bonus.',
  },
  {
    name: 'Sophia Mendez',
    role: 'BS Psychology, 1st Year',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-5',
    quote:
      'As a freshman, I was intimidated at first, but the library orientation really helped me understand how everything works. The staff were so patient in walking me through the catalog system and showing me where the psychology section is.',
  },
  {
    name: 'Adrian Bautista',
    role: 'Student Council President',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-5',
    quote: 'The library is central to student life here. The study spaces, printing facilities, and helpful staff make it one of the most important resources on campus.',
  },
  {
    name: 'Tricia Gonzales',
    role: 'BS Education, 4th Year',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-6',
    quote:
      "For my teaching practicum, the library's collection of lesson plan references and educational psychology books was a lifesaver. Being able to reserve books online and pick them up the next day made my busy schedule so much more manageable.",
  },
  {
    name: 'Luis Manalo',
    role: 'BS Civil Engineering, 2nd Year',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-6',
    quote: 'The technical references for engineering are solid. I found textbooks here that were too expensive to buy. The library truly makes quality education more accessible.',
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="container mx-auto px-8 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">Testimonials</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Voices from Our Library Community
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from students, faculty, and staff who rely on our college library every day to learn, research, and grow.
          </p>
        </div>

        {/* Testimonials Masonry Grid */}
        <div className="columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3 lg:gap-4">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="mb-6 break-inside-avoid shadow-none lg:mb-4">
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="bg-muted size-12 shrink-0">
                    <AvatarImage
                      alt={testimonial.name}
                      src={testimonial.image}
                      loading="lazy"
                      width="120"
                      height="120"
                    />
                    <AvatarFallback>
                      {testimonial.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <a href="#" onClick={e => e.preventDefault()} className="cursor-pointer">
                      <h3 className="font-medium hover:text-primary transition-colors">{testimonial.name}</h3>
                    </a>
                    <span className="text-muted-foreground block text-sm tracking-wide">
                      {testimonial.role}
                    </span>
                  </div>
                </div>

                <blockquote className="mt-4">
                  <p className="text-sm leading-relaxed text-balance">{testimonial.quote}</p>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}