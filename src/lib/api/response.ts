import { NextResponse } from 'next/server'

export type ApiResponse<T = any> = {
    success: boolean
    data?: T
    error?: string
    meta?: Record<string, any>
}

export function successResponse<T>(data: T, status = 200, meta?: Record<string, any>) {
    return NextResponse.json<ApiResponse<T>>(
        { success: true, data, meta },
        { status }
    )
}

export function errorResponse(error: string, status = 400) {
    return NextResponse.json<ApiResponse>(
        { success: false, error },
        { status }
    )
}

export function withErrorHandling(handler: Function) {
    return async (...args: any[]) => {
        try {
            return await handler(...args)
        } catch (error: any) {
            console.error('API Error:', error)
            return errorResponse(error.message || 'Internal Server Error', error.status || 500)
        }
    }
}
