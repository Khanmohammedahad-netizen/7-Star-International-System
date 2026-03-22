import React from 'react'
import { MorphingBackground } from '@/components/ui/MorphingBackground'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-neutral-900 overflow-hidden">
      {/* LEFT SIDE: Brand & Social Proof */}
      <div className="relative flex w-full lg:w-[45%] flex-col items-center justify-center p-8 lg:p-12 z-10 overflow-hidden text-white min-h-[40vh] bg-neutral-950">
        <MorphingBackground />
        
        <div className="z-10 text-center max-w-md mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200">
            MAK Software Solutions
          </h1>
          <p className="text-lg lg:text-xl font-medium text-neutral-300 mb-8">
            Engineer your operations.
          </p>

          <div className="grid grid-cols-3 gap-6 text-center border-t border-white/10 pt-8 mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Clients</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">1M+</div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Systems</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Forms */}
      <div className="flex w-full lg:w-[55%] items-center justify-center p-6 lg:p-12 bg-white rounded-t-3xl lg:rounded-t-none lg:rounded-l-3xl shadow-2xl z-20 overflow-y-auto">
        <div className="w-full max-w-md mx-auto py-12">
          {children}
        </div>
      </div>
    </div>
  )
}
