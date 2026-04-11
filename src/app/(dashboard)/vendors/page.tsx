'use client'

import { useState } from 'react'
import { VendorDirectory } from '@/modules/vendors/components/VendorDirectory'
import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { VendorForm } from '@/modules/vendors/components/VendorForm'

export default function VendorsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> Vendor Directory
          </h1>
          <p className="text-neutral-400 mt-2 text-lg">Manage elite partners and global service providers.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="hidden md:flex bg-white text-black font-bold h-11 px-6 hover:bg-neutral-200">
          <Plus className="w-4 h-4 mr-2" /> Add New Vendor
        </Button>
      </div>

      {/* Mobile FAB */}
      <button
          onClick={() => setIsAddModalOpen(true)}
          className="md:hidden fixed bottom-[84px] right-4 w-14 h-14 bg-[#C9A84C] text-black rounded-full shadow-[0_4px_20px_rgba(201,168,76,0.4)] flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
          <Plus className="w-6 h-6 stroke-2" />
      </button>

      <VendorDirectory />

      <Modal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add Vendor to Directory"
      >
        <VendorForm onSuccess={() => setIsAddModalOpen(false)} />
      </Modal>
    </div>
  )
}
