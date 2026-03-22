'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { Role, hasMinimumRole } from '@/config/roles.config'

interface AuthContextType {
    role: Role | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ role: null, isLoading: true })

export function AuthProvider({ 
    children, 
    initialRole 
}: { 
    children: ReactNode; 
    initialRole: Role | null;
}) {
    return (
        <AuthContext.Provider value={{ role: initialRole, isLoading: false }}>
            {children}
        </AuthContext.Provider>
    )
}

export function usePermission() {
    const { role, isLoading } = useContext(AuthContext)

    const can = (minimumRole: Role) => {
        if (!role) return false
        return hasMinimumRole(role, minimumRole)
    }

    return { role, isLoading, can }
}

interface CanProps {
    role: Role;
    children: ReactNode;
    fallback?: ReactNode;
}

export function Can({ role: minimumRole, children, fallback = null }: CanProps) {
    const { can, isLoading } = usePermission()

    if (isLoading) return null
    if (can(minimumRole)) return <>{children}</>
    return <>{fallback}</>
}
