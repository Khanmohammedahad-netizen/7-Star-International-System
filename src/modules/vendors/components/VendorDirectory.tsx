// @ts-nocheck
'use client'

import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Vendor } from '@/modules/events/types'

export function VendorDirectory() {
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async (): Promise<Vendor[]> => {
      const res = await fetch('/api/vendors')
      const json = await res.json()
      return json.data
    }
  })

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading vendors...</div>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
      {vendors?.map(vendor => (
        <Card key={vendor.id} className="p-5 hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <Badge variant={vendor.is_preferred ? 'primary' : 'secondary'} className="uppercase text-[10px] tracking-wider">
              {vendor.category.replace('_', ' ')}
            </Badge>
            {vendor.rating && (
              <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                ★ {vendor.rating}.0
              </span>
            )}
          </div>
          <h3 className="font-semibold text-lg line-clamp-1">{vendor.name}</h3>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p className="truncate">{vendor.contact_name}</p>
            <p className="font-mono text-xs">{vendor.phone}</p>
            <p className="truncate hover:text-foreground hover:underline cursor-pointer transition-colors max-w-[200px] block">{vendor.email}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}

