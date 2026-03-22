'use client'
import { motion } from 'framer-motion'
import { Plus, Star } from 'lucide-react'
import { PageHeader } from '@/components/blocks/PageHeader'
import { AppCard } from '@/components/app/AppCard'
import { AppButton } from '@/components/primitives/AppButton'
import { cardStagger } from '@/motion/variants'
import { mockVendors } from '@/lib/mock/events'

const catColor = (c:string) => { switch(c){case 'catering': return '#22C55E'; case 'av_tech': return '#3B82F6'; case 'decoration': return '#A855F7'; case 'photography': return '#EAB308'; case 'security': return '#EF4444'; case 'entertainment': return '#F97316'; default: return '#94A3B8'} }

export default function VendorsPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Vendors" description={`${mockVendors.length} vendors`} breadcrumbs={[{label:'Dashboard',href:'/dashboard'},{label:'Vendors'}]} actions={<AppButton variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>Add Vendor</AppButton>} />
      <motion.div variants={cardStagger.container} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockVendors.map(v=>(
          <motion.div key={v.id} variants={cardStagger.item}><AppCard className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3"><div><h3 className="font-semibold text-[var(--text-primary)]">{v.name}</h3><p className="text-xs text-[var(--text-muted)]">{v.contact}</p></div><span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize" style={{backgroundColor:`${catColor(v.category)}20`,color:catColor(v.category)}}>{v.category.replace('_',' ')}</span></div>
            <div className="text-sm text-[var(--text-muted)] mb-3">{v.email} · {v.phone}</div>
            <div className="flex items-center gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} className={`w-4 h-4 ${i<v.rating?'text-amber-400 fill-amber-400':'text-gray-300'}`} />)}</div>
          </AppCard></motion.div>
        ))}
      </motion.div>
    </div>
  )
}
