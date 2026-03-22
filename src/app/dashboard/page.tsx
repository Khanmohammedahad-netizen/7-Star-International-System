'use client'
import { motion } from 'framer-motion'
import { CalendarDays, Users, DollarSign, Percent } from 'lucide-react'
import { PageHeader } from '@/components/blocks/PageHeader'
import { StatsCard } from '@/components/blocks/StatsCard'
import { AppCard } from '@/components/app/AppCard'
import { Badge } from '@/components/primitives/Badge'
import { cardStagger } from '@/motion/variants'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts'
import { mockEvents, mockRegistrations } from '@/lib/mock/events'
import { DateTime } from 'luxon'

const upcoming = mockEvents.filter(e => e.status !== 'completed').length
const totalRegs = mockRegistrations.length
const totalRev = mockEvents.reduce((s,e)=>s+e.revenue,0)
const avgBudget = Math.round(mockEvents.reduce((s,e)=>s+e.spent,0) / Math.max(mockEvents.reduce((s,e)=>s+e.budget,0),1) * 100)

const TYPE_DONUT = [{name:'Conference',value:mockEvents.filter(e=>e.type==='conference').length,color:'#3B82F6'},{name:'Corporate',value:mockEvents.filter(e=>e.type==='corporate').length,color:'#22C55E'},{name:'Workshop',value:mockEvents.filter(e=>e.type==='workshop').length,color:'#EAB308'},{name:'Gala',value:mockEvents.filter(e=>e.type==='gala').length,color:'#A855F7'},{name:'Other',value:mockEvents.filter(e=>!['conference','corporate','workshop','gala'].includes(e.type)).length,color:'#94A3B8'}]
const BUDGET_BAR = mockEvents.slice(0,5).map(e => ({ name: e.name.substring(0,12), budget: Math.round(e.budget), spent: Math.round(e.spent) }))
const statusVariant = (s:string) => { switch(s){case 'confirmed': case 'active': return 'success' as const; case 'planning': return 'brand' as const; case 'completed': return 'default' as const; default: return 'default' as const} }

export default function EventDashboardPage() {
  return (
    <div className="space-y-8 pb-8">
      <PageHeader title="Event Dashboard" description={DateTime.local().toFormat('EEEE, MMMM dd, yyyy')} breadcrumbs={[{label:'Dashboard'}]} />
      <motion.div variants={cardStagger.container} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Upcoming Events" value={`${upcoming}`} icon={<CalendarDays className="w-5 h-5 text-blue-500" />} />
        <StatsCard title="Registrations" value={`${totalRegs}`} icon={<Users className="w-5 h-5 text-emerald-500" />} />
        <StatsCard title="Revenue" value={`$${Math.round(totalRev).toLocaleString()}`} icon={<DollarSign className="w-5 h-5 text-amber-500" />} />
        <StatsCard title="Budget Used" value={`${avgBudget}%`} icon={<Percent className="w-5 h-5 text-purple-500" />} />
      </motion.div>
      <motion.div variants={cardStagger.container} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={cardStagger.item} className="lg:col-span-2 flex"><AppCard className="w-full p-6"><h3 className="font-semibold text-[var(--text-primary)] mb-1">Budget vs Spent</h3><p className="text-sm text-[var(--text-muted)] mb-4">Per event</p><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={BUDGET_BAR}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#6b7280',fontSize:10}} /><YAxis axisLine={false} tickLine={false} tick={{fill:'#6b7280',fontSize:12}} tickFormatter={(v:any)=>`$${v/1000}k`} /><RechartsTooltip contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 4px 6px -1px rgb(0 0 0/0.1)'}} formatter={(v:any)=>[`$${Number(v).toLocaleString()}`]} /><Legend /><Bar dataKey="budget" name="Budget" fill="#3B82F6" radius={[4,4,0,0]} /><Bar dataKey="spent" name="Spent" fill="#EF4444" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></AppCard></motion.div>
        <motion.div variants={cardStagger.item} className="flex"><AppCard className="w-full p-6"><h3 className="font-semibold text-[var(--text-primary)] mb-1">Event Types</h3><p className="text-sm text-[var(--text-muted)] mb-4">Distribution</p><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={TYPE_DONUT.filter(d=>d.value>0)} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">{TYPE_DONUT.filter(d=>d.value>0).map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><RechartsTooltip /><Legend /></PieChart></ResponsiveContainer></div></AppCard></motion.div>
      </motion.div>
      <AppCard className="p-6"><div className="mb-4"><h3 className="font-semibold text-[var(--text-primary)]">Upcoming Events</h3></div><div className="space-y-3">{mockEvents.filter(e=>e.status!=='completed').slice(0,4).map(e=>(
        <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer">
          <div><div className="font-medium text-sm text-[var(--text-primary)]">{e.name}</div><div className="text-xs text-[var(--text-muted)]">{e.start_date} · {e.location} · {e.venue}</div></div>
          <div className="flex items-center gap-3"><span className="text-sm font-medium text-[var(--text-primary)]">{e.expected_attendees} attendees</span><Badge variant={statusVariant(e.status)} className="capitalize">{e.status}</Badge></div>
        </div>
      ))}</div></AppCard>
    </div>
  )
}
