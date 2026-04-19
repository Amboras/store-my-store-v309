import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // ISR: revalidate every hour
import { medusaServerClient } from '@/lib/medusa-client'
import Image from 'next/image'
import Link from 'next/link'
import {
  Truck,
  RotateCcw,
  Shield,
  ChevronRight,
  Award,
  HeartHandshake,
  BadgeCheck,
} from 'lucide-react'
import ProductActions from '@/components/product/product-actions'
import ProductActionsBundle, {
  type BundleOption,
} from '@/components/product/product-actions-bundle'
import SaleCountdown from '@/components/product/sale-countdown'
import ProductAccordion from '@/components/product/product-accordion'
import { ProductViewTracker } from '@/components/product/product-view-tracker'
import { getProductPlaceholder } from '@/lib/utils/placeholder-images'
import { type VariantExtension } from '@/components/product/product-price'

// Handle of the primary product that gets the enhanced bundle UX
const PRIMARY_PRODUCT_HANDLE = 'the-steady-adjustable-walking-cane-with-led'

async function getProduct(handle: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) throw new Error('No region found')

    const response = await medusaServerClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price',
    })
    return response.products?.[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getProductByHandleLite(handle: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) return null
    const response = await medusaServerClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price',
    })
    return response.products?.[0] || null
  } catch {
    return null
  }
}

async function getVariantExtensions(
  productId: string,
): Promise<Record<string, VariantExtension>> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const headers: Record<string, string> = {}
    if (storeId) headers['X-Store-Environment-ID'] = storeId
    if (publishableKey) headers['x-publishable-api-key'] = publishableKey

    const res = await fetch(
      `${baseUrl}/store/product-extensions/products/${productId}/variants`,
      { headers, next: { revalidate: 30 } },
    )
    if (!res.ok) return {}

    const data = await res.json()
    const map: Record<string, VariantExtension> = {}
    for (const v of data.variants || []) {
      map[v.id] = {
        compare_at_price: v.compare_at_price,
        allow_backorder: v.allow_backorder ?? false,
        inventory_quantity: v.inventory_quantity,
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) return { title: 'Product Not Found' }

  return {
    title: product.title,
    description: product.description || `Shop ${product.title}`,
    openGraph: {
      title: product.title,
      description: product.description || `Shop ${product.title}`,
      ...(product.thumbnail ? { images: [{ url: product.thumbnail }] } : {}),
    },
  }
}

interface VariantLite {
  id: string
  calculated_price?: { calculated_amount?: number } | null
}

