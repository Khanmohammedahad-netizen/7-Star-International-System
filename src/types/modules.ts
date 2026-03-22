export interface ModuleDefinition {
    id: string
    name: string
    description: string
    basePath: string
    icon: string
}

export interface ServiceResponse<T> {
    data: T | null
    error: string | null
}
