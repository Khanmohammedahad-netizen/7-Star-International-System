'use client'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/blocks/PageHeader'
import { AppCard } from '@/components/app/AppCard'
import { Badge } from '@/components/primitives/Badge'
import { cardStagger } from '@/motion/variants'
import { mockVenues } from '@/lib/mock/events'

export default function VenuesPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Venues" description={`${mockVenues.length} venues`} breadcrumbs={[{label:'Dashboard',href:'/dashboard'},{label:'Venues'}]} />
      <motion.div variants={cardStagger.container} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockVenues.map(v=>(
          <motion.div key={v.id} variants={cardStagger.item}><AppCard className="p-5 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">{v.name}</h3>
            <div className="flex items-center gap-2 mb-3"><Badge variant="default" className="capitalize">{v.type}</Badge><span className="text-xs text-[var(--text-muted)]">{v.city}</span></div>
            <div className="grid grid-cols-2 gap-2 text-sm"><div><span className="text-[var(--text-muted)] text-xs">Capacity</span><div className="font-semibold text-[var(--text-primary)]">{v.capacity}</div></div><div><span className="text-[var(--text-muted)] text-xs">Daily Rate</span><div className="font-semibold text-[var(--text-primary)]">${v.daily_rate.toLocaleString()}</div></div></div>
          </AppCard></motion.div>
        ))}
      </motion.div>
    </div>
  )
}
