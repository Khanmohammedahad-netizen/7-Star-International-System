import Link from 'next/link'

export interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-6">
            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-1.5">
                    {index > 0 && <span className="text-neutral-300">/</span>}
                    {item.href ? (
                        <Link href={item.href} className="hover:text-neutral-900 transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-neutral-900 font-medium">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    )
}
