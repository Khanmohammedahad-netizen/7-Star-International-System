import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { ExampleItem } from './types'

interface ExampleListProps {
    items: ExampleItem[]
}

export function ExampleList({ items }: ExampleListProps) {
    if (items.length === 0) {
        return (
            <Card>
                <CardContent>
                    <p className="text-center text-sm text-neutral-500 py-8">
                        No items found.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <h2 className="text-lg font-semibold text-neutral-900">Example Items</h2>
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-neutral-100">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-3">
                            <span className="text-sm font-medium text-neutral-900">{item.name}</span>
                            <Badge variant={item.status === 'active' ? 'success' : 'default'}>
                                {item.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
