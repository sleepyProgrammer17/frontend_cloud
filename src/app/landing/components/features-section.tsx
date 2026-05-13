"use client"

import {
  BookOpen,
  Search,
  Users,
  ArrowRight,
  BookMarked,
  Bell,
  Laptop,
  RefreshCw,
  ShieldCheck,

} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Image3D } from '@/components/image-3d'

const mainFeatures = [
  {
    icon: BookOpen,
    title: 'Extensive Collection',
    description: 'Thousands of books, journals, theses, and references across all academic disciplines.'
  },
  {
    icon: Search,
    title: 'Smart Catalog Search',
    description: 'Quickly find materials by title, author, subject, or ISBN through our online catalog.'
  },
  {
    icon: BookMarked,
    title: 'Online Reservations',
    description: 'Reserve books currently on loan and get notified when they are ready for pickup.'
  },
  {
    icon: Bell,
    title: 'Due Date Reminders',
    description: 'Automatic email alerts before your borrowed materials are due to avoid fines.'
  }
]

const secondaryFeatures = [
  {
    icon: Laptop,
    title: 'Remote Database Access',
    description: 'Access JSTOR, ProQuest, EBSCOhost, and more from anywhere via the library portal.'
  },
  {
    icon: RefreshCw,
    title: 'Easy Book Renewal',
    description: 'Renew borrowed items online without needing to visit the library in person.'
  },
  {
    icon: Users,
    title: 'Inter-Library Loans',
    description: 'Request materials from partner institutions when our collection does not have what you need.'
  },
  {
    icon: ShieldCheck,
    title: 'Secure Borrowing Records',
    description: 'Your borrowing history and account details are kept safe and accurately maintained.'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">Library Features</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything you need to support your academic journey
          </h2>
          <p className="text-lg text-muted-foreground">
            Our library system provides seamless access to print and digital resources, borrowing tools, and research support — designed to help students and faculty succeed.
          </p>
        </div>

        {/* First Feature Section */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 mb-24">
          {/* Left Image */}
          <Image3D
            lightSrc="feature-1-light.png"
            darkSrc="feature-1-dark.png"
            alt="Library catalog interface"
            direction="left"
          />
          {/* Right Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Borrow, reserve, and manage with ease
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                Our library management system makes it simple to find, borrow, and track materials — so you can focus on your studies instead of paperwork.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {mainFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer">
                <a href="#catalog" className='flex items-center'>
                  Browse the Catalog
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer">
                <a href="#account">
                  My Library Account
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Second Feature Section - Flipped Layout */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* Left Content */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Research resources available anytime, anywhere
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                From on-campus reading rooms to off-campus database access, our library extends beyond its walls to ensure you always have the resources you need.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {secondaryFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer">
                <a href="#databases" className='flex items-center'>
                  Access Online Databases
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer">
                <a href="#contact">
                  Ask a Librarian
                </a>
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <Image3D
            lightSrc="mc1.jpg"
            darkSrc="feature-2-dark.png"
            alt="Digital library resources"
            direction="right"
            className="order-1 lg:order-2"
          />
        </div>
      </div>
    </section>
  )
}