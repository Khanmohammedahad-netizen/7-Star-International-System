// @ts-nocheck
'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function EventFinanceTab({ eventId }: { eventId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/finance`)
      const json = await res.json()
      return json.data
    }
  })

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading financials...</div>
  if (!data) return null

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-4 animate-in fade-in duration-500">
      
      {/* Revenue Card */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground">Revenue</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Quotation: QT-0042 <Badge variant="secondary" className="ml-2">Accepted</Badge></span>
            <span className="font-mono">AED {data.total_quoted.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Invoice: INV-0108 <Badge variant="secondary" className="ml-2">Sent</Badge></span>
            <span className="font-mono">AED {data.total_invoiced.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 text-green-500/90 font-medium">
            <span>Received (50% deposit)</span>
            <span className="font-mono">AED {data.total_received.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 text-yellow-500/90 font-medium border-t border-border/50 pt-4">
            <span>Outstanding</span>
            <span className="font-mono">AED {data.total_outstanding.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* P&L Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold uppercase tracking-wider text-primary">P&L Summary</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-1">
            <span className="text-muted-foreground">Total Revenue</span>
            <span className="font-mono">AED {data.total_received.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/50 pb-4">
            <span className="text-muted-foreground">Total Expenses</span>
            <span className="font-mono text-red-400">AED {data.total_expenses.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 text-lg">
            <span className="font-bold">Gross Profit</span>
            <div className="text-right">
              <span className="font-mono font-bold block">AED {data.gross_profit.toLocaleString()}</span>
              <span className="text-sm font-medium text-green-500">{data.margin_percent}% margin</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card className="lg:col-span-3 mt-4">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground">Expenses</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.expenses.map((exp: any) => (
              <div key={exp.id} className="flex justify-between items-center py-3 border-b border-border/50 last:border-0 hover:bg-muted/10 px-2 -mx-2 rounded transition-colors">
                <div>
                  <p className="font-medium">{exp.description}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{exp.category}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <Badge variant={exp.status === 'paid' ? 'secondary' : 'secondary'} className={exp.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                    {exp.status}
                  </Badge>
                  <span className="font-mono w-24">AED {exp.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

