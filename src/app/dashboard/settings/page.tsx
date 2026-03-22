"use client"

import { useState } from 'react'
import { PageHeader } from '@/components/blocks/PageHeader'
import { AppCard } from '@/components/app/AppCard'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { Label } from '@/components/ui/label'
import { UserCircle, Users, LayoutTemplate, Shield, Bell } from 'lucide-react'

// Note: Ensure @/components/ui/label actually exports Label or replace with basic markup

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile')

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: <UserCircle className="w-4 h-4" /> },
        { id: 'team', label: 'Team & Roles', icon: <Users className="w-4 h-4" /> },
        { id: 'pipeline', label: 'Pipeline Config', icon: <LayoutTemplate className="w-4 h-4" /> },
        { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    ]

    return (
        <div className="space-y-6 pb-8">
            <PageHeader
                title="Settings"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Settings', href: '/dashboard/settings' }
                ]}
            />

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0">
                    <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? 'bg-neutral-900 text-white' 
                                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1">
                    <AppCard className="p-6">
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">Profile Information</h3>
                                    <p className="text-sm text-neutral-500">Update your account's profile information and email address.</p>
                                </div>
                                <div className="space-y-4 max-w-xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-20 h-20 rounded-full bg-neutral-100 border border-neutral-200"></div>
                                        <Button variant="outline" size="sm">Change Avatar</Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">First Name</Label>
                                            <Input id="first_name" defaultValue="Alex" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <Input id="last_name" defaultValue="Smith" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" defaultValue="alex@example.com" />
                                    </div>
                                    <div className="pt-4">
                                        <Button>Save Changes</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">Team Members</h3>
                                    <p className="text-sm text-neutral-500">Manage who has access to this workspace.</p>
                                </div>
                                <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-200">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500">AS</div>
                                            <div>
                                                <p className="text-sm font-medium text-neutral-900">Alex Smith</p>
                                                <p className="text-xs text-neutral-500">alex@example.com</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Owner</span>
                                    </div>
                                    <div className="p-4">
                                        <Button variant="outline" className="w-full border-dashed">Invite Team Member</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pipeline' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-900 mb-1">Pipeline Stages</h3>
                                        <p className="text-sm text-neutral-500">Customize the stages of your sales pipeline.</p>
                                    </div>
                                    <Button size="sm">Add Stage</Button>
                                </div>
                                <div className="space-y-3">
                                    {['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'].map((stage, i) => (
                                        <div key={stage} className="flex items-center gap-4 p-3 border border-neutral-200 rounded-lg bg-neutral-50/50">
                                            <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center bg-white border border-neutral-200 text-neutral-400 font-medium text-xs">
                                                {i + 1}
                                            </div>
                                            <Input defaultValue={stage} className="bg-white max-w-[200px]" />
                                            <div className="flex-1"></div>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">Remove</Button>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4">
                                    <Button>Save Pipeline Configuration</Button>
                                </div>
                            </div>
                        )}
                        
                        {(activeTab === 'security' || activeTab === 'notifications') && (
                            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-300">
                                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                                    <Shield className="w-6 h-6 text-neutral-400" />
                                </div>
                                <h3 className="text-sm font-medium text-neutral-900">Coming Soon</h3>
                                <p className="text-xs text-neutral-500 mt-1">This settings panel is under construction.</p>
                            </div>
                        )}
                    </AppCard>
                </div>
            </div>
        </div>
    )
}
