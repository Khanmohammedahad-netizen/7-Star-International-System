export function isMockMode() {
    return process.env.NEXT_PUBLIC_USE_MOCK === 'true' || process.env.VITE_USE_MOCK === 'true'
}
