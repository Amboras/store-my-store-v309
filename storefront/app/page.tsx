'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  LifeBuoy,
  Phone,
  Award,
  Check,
  Star,
} from 'lucide-react'
import CollectionSection from '@/components/marketing/collection-section'
import { useCollections } from '@/hooks/use-collections'
import { trackMetaEvent } from '@/lib/meta-pixel'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=1600&q=80'
const LIFESTYLE_IMAGE =
  'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=1600&q=80'
const STORY_IMAGE =
  'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=1600&q=80'

export default function HomePage() {
  const { data: collections, isLoading } = useCollections()
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    trackMetaEvent('Lead', {
      content_name: 'newsletter_signup',
      status: 'submitted',
    })
  }

  return (
    <>
      {/* ——————————————————————————————————— HERO ——————————————————————————————————— */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-[hsl(35_30%_94%)] via-background to-background">
        {/* Decorative organic shape */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-40 h-[520px] w-[520px] rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-[hsl(20_50%_70%)]/20 blur-3xl"
        />

        <div className="container-custom grid items-center gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-28">
          {/* Copy */}
          <div className="relative space-y-7 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-accent">
              <HeartHandshake className="h-3.5 w-3.5" strokeWidth={2} />
              Designed for independent living
            </div>

            <h1 className="text-balance font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4.5rem]">
              Everyday support,
              <br />
              <span className="text-accent">thoughtfully designed.</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Premium mobility, safety, and comfort essentials — engineered with
              geriatric specialists to help you or your loved ones move through
              each day with confidence.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/products"
                prefetch
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-wider text-background shadow-lg shadow-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-foreground/20"
              >
                Shop Essentials
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                prefetch
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground underline-offset-8 hover:underline"
              >
                Our story
              </Link>
            </div>

            {/* Proof strip */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="flex text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-medium text-foreground">4.9</span>
                <span>· 12,400+ happy households</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={2} />
                FSA/HSA eligible
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-accent" strokeWidth={2} />
                Free shipping over $75
              </div>
            </div>
          </div>

          {/* Image composition */}
          <div className="relative animate-fade-in">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-muted shadow-2xl shadow-foreground/10">
              <Image
                src={HERO_IMAGE}
                alt="A senior enjoying independence at home"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Floating trust card */}
            <div className="absolute -bottom-6 -left-6 hidden max-w-[240px] rounded-2xl border border-border/80 bg-background/95 p-4 shadow-xl backdrop-blur-sm sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Award className="h-5 w-5 text-accent" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    Therapist approved
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Co-designed with OTs & PTs
                  </p>
                </div>
              </div>
            </div>

            {/* Floating small image */}
            <div className="absolute -top-6 -right-6 hidden aspect-square w-36 overflow-hidden rounded-2xl border-4 border-background shadow-xl sm:block">
              <Image
                src={LIFESTYLE_IMAGE}
                alt="Active senior lifestyle"
                fill
                sizes="144px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ——————————————————————————————————— PILLARS ——————————————————————————————————— */}
      <section className="border-b border-border/60 py-16 sm:py-20">
        <div className="container-custom">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-accent">
              Built around you
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
              The essentials of independent living.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: LifeBuoy,
                title: 'Mobility',
                body: 'Canes, walkers, and support aids that travel wherever you do.',
              },
              {
                icon: ShieldCheck,
                title: 'Home safety',
                body: 'Fall-prevention gear — bathroom, stairs, and bedside.',
              },
              {
                icon: HeartHandshake,
                title: 'Daily comfort',
                body: 'Orthopedic cushions and supports for aches and joints.',
              },
              {
                icon: Phone,
                title: 'Peace of mind',
                body: 'Medication & wellness tools that keep routines on track.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border/80 bg-background p-6 transition-all hover:-translate-y-1 hover:border-accent/60 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——————————————————————————————————— COLLECTIONS ——————————————————————————————————— */}
      {isLoading ? (
        <section className="py-section">
          <div className="container-custom">
            <div className="animate-pulse space-y-4 text-center">
              <div className="mx-auto h-3 w-20 rounded bg-muted" />
              <div className="mx-auto h-8 w-64 rounded bg-muted" />
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        </section>
      ) : collections && collections.length > 0 ? (
        <>
          {collections.map(
            (collection: {
              id: string
              handle: string
              title: string
              metadata?: Record<string, unknown>
            }, index: number) => (
              <CollectionSection
                key={collection.id}
                collection={collection}
                alternate={index % 2 === 1}
              />
            )
          )}
        </>
      ) : null}

      {/* ——————————————————————————————————— EDITORIAL / STORY ——————————————————————————————————— */}
      <section className="bg-[hsl(35_25%_94%)] py-20 sm:py-28">
        <div className="container-custom grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative order-last lg:order-first">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
              <Image
                src={STORY_IMAGE}
                alt="Our philosophy — dignity in daily life"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -right-4 -bottom-4 hidden rounded-2xl bg-background p-5 shadow-xl sm:block">
              <p className="font-heading text-4xl font-semibold text-accent">12k+</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                households supported
              </p>
            </div>
          </div>

          <div className="space-y-6 lg:max-w-lg">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-accent">
              Our promise
            </p>
            <h2 className="font-heading text-3xl font-semibold leading-tight sm:text-4xl">
              Dignity should never come with compromise.
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Every product in our lineup is tested with real families,
              refined with occupational therapists, and built to last —
              because growing older should feel like gaining confidence,
              not losing it.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                'Co-designed with OTs, PTs, and geriatric nurses',
                '365-day satisfaction guarantee on every product',
                'Free lifetime customer care via phone or email',
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-foreground/90">{line}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/about"
              prefetch
              className="inline-flex items-center gap-2 pt-2 text-sm font-semibold uppercase tracking-wider text-foreground underline-offset-8 hover:underline"
            >
              Read our story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ——————————————————————————————————— TESTIMONIAL BAND ——————————————————————————————————— */}
      <section className="border-y border-border/60 bg-background py-20">
        <div className="container-custom">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                name: 'Margaret, 72',
                quote:
                  'The Steady cane feels like it was made for me — light, sturdy, and the LED is a quiet comfort at night.',
              },
              {
                name: "Daniel, caring for his mom",
                quote:
                  'I installed the shower bars in 30 seconds. My mother feels safer, and so do I.',
              },
              {
                name: 'Evelyn, 68',
                quote:
                  'I travel with the seat cushion everywhere now. My back thanks me at the end of every day.',
              },
            ].map((t) => (
              <figure key={t.name} className="space-y-4">
                <div className="flex text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-base leading-relaxed text-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="text-sm font-medium text-muted-foreground">
                  — {t.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ——————————————————————————————————— TRUST BAR ——————————————————————————————————— */}
      <section className="border-b border-border/60 py-10">
        <div className="container-custom">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              { icon: Truck, title: 'Free shipping', sub: 'On orders over $75' },
              { icon: ShieldCheck, title: '365-day returns', sub: 'No questions asked' },
              { icon: HeartHandshake, title: 'Human support', sub: '7 days a week' },
              { icon: Award, title: 'FSA/HSA eligible', sub: 'On qualifying items' },
            ].map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="flex items-center justify-center gap-4 md:justify-start"
              >
                <Icon className="h-6 w-6 shrink-0 text-accent" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——————————————————————————————————— NEWSLETTER ——————————————————————————————————— */}
      <section className="py-20">
        <div className="container-custom mx-auto max-w-2xl rounded-3xl border border-border/80 bg-[hsl(35_30%_95%)] p-10 text-center sm:p-14">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            Care tips, new arrivals, and quiet offers.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join our monthly letter — practical guidance for aging well at home.
            No clutter, unsubscribe anytime.
          </p>
          <form
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={handleNewsletterSubmit}
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-full border border-border bg-background px-5 py-3.5 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              type="submit"
              className="rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-background transition-opacity hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
