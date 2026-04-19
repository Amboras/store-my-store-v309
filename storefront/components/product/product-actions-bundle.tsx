'use client'

import { useMemo, useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import {
  Check,
  Loader2,
  Minus,
  Plus,
  Shield,
  Sparkles,
  Truck,
} from 'lucide-react'
import { toast } from 'sonner'
import { trackAddToCart } from '@/lib/analytics'
import { trackMetaEvent, toMetaCurrencyValue } from '@/lib/meta-pixel'
import { formatPrice } from '@/lib/utils/format-price'
import type { VariantExtension } from './product-price'
import type { Product } from '@/types'

export interface BundleOption {
  id: string
  label: string
  sublabel: string
  variantId: string
  priceCents: number
  compareCents?: number
  badge?: string
  savingsLabel?: string
  /** When true, uses the customer-selected cane color variant instead of variantId */
  useSelectedCaneVariant?: boolean
}

interface VariantOption {
  option_id?: string
  option?: { id: string }
  value: string
}
interface ProductVariantWithPrice {
  id: string
  options?: VariantOption[]
  calculated_price?: { calculated_amount?: number; currency_code?: string } | number
  [k: string]: unknown
}
interface ProductOptionValue {
  id?: string
  value: string
}
interface ProductOptionWithValues {
  id: string
  title: string
  values?: (string | ProductOptionValue)[]
}

interface Props {
  product: Product
  variantExtensions?: Record<string, VariantExtension>
  bundles: BundleOption[]
  defaultBundleId?: string
}

export default function ProductActionsBundle({
  product,
  variantExtensions,
  bundles,
  defaultBundleId,
}: Props) {
  const variants = useMemo(
    () => (product.variants || []) as unknown as ProductVariantWithPrice[],
    [product.variants],
  )
  const options = useMemo(() => product.options || [], [product.options])

  // Selected option values (e.g. { opt_color: "Graphite Black" })
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    const firstVariant = variants[0]
    if (firstVariant?.options) {
      for (const opt of firstVariant.options) {
        const optionId = opt.option_id || opt.option?.id
        if (optionId && opt.value) defaults[optionId] = opt.value
      }
    }
    return defaults
  })

  const [selectedBundleId, setSelectedBundleId] = useState<string>(
    defaultBundleId || bundles[0]?.id,
  )
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const { addItemAsync, isAddingItem } = useCart()

  // Find the cane variant matching the color selection
  const selectedCaneVariant = useMemo(() => {
    if (variants.length <= 1) return variants[0]
    return (
      variants.find((v) => {
        if (!v.options) return false
        return v.options.every((opt) => {
          const optionId = opt.option_id || opt.option?.id
          if (!optionId) return false
          return selectedOptions[optionId] === opt.value
        })
      }) || variants[0]
    )
  }, [variants, selectedOptions])

  const selectedBundle = bundles.find((b) => b.id === selectedBundleId) || bundles[0]
  const currency =
    (selectedCaneVariant?.calculated_price &&
      typeof selectedCaneVariant.calculated_price !== 'number' &&
      selectedCaneVariant.calculated_price.currency_code) ||
    'usd'

  const caneExt = selectedCaneVariant?.id
    ? variantExtensions?.[selectedCaneVariant.id]
    : undefined
  const caneInventory = caneExt?.inventory_quantity
  const isLowStock =
    caneInventory != null && caneInventory > 0 && caneInventory < 15

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }))
  }

  const handleAddToCart = async () => {
    try {
      // Determine the variant(s) to add
      const caneVariantId = selectedCaneVariant?.id
      if (!caneVariantId) return

      if (selectedBundle.useSelectedCaneVariant) {
        // Single cane — add chosen color
        await addItemAsync({ variantId: caneVariantId, quantity })
      } else {
        // Bundle product — add bundle variant
        await addItemAsync({
          variantId: selectedBundle.variantId,
          quantity,
        })
      }

      const metaValue = toMetaCurrencyValue(selectedBundle.priceCents)
      trackAddToCart(product.id, selectedBundle.variantId, quantity, selectedBundle.priceCents)
      trackMetaEvent('AddToCart', {
        content_ids: [selectedBundle.variantId],
        content_type: 'product',
        content_name: `${product.title} — ${selectedBundle.label}`,
        value: metaValue,
        currency,
        num_items: quantity,
      })

      setJustAdded(true)
      toast.success(`${selectedBundle.label} added to bag`)
      setTimeout(() => setJustAdded(false), 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to bag'
      toast.error(message)
    }
  }

  return (
    <div className="space-y-7">
      {/* Headline price */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-4xl font-semibold text-foreground">
          {formatPrice(selectedBundle.priceCents, currency)}
        </span>
        {selectedBundle.compareCents && selectedBundle.compareCents > selectedBundle.priceCents && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(selectedBundle.compareCents, currency)}
            </span>
            <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              Save {formatPrice(selectedBundle.compareCents - selectedBundle.priceCents, currency)}
            </span>
          </>
        )}
      </div>

      {/* Low stock / urgency */}
      {isLowStock && (
        <div className="flex items-center gap-2 rounded-xl border border-[hsl(20_70%_50%)]/30 bg-[hsl(20_70%_95%)] px-4 py-3 text-sm">
          <Sparkles className="h-4 w-4 text-[hsl(20_70%_45%)]" strokeWidth={2} />
          <span>
            <strong className="text-[hsl(20_70%_35%)]">Only {caneInventory} left</strong> in this color — selling quickly.
          </span>
        </div>
      )}

      {/* Color selector */}
      {options.map((option: ProductOptionWithValues) => {
        const values = (option.values || [])
          .map((v) => (typeof v === 'string' ? v : v.value))
          .filter(Boolean) as string[]
        if (values.length <= 1) return null

        const optionId = option.id
        const selectedValue = selectedOptions[optionId]

        return (
          <div key={optionId}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest">
              {option.title}
              {selectedValue && (
                <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">
                  — {selectedValue}
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const isSelected = selectedValue === value
                const isAvailable = variants.some((v) => {
                  const hasValue = v.options?.some(
                    (o) =>
                      (o.option_id === optionId || o.option?.id === optionId) &&
                      o.value === value,
                  )
                  if (!hasValue) return false
                  const vExt = variantExtensions?.[v.id]
                  if (!vExt) return true
                  if (vExt.allow_backorder) return true
                  return vExt.inventory_quantity == null || vExt.inventory_quantity > 0
                })
                return (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(optionId, value)}
                    disabled={!isAvailable}
                    className={`min-w-[56px] rounded-full border px-4 py-2.5 text-sm transition-all ${
                      isSelected
                        ? 'border-foreground bg-foreground text-background'
                        : isAvailable
                        ? 'border-border hover:border-foreground'
                        : 'cursor-not-allowed border-border text-muted-foreground/40 line-through'
                    }`}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Bundle selector */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest">
          Choose your bundle
        </h3>
        <div className="space-y-2.5">
          {bundles.map((bundle) => {
            const isSelected = selectedBundleId === bundle.id
            const savings =
              bundle.compareCents && bundle.compareCents > bundle.priceCents
                ? bundle.compareCents - bundle.priceCents
                : 0
            return (
              <button
                key={bundle.id}
                type="button"
                onClick={() => setSelectedBundleId(bundle.id)}
                className={`relative flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-accent bg-accent/5 shadow-sm'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                {/* Radio */}
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected ? 'border-accent bg-accent' : 'border-border'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 text-accent-foreground" strokeWidth={3} />}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{bundle.label}</span>
                    {bundle.badge && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                        {bundle.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{bundle.sublabel}</p>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    {formatPrice(bundle.priceCents, currency)}
                  </div>
                  {savings > 0 && (
                    <div className="text-[11px] font-medium text-accent">
                      Save {formatPrice(savings, currency)}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Quantity + Add to Cart */}
      <div className="flex gap-3 pt-1">
        <div className="flex items-center rounded-full border border-border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 transition-colors hover:bg-muted disabled:opacity-40"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-3 transition-colors hover:bg-muted"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAddingItem}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold uppercase tracking-wider transition-all ${
            justAdded
              ? 'bg-[hsl(140_50%_32%)] text-white'
              : 'bg-foreground text-background hover:opacity-90'
          }`}
        >
          {isAddingItem ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : justAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added to bag
            </>
          ) : (
            `Add ${selectedBundle.label} to bag`
          )}
        </button>
      </div>

      {/* Payment reassurance */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
          Secure checkout
        </span>
        <span className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
          Ships in 24 hours
        </span>
        <span>FSA/HSA eligible</span>
      </div>
    </div>
  )
}
