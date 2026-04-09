// @ts-nocheck
'use client'

import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Star, Mail, Phone } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

const CATEGORY_LABELS: Record<string, string> = {
  catering: 'Catering',
  av_tech: 'AV / Tech',
  decor: 'Décor',
  photography: 'Photography',
  security: 'Security',
  transport: 'Transport',
  venue: 'Venue',
  entertainment: 'Entertainment',
  other: 'Other',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-neutral-700'
          }`}
        />
      ))}
    </div>
  )
}

export function VendorDirectory() {
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await fetch('/api/vendors')
      const json = await res.json()
      return json.data || []
    }
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-5 border-white/5 bg-white/[0.02]">
            <div className="flex justify-between mb-4">
              <Skeleton className="h-5 w-20 rounded-full bg-white/5" />
              <Skeleton className="h-5 w-10 rounded-full bg-white/5" />
            </div>
            <Skeleton className="h-6 w-3/4 mb-4 bg-white/5" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2 bg-white/5" />
              <Skeleton className="h-4 w-1/3 bg-white/5" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!vendors || vendors.length === 0) {
    return (
      <EmptyState 
        icon={Search}
        title="No Vendors Found"
        description="Start building your partner network by adding your first elite vendor to the 7STAR directory."
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {vendors?.map(vendor => (
        <Card key={vendor.id} className="p-5 hover:border-white/20 hover:bg-white/[0.03] transition-all duration-300 group cursor-default flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <Badge variant="outline" className="uppercase text-[10px] tracking-wider border-white/10 text-neutral-400 group-hover:border-white/30 group-hover:text-neutral-200 transition-colors">
              {CATEGORY_LABELS[vendor.category] || vendor.category || vendor.service_type || 'Other'}
            </Badge>
            {(vendor.rating ?? 0) > 0 && <StarRating rating={vendor.rating} />}
          </div>

          <h3 className="font-bold text-lg leading-tight tracking-tight group-hover:text-white transition-colors capitalize mt-1">
            {vendor.name}
          </h3>

          <div className="mt-4 space-y-2 text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors flex-1">
            {vendor.contact && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                <p className="truncate font-medium">{vendor.contact}</p>
              </div>
            )}
            {vendor.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <a href={`mailto:${vendor.email}`} className="truncate hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                  {vendor.email}
                </a>
              </div>
            )}
            {vendor.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{vendor.phone}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Base Cost</span>
            <span className="text-sm font-mono font-bold text-white">
              {new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(vendor.cost_basis || 0)}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}
