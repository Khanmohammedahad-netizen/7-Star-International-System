'use client'

import { VendorDirectory } from '@/modules/vendors/components/VendorDirectory'

export default function VendorsPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vendor Directory</h1>
        <p className="text-muted-foreground mt-1">Manage global vendors and partner relationships.</p>
      </div>
      <VendorDirectory />
    </div>
  )
}
