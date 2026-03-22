import { appConfig } from '@/config/app.config'

export async function withMockData<T>(mockData: T, liveQuery: () => Promise<T>): Promise<T> {
    if (appConfig.useMock) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300))
        return mockData
    }
    return await liveQuery()
}
