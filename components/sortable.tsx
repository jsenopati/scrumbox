"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"

// ---------------------------------------------------------------------------
// A minimal reorderable list built on Pragmatic drag-and-drop.
//
// Wrap a group of siblings in <SortableGroup> and each sibling in
// <SortableItem>. On drop the group calls `onReorder` with the full list of
// item ids in their new order.
// ---------------------------------------------------------------------------

type GroupContextValue = {
  instanceId: symbol
}

const GroupContext = createContext<GroupContextValue | null>(null)

function computeReorder(
  list: string[],
  startId: string,
  targetId: string,
  edge: Edge | null,
): string[] {
  if (startId === targetId) return list
  const without = list.filter((id) => id !== startId)
  const targetIndex = without.indexOf(targetId)
  if (targetIndex === -1) return list
  const insertIndex =
    edge === "bottom" || edge === "right" ? targetIndex + 1 : targetIndex
  without.splice(insertIndex, 0, startId)
  return without
}

export function SortableGroup({
  items,
  onReorder,
  children,
}: {
  items: string[]
  onReorder: (orderedIds: string[]) => void
  children: ReactNode
}) {
  const instanceRef = useRef<symbol | null>(null)
  if (instanceRef.current === null) instanceRef.current = Symbol("sortable")
  const instanceId = instanceRef.current

  const itemsRef = useRef(items)
  itemsRef.current = items
  const onReorderRef = useRef(onReorder)
  onReorderRef.current = onReorder

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.instanceId === instanceId,
      onDrop: ({ source, location }) => {
        const target = location.current.dropTargets[0]
        if (!target) return
        const startId = source.data.id as string
        const targetId = target.data.id as string
        const edge = extractClosestEdge(target.data)
        const current = itemsRef.current
        const next = computeReorder(current, startId, targetId, edge)
        const unchanged =
          next.length === current.length &&
          next.every((id, i) => id === current[i])
        if (unchanged) return
        onReorderRef.current(next)
      },
    })
  }, [instanceId])

  return (
    <GroupContext.Provider value={{ instanceId }}>
      {children}
    </GroupContext.Provider>
  )
}

function DropIndicator({ edge }: { edge: Edge }) {
  const position: Record<Edge, string> = {
    top: "top-0 left-0 right-0 h-0.5",
    bottom: "bottom-0 left-0 right-0 h-0.5",
    left: "top-0 bottom-0 left-0 w-0.5",
    right: "top-0 bottom-0 right-0 w-0.5",
  }
  return (
    <div
      className={`pointer-events-none absolute z-10 rounded bg-primary ${position[edge]}`}
    />
  )
}

export function SortableItem({
  id,
  orientation = "vertical",
  className,
  children,
}: {
  id: string
  orientation?: "vertical" | "horizontal"
  className?: string
  children: ReactNode
}) {
  const ctx = useContext(GroupContext)
  const ref = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [edge, setEdge] = useState<Edge | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !ctx) return
    const { instanceId } = ctx
    const allowedEdges: Edge[] =
      orientation === "vertical" ? ["top", "bottom"] : ["left", "right"]

    return combine(
      draggable({
        element: el,
        getInitialData: () => ({ instanceId, id }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      }),
      dropTargetForElements({
        element: el,
        canDrop: ({ source }) =>
          source.data.instanceId === instanceId && source.data.id !== id,
        getData: ({ input, element }) =>
          attachClosestEdge(
            { instanceId, id },
            { input, element, allowedEdges },
          ),
        onDrag: ({ self }) => setEdge(extractClosestEdge(self.data)),
        onDragLeave: () => setEdge(null),
        onDrop: () => setEdge(null),
      }),
    )
  }, [ctx, id, orientation])

  return (
    <div
      ref={ref}
      className={`relative ${dragging ? "opacity-40" : ""} ${className ?? ""}`}
    >
      {children}
      {edge && <DropIndicator edge={edge} />}
    </div>
  )
}

// Conditionally enable sorting without changing the DOM shape when disabled.
export function MaybeSortableGroup({
  enabled,
  items,
  onReorder,
  children,
}: {
  enabled: boolean
  items: string[]
  onReorder: (orderedIds: string[]) => void
  children: ReactNode
}) {
  if (!enabled) return <>{children}</>
  return (
    <SortableGroup items={items} onReorder={onReorder}>
      {children}
    </SortableGroup>
  )
}

export function MaybeSortableItem({
  enabled,
  id,
  orientation,
  className,
  children,
}: {
  enabled: boolean
  id: string
  orientation?: "vertical" | "horizontal"
  className?: string
  children: ReactNode
}) {
  if (!enabled) return <>{children}</>
  return (
    <SortableItem id={id} orientation={orientation} className={className}>
      {children}
    </SortableItem>
  )
}