async function buildBundles(product: any): Promise<BundleOption[] | null> {
  // Primary variant price of The Steady (first available variant)
  const variants = (product.variants || []) as VariantLite[]
  const single = variants[0]
  const singlePrice =
    single?.calculated_price?.calculated_amount ?? 8900

  const doublePack = await getProductByHandleLite('the-steady-double-pack')
  const companionKit = await getProductByHandleLite(
    'the-steady-companion-kit-cane-cushion',
  )

  const bundles: BundleOption[] = [
    {
      id: 'single',
      label: 'Single Cane',
      sublabel: 'Just the Steady — your chosen color',
      variantId: single?.id || '',
      priceCents: singlePrice,
      compareCents: 12900,
      useSelectedCaneVariant: true,
    },
  ]

  const dpVariant = (doublePack?.variants || [])[0] as VariantLite | undefined
  if (dpVariant) {
    bundles.push({
      id: 'double',
      label: 'Double Pack',
      sublabel: 'Two canes — one upstairs, one downstairs',
      variantId: dpVariant.id,
      priceCents: dpVariant.calculated_price?.calculated_amount ?? 15000,
      compareCents: 17800,
      badge: 'Most popular',
      useSelectedCaneVariant: false,
    })
  }

  const kitVariant = (companionKit?.variants || [])[0] as VariantLite | undefined
  if (kitVariant) {
    bundles.push({
      id: 'kit',
      label: 'Companion Kit',
      sublabel: 'Steady cane + Cradle seat cushion',
      variantId: kitVariant.id,
      priceCents: kitVariant.calculated_price?.calculated_amount ?? 12900,
      compareCents: 13800,
      badge: 'Best value',
      useSelectedCaneVariant: false,
    })
  }

  return bundles
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)
  if (!product) notFound()

  const variantExtensions = await getVariantExtensions(product.id)

  const allImages = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    ...(product.images || []).filter(
      (img: any) => img.url !== product.thumbnail,
    ),
  ]
  const displayImages =
    allImages.length > 0
      ? allImages
      : [{ url: getProductPlaceholder(product.id) }]

  const isPrimary = handle === PRIMARY_PRODUCT_HANDLE
  const bundles = isPrimary ? await buildBundles(product) : null

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b border-border/60">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href="/products"
              className="transition-colors hover:text-foreground"
            >
              Shop
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={displayImages[0].url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {isPrimary && (
                <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                  <Award className="h-3 w-3 text-accent" strokeWidth={2.5} />
                  Therapist approved
                </div>
              )}
            </div>

            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayImages.slice(1, 5).map((image: any, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted"
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${idx + 2}`}
                      fill
                      sizes="12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Title */}
            <div>
              {product.subtitle && (
                <p className="mb-2 text-sm uppercase tracking-[0.15em] text-muted-foreground">
                  {product.subtitle}
                </p>
              )}
              <h1 className="font-heading text-3xl font-semibold leading-tight sm:text-4xl">
                {product.title}
              </h1>
              {isPrimary && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <BadgeCheck className="h-4 w-4 text-accent" strokeWidth={2} />
                  Rated 4.9/5 by 2,380+ verified owners
                </p>
              )}
            </div>

            <ProductViewTracker
              productId={product.id}
              productTitle={product.title}
              variantId={product.variants?.[0]?.id || null}
              currency={
                product.variants?.[0]?.calculated_price?.currency_code || 'usd'
              }
              value={
                product.variants?.[0]?.calculated_price?.calculated_amount ??
                null
              }
            />

            {/* Urgency countdown — primary product only */}
            {isPrimary && (
              <SaleCountdown
                productKey={product.handle || product.id}
                durationDays={2}
                message="Launch pricing ends in"
              />
            )}

            {/* Actions — bundle-aware for primary, classic for everything else */}
            {isPrimary && bundles ? (
              <ProductActionsBundle
                product={product}
                variantExtensions={variantExtensions}
                bundles={bundles}
                defaultBundleId="double"
              />
            ) : (
              <ProductActions
                product={product}
                variantExtensions={variantExtensions}
              />
            )}

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-4 border-t border-border/60 py-6">
              <div className="text-center">
                <Truck
                  className="mx-auto mb-1.5 h-5 w-5 text-accent"
                  strokeWidth={1.5}
                />
                <p className="text-xs text-muted-foreground">Free shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw
                  className="mx-auto mb-1.5 h-5 w-5 text-accent"
                  strokeWidth={1.5}
                />
                <p className="text-xs text-muted-foreground">365-day returns</p>
              </div>
              <div className="text-center">
                <Shield
                  className="mx-auto mb-1.5 h-5 w-5 text-accent"
                  strokeWidth={1.5}
                />
                <p className="text-xs text-muted-foreground">Secure checkout</p>
              </div>
            </div>

            {/* Guarantee strip — primary product */}
            {isPrimary && (
              <div className="rounded-2xl border border-accent/25 bg-accent/5 p-5">
                <div className="flex items-start gap-3">
                  <HeartHandshake
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                    strokeWidth={2}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      The 365-Day Steady Promise
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Use it for a full year. If it doesn&apos;t give you the
                      steadier, safer days we promised, send it back for a full
                      refund — no forms, no questions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Accordion sections */}
            <ProductAccordion
              description={product.description}
              details={product.metadata as Record<string, string> | undefined}
            />
          </div>
        </div>
      </div>
    </>
  )
}
