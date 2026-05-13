"use client"

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useState } from 'react'

const plans = [
  {
    name: 'Nursing Library',
    description: 'Dedicated resources for nursing students and healthcare professionals',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Access to nursing journals & e-books',
      'Clinical reference databases',
      'Health sciences periodicals',
      'Study rooms & quiet zones',
      'Printing & scanning services',
      'Community peer support'
    ],
    cta: 'Access Now',
    popular: false,
  
  },
  {
    name: 'Graduate Library',
    description: 'Advanced collections for graduate students and research programs',
    monthlyPrice: 19,
    yearlyPrice: 15,
    features: [
      'Full research database suite',
      'Thesis & dissertation archives',
      'Interlibrary loan services',
      'Graduate study carrels',
      'Statistical software access',
      'Citation management tools',
      'Research consultation sessions',
      'Extended borrowing privileges',
      'Remote access to all e-resources'
    ],
    cta: 'Access Now',
    popular: true,
    includesPrevious: 'All Nursing Library access, plus',

  },
  {
    name: 'Main Library',
    description: 'The central hub — full access to every collection and service on campus',
    monthlyPrice: 299,
    yearlyPrice: 299,
    features: [
      'Unlimited borrowing across all branches',
      'Special collections & rare books',
      'Multimedia production lab',
      'Faculty priority services',
      'Archival & manuscript access',
      '24/7 digital resource access'
    ],
    cta: 'Access Now',
    popular: false,
    includesPrevious: 'All Graduate Library access, plus',
   
  }
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4">Our Libraries</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Choose your library
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            From specialized nursing resources to graduate research tools and our flagship main branch — find the library that fits your academic journey.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-2">
            <ToggleGroup
              type="single"
              value={isYearly ? "yearly" : "monthly"}
              onValueChange={(value) => setIsYearly(value === "yearly")}
              className="bg-secondary text-secondary-foreground border-none rounded-full p-1 cursor-pointer shadow-none"
            >
              <ToggleGroupItem
                value="monthly"
                className="data-[state=on]:bg-background data-[state=on]:border-border border-transparent border px-6 !rounded-full data-[state=on]:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Semester
              </ToggleGroupItem>
              <ToggleGroupItem
                value="yearly"
                className="data-[state=on]:bg-background data-[state=on]:border-border border-transparent border px-6 !rounded-full data-[state=on]:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Annual
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">Save 20%</span> on Annual Membership
          </p>
        </div>

        {/* Library Cards */}
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border">
            <div className="grid lg:grid-cols-3">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`p-8 grid grid-rows-subgrid row-span-4 gap-6 ${
                    plan.popular
                      ? 'my-2 mx-4 rounded-xl bg-card border-transparent shadow-xl ring-1 ring-foreground/10 backdrop-blur'
                      : ''
                  }`}
                >
                  {/* Plan Header */}
                  <div>
        
                    <div className="text-lg font-medium tracking-tight mb-2">{plan.name}</div>
                    <div className="text-muted-foreground text-balance text-sm">{plan.description}</div>
                  </div>

                  {/* Membership Tag */}
                  <div>
                    <div className="text-4xl font-bold mb-1">
                      {index === 0 ? 'Open Access' : index === 1 ? 'Graduate' : 'Full Access'}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {index === 0
                        ? 'Free for all enrolled students'
                        : index === 1
                        ? 'For graduate students & researchers'
                        : 'University-wide membership'}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div>
                    <Button
                      className={`w-full cursor-pointer my-2 ${
                        plan.popular
                          ? 'shadow-md border-[0.5px] border-white/25 shadow-black/20 bg-primary ring-1 ring-primary/15 text-primary-foreground hover:bg-primary/90'
                          : 'shadow-sm shadow-black/15 border border-transparent bg-background ring-1 ring-foreground/10 hover:bg-muted/50'
                      }`}
                      variant={plan.popular ? 'default' : 'secondary'}
                    >
                      {plan.cta}
                    </Button>
                  </div>

                  {/* Features */}
                  <div>
                    <ul role="list" className="space-y-3 text-sm">
                      {plan.includesPrevious && (
                        <li className="flex items-center gap-3 font-medium">
                          {plan.includesPrevious}:
                        </li>
                      )}
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="text-muted-foreground size-4 flex-shrink-0" strokeWidth={2.5} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Need library assistance or have questions?{' '}
            <Button variant="link" className="p-0 h-auto cursor-pointer" asChild>
              <a href="#contact">
                Contact our library team
              </a>
            </Button>
          </p>
        </div>
      </div>
    </section>
  )
}