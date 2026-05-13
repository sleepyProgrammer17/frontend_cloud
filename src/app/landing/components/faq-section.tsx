"use client"

import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

type FaqItem = {
  value: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    value: 'item-1',
    question: 'How do I register for a library account?',
    answer:
      'All currently enrolled students, faculty, and staff are automatically registered in the library system. Simply present your valid school ID at the circulation desk to activate your account. You can also log in to the online library portal using your institutional email and student/employee ID number to access digital resources.',
  },
  {
    value: 'item-2',
    question: 'How many books can I borrow and for how long?',
    answer:
      'Undergraduate students may borrow up to 3 books at a time for a loan period of 7 days. Graduate students and faculty may borrow up to 5 books for up to 14 days. Reference materials, theses, and special collections are for room use only and cannot be taken out of the library premises.',
  },
  {
    value: 'item-3',
    question: 'How do I renew or reserve a book?',
    answer:
      'Books can be renewed once online through the library portal, via phone, or in person at the circulation desk — provided no other patron has placed a hold on the item. To reserve a book currently on loan, log in to the library system, search for the title, and click "Place a Hold." You will be notified via email when the book is ready for pickup.',
  },
  {
    value: 'item-4',
    question: 'What are the penalties for overdue or lost books?',
    answer:
      'Overdue books are charged a fine of ₱5.00 per day per item. Lost or damaged books must be replaced with the same edition or a newer one, or the borrower may pay the current market value plus a processing fee of ₱50.00. Unpaid fines or unreturned materials will result in a hold on your school records, including enrollment and graduation clearance.',
  },
  {
    value: 'item-5',
    question: 'Can I access library resources online?',
    answer:
      'Yes! The library provides 24/7 access to a range of digital resources including e-books, academic journals, and research databases such as JSTOR, ProQuest, and EBSCOhost. Log in using your institutional credentials through the library portal. Off-campus access is available via VPN. Contact the reference desk for assistance with database access.',
  },
  {
    value: 'item-6',
    question: 'How do I request a book or resource that is not in the collection?',
    answer:
      'You may submit a book purchase request through the library portal or by filling out a request form at the reference desk. Faculty members may also recommend titles for acquisition by contacting the librarian directly. For urgent research needs, the library also offers an inter-library loan (ILL) service that allows borrowing materials from partner institutions.',
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about borrowing, returning, accessing resources, and using the college library system. Still have questions? Our librarians are ready to assist!
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className='bg-transparent'>
            <div className='p-0'>
              <Accordion type='single' collapsible className='space-y-5'>
                {faqItems.map(item => (
                  <AccordionItem key={item.value} value={item.value} className='rounded-md !border bg-transparent'>
                    <AccordionTrigger className='cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-[state=open]:border-b'>
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full'>
                          <CircleHelp className='size-5' />
                        </div>
                        <span className='text-start font-semibold'>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='p-4 bg-transparent'>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Support CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Still have questions? Our library staff are happy to help.
            </p>
            <Button className='cursor-pointer' asChild>
              <a href="#contact">
                Contact the Library
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }