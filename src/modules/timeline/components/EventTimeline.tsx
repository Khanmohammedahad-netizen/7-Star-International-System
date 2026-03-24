// @ts-nocheck
import { useTimeline } from '../hooks/useTimeline'
import { TimelineItem } from '@/modules/events/types'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GripVertical, MoreHorizontal, Plus, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Individual Sortable Item
function SortableTimelineRow({ item, isLive }: { item: TimelineItem; isLive: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1
  }

  const isCompleted = item.status === 'completed'
  const isPast = isLive && item.time < '10:00' // Mock current time for demonstration

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-4 py-3 px-2 border-b border-border/50 bg-background transition-opacity ${isDragging ? 'opacity-50 shadow-md rounded-md' : ''} ${isPast && !isCompleted ? 'opacity-50' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab hover:bg-muted p-1 rounded text-muted-foreground outline-none">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="w-14 font-mono font-medium text-sm">
        {isLive && isCompleted ? <Check className="w-4 h-4 text-green-500" /> : item.time}
      </div>

      <Badge variant="secondary" className="w-24 justify-center uppercase text-[10px] tracking-wider shrink-0">
        {item.category}
      </Badge>

      <div className="flex-1 font-medium text-sm truncate">
        {item.title}
        {item.description && <span className="text-muted-foreground font-normal ml-2">— {item.description}</span>}
      </div>

      <div className="text-muted-foreground shrink-0 hidden md:block">
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export function EventTimeline({ eventId }: { eventId: string }) {
  const { data: initialItems, isLoading } = useTimeline(eventId)
  const [items, setItems] = useState<TimelineItem[]>([])
  const [isLiveMode, setIsLiveMode] = useState(false)

  // Sync data
  useEffect(() => {
    if (initialItems) setItems(initialItems)
  }, [initialItems])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />)}</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground">Run of Show</h2>
          <p className="text-sm text-muted-foreground">Reorder items via drag and drop during planning.</p>
        </div>
        <Button variant={isLiveMode ? 'danger' : 'default'} onClick={() => setIsLiveMode(!isLiveMode)}>
          {isLiveMode ? 'Exit Live Mode' : 'Go Live'}
        </Button>
      </div>

      <div className="relative border border-border/60 rounded-xl overflow-hidden bg-background">
        
        {/* Live Indicator Mock Line */}
        {isLiveMode && (
          <motion.div 
            animate={{ opacity: 1 }}
            className="absolute left-0 right-0 h-0.5 bg-yellow-500 z-10 shadow-[0_0_8px_rgba(234,179,8,0.8)] pointer-events-none"
            style={{ top: '35%' }}
          >
            <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-yellow-500 rounded-full" />
            <span className="absolute right-2 -top-5 text-xs font-mono font-bold text-yellow-500">NOW: 10:45</span>
          </motion.div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map(item => (
              <SortableTimelineRow key={item.id} item={item} isLive={isLiveMode} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {!isLiveMode && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" className="w-full border-dashed" size="lg">
            <Plus className="w-4 h-4 mr-2" /> Add Timeline Item
          </Button>
        </div>
      )}
    </div>
  )
}

