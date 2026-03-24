// @ts-nocheck
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function EventVendorList({ eventId }: { eventId: string }) {
  // Use mock data locally for visual representation
  const vendors = [
    { id: '1', name: 'Al Sham Catering', category: 'Catering', status: 'Confirmed', contract: 'Signed', payment: '½ Paid', contact: '+971 50 123 4567' },
    { id: '2', name: 'Vision Productions', category: 'AV/Tech', status: 'Quote Received', contract: 'Pending', payment: 'Unpaid', contact: '+971 55 987 6543' },
    { id: '3', name: 'Floral Dreams', category: 'Decoration', status: 'Contacted', contract: 'None', payment: 'Unpaid', contact: '+971 52 456 7890' },
  ]

  return (
    <div className="py-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground">Event Vendors</h2>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Vendor</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Contract</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{v.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{v.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${v.status === 'Confirmed' ? 'bg-green-500' : v.status === 'Quote Received' ? 'bg-yellow-500' : 'bg-muted-foreground'}`} />
                        {v.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {v.contract === 'Signed' ? <Badge variant="secondary" className="bg-green-500/10 text-green-500">✓ Signed</Badge> : <span className="text-muted-foreground">✗ Pending</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{v.payment}</td>
                    <td className="px-6 py-4 text-muted-foreground">{v.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

