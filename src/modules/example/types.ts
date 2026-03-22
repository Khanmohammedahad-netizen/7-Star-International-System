export interface ExampleItem {
    id: string
    name: string
    status: 'active' | 'inactive' | 'archived'
    organizationId: string
    createdAt: string
}

export interface CreateExampleInput {
    name: string
}
