'use client'

import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

/**
 * Shows a countdown timer that ends at the next midnight + N days from the
 * first time a visitor lands on the page. We store a timestamp per product
 * handle in localStorage so the same visitor keeps seeing the same clock —
 * real urgency, no deception.
 */
interface Props {
  productKey: string
  /** Number of days the sale lasts from first visit (default 2) */
  durationDays?: number
  message?: string
}

function twoDigits(n: number) {
  return n.toString().padStart(2, '0')
}

export default function SaleCountdown({
  productKey,
  durationDays = 2,
  message = 'Introductory pricing ends in',
}: Props) {
  const [remaining, setRemaining] = useState<number>(0)

  useEffect(() => {
    const storageKey = `sale_end_${productKey}`
    let end = Number(localStorage.getItem(storageKey))

    if (!end || Number.isNaN(end) || end < Date.now()) {
      end = Date.now() + durationDays * 24 * 60 * 60 * 1000
      localStorage.setItem(storageKey, String(end))
    }

    const tick = () => setRemaining(Math.max(0, end - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [productKey, durationDays])

  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (remaining === 0) return null

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[hsl(20_80%_96%)] px-4 py-3 text-sm ring-1 ring-[hsl(20_70%_50%)]/20">
      <Flame className="h-4 w-4 shrink-0 text-[hsl(20_75%_45%)]" strokeWidth={2} />
      <span className="text-[hsl(20_55%_25%)]">{message}</span>
      <div className="ml-auto flex items-center gap-1 font-mono text-xs font-semibold tabular-nums text-foreground">
        {days > 0 && (
          <>
            <span className="rounded bg-foreground px-1.5 py-1 text-background">
              {twoDigits(days)}d
            </span>
            <span>:</span>
          </>
        )}
        <span className="rounded bg-foreground px-1.5 py-1 text-background">
          {twoDigits(hours)}h
        </span>
        <span>:</span>
        <span className="rounded bg-foreground px-1.5 py-1 text-background">
          {twoDigits(minutes)}m
        </span>
        <span>:</span>
        <span className="rounded bg-foreground px-1.5 py-1 text-background">
          {twoDigits(seconds)}s
        </span>
      </div>
    </div>
  )
}
