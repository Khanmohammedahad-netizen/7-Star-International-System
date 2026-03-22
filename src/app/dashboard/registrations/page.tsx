'use client'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/blocks/PageHeader'
import { AppCard } from '@/components/app/AppCard'
import { Badge } from '@/components/primitives/Badge'
import { mockRegistrations } from '@/lib/mock/events'

const ticketColor = (t:string) => { switch(t){case 'vip': return '#EAB308'; case 'speaker': return '#A855F7'; case 'staff': return '#3B82F6'; default: return '#94A3B8'} }
const statusVariant = (s:string) => { switch(s){case 'confirmed':case 'attended': return 'success' as const; case 'registered': return 'brand' as const; case 'cancelled': return 'error' as const; default: return 'default' as const} }

export default function RegistrationsPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Registrations" description={`${mockRegistrations.length} registrations`} breadcrumbs={[{label:'Dashboard',href:'/dashboard'},{label:'Registrations'}]} />
      <AppCard className="p-0 overflow-hidden border-none"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-[var(--bg-subtle)]">
        <th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Attendee</th><th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Event</th>
        <th className="text-center py-3 px-4 font-medium text-[var(--text-muted)]">Ticket</th><th className="text-center py-3 px-4 font-medium text-[var(--text-muted)]">Status</th>
        <th className="text-right py-3 px-4 font-medium text-[var(--text-muted)]">Paid</th><th className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">Date</th>
      </tr></thead><tbody>{mockRegistrations.map((r,i)=>(
        <motion.tr key={r.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.02}} className="border-b border-[var(--border-default)] hover:bg-[var(--bg-subtle)] transition-colors">
          <td className="py-3 px-4"><div className="font-medium text-[var(--text-primary)]">{r.name}</div><div className="text-xs text-[var(--text-muted)]">{r.email}</div></td>
          <td className="py-3 px-4 text-[var(--text-muted)] text-xs">{r.event}</td>
          <td className="py-3 px-4 text-center"><span className="text-xs font-medium px-2 py-0.5 rounded-full uppercase" style={{backgroundColor:`${ticketColor(r.ticket_type)}20`,color:ticketColor(r.ticket_type)}}>{r.ticket_type}</span></td>
          <td className="py-3 px-4 text-center"><Badge variant={statusVariant(r.status)} className="capitalize">{r.status}</Badge></td>
          <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)]">${r.amount_paid.toLocaleString()}</td>
          <td className="py-3 px-4 text-[var(--text-muted)]">{new Date(r.registered_at).toLocaleDateString()}</td>
        </motion.tr>
      ))}</tbody></table></div></AppCard>
    </div>
  )
}
