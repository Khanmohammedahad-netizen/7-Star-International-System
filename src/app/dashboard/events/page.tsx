'use client'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/blocks/PageHeader'
import { AppCard } from '@/components/app/AppCard'
import { AppButton } from '@/components/primitives/AppButton'
import { Badge } from '@/components/primitives/Badge'
import { cardStagger } from '@/motion/variants'
import { mockEvents } from '@/lib/mock/events'

const statusVariant = (s:string) => { switch(s){case 'confirmed':case 'active': return 'success' as const; case 'planning': return 'brand' as const; case 'completed': return 'default' as const; default: return 'default' as const} }
const typeColor = (t:string) => { switch(t){case 'conference': return '#3B82F6'; case 'corporate': return '#22C55E'; case 'workshop': return '#EAB308'; case 'gala': return '#A855F7'; default: return '#94A3B8'} }

export default function EventsPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="All Events" description={`${mockEvents.length} events`} breadcrumbs={[{label:'Dashboard',href:'/dashboard'},{label:'Events'}]} actions={<AppButton variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>Create Event</AppButton>} />
      <motion.div variants={cardStagger.container} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockEvents.map(e => {
          const budgetUsed = Math.round(e.spent / e.budget * 100)
          return (
            <motion.div key={e.id} variants={cardStagger.item}><AppCard className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3"><div><span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize" style={{backgroundColor:`${typeColor(e.type)}20`,color:typeColor(e.type)}}>{e.type.replace('_',' ')}</span><h3 className="font-semibold text-[var(--text-primary)] mt-2">{e.name}</h3><p className="text-xs text-[var(--text-muted)]">{e.start_date} · {e.location}</p></div><Badge variant={statusVariant(e.status)} className="capitalize">{e.status}</Badge></div>
              <div className="grid grid-cols-2 gap-3 text-xs mb-3"><div><span className="text-[var(--text-muted)]">Attendees</span><div className="font-semibold text-[var(--text-primary)]">{e.expected_attendees}</div></div><div><span className="text-[var(--text-muted)]">Revenue</span><div className="font-semibold text-emerald-600">${Math.round(e.revenue).toLocaleString()}</div></div></div>
              <div><div className="flex justify-between text-xs mb-1"><span className="text-[var(--text-muted)]">Budget</span><span className="font-medium text-[var(--text-primary)]">{budgetUsed}%</span></div><div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden"><div className={`h-full rounded-full ${budgetUsed>90?'bg-red-500':budgetUsed>70?'bg-amber-500':'bg-emerald-500'}`} style={{width:`${Math.min(budgetUsed,100)}%`}} /></div></div>
            </AppCard></motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
