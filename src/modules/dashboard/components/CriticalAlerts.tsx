// @ts-nocheck
import { useDashboard } from '../hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, CalendarDots } from 'lucide-react'

export function CriticalAlerts() {
  const { data, isLoading } = useDashboard()

  if (isLoading || !data?.criticalAlerts?.length) return null

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#C9A84C] px-1">Critical Alerts</h2>
      <div className="grid gap-4">
        {data.criticalAlerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-[#1a1a1a] border border-[#2a2a2a] border-l-4 shadow-lg overflow-hidden ${alert.severity === 'critical' ? 'border-l-red-500' : 'border-l-[#C9A84C]'}`}>
              <CardContent className="p-4 flex items-center gap-4 bg-[#1a1a1a]/50">
                <div className={`p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-[#C9A84C]/10 text-[#C9A84C]'}`}>
                  {alert.severity === 'critical' ? (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-100">{alert.message || alert.description || 'System Alert'}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

