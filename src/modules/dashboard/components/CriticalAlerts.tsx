// @ts-nocheck
import { useDashboard } from '../hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, CalendarDots } from 'lucide-react'

export function CriticalAlerts() {
  const { data, isLoading } = useDashboard()

  if (isLoading || !data?.criticalAlerts.length) return null

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground">Critical Alerts</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.criticalAlerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`border-l-4 ${alert.severity === 'critical' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
              <CardContent className="p-4 flex items-start gap-4">
                {alert.severity === 'critical' ? (
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium">{alert.message}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

