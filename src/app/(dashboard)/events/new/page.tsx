/**
 * @file NewEventPage.tsx
 * @description Page for creating a new event in the 7STAR OS.
 */

"use client"

import { EventForm } from "@/modules/events/components/EventForm"

export default function NewEventPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Create New Event
        </h1>
        <p className="text-neutral-400 text-lg">Initialize a new event command center and define core operations.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-colors duration-1000" />
        
        <EventForm />
      </div>
    </div>
  )
}
