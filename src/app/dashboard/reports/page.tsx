'use client'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/blocks/PageHeader'
import { AppCard } from '@/components/app/AppCard'
import { StatsCard } from '@/components/blocks/StatsCard'
import { cardStagger } from '@/motion/variants'
import { CalendarDays, Users, DollarSign, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts'
import { mockEvents, mockRegistrations } from '@/lib/mock/events'

const TICKET_DONUT = [{name:'General',value:mockRegistrations.filter(r=>r.ticket_type==='general').length,color:'#94A3B8'},{name:'VIP',value:mockRegistrations.filter(r=>r.ticket_type==='vip').length,color:'#EAB308'},{name:'Speaker',value:mockRegistrations.filter(r=>r.ticket_type==='speaker').length,color:'#A855F7'},{name:'Staff',value:mockRegistrations.filter(r=>r.ticket_type==='staff').length,color:'#3B82F6'}]
const STATUS_BAR = [{name:'Planning',value:mockEvents.filter(e=>e.status==='planning').length},{name:'Confirmed',value:mockEvents.filter(e=>e.status==='confirmed').length},{name:'Active',value:mockEvents.filter(e=>e.status==='active').length},{name:'Completed',value:mockEvents.filter(e=>e.status==='completed').length}]

export default function EventReportsPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Reports" description="Event analytics" breadcrumbs={[{label:'Dashboard',href:'/dashboard'},{label:'Reports'}]} />
      <motion.div variants={cardStagger.container} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Events" value={`${mockEvents.length}`} icon={<CalendarDays className="w-5 h-5 text-blue-500" />} />
        <StatsCard title="Registrations" value={`${mockRegistrations.length}`} icon={<Users className="w-5 h-5 text-emerald-500" />} />
        <StatsCard title="Total Revenue" value={`$${Math.round(mockEvents.reduce((s,e)=>s+e.revenue,0)).toLocaleString()}`} icon={<DollarSign className="w-5 h-5 text-amber-500" />} />
        <StatsCard title="Avg Attendance" value={`${Math.round(mockEvents.reduce((s,e)=>s+e.expected_attendees,0)/Math.max(mockEvents.length,1))}`} icon={<TrendingUp className="w-5 h-5 text-purple-500" />} />
      </motion.div>
      <motion.div variants={cardStagger.container} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={cardStagger.item} className="flex"><AppCard className="w-full p-6"><h3 className="font-semibold text-[var(--text-primary)] mb-1">Ticket Types</h3><p className="text-sm text-[var(--text-muted)] mb-4">Registration distribution</p><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={TICKET_DONUT} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">{TICKET_DONUT.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><RechartsTooltip /><Legend /></PieChart></ResponsiveContainer></div></AppCard></motion.div>
        <motion.div variants={cardStagger.item} className="flex"><AppCard className="w-full p-6"><h3 className="font-semibold text-[var(--text-primary)] mb-1">Events by Status</h3><p className="text-sm text-[var(--text-muted)] mb-4">Current pipeline</p><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={STATUS_BAR}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#6b7280',fontSize:12}} /><YAxis axisLine={false} tickLine={false} tick={{fill:'#6b7280',fontSize:12}} /><RechartsTooltip contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 4px 6px -1px rgb(0 0 0/0.1)'}} /><Bar dataKey="value" fill="#8b5cf6" radius={[4,4,0,0]} barSize={30} /></BarChart></ResponsiveContainer></div></AppCard></motion.div>
      </motion.div>
    </div>
  )
}
