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
import { disableNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview"
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { IoReorderTwoOutline } from "react-icons/io5"

// ---------------------------------------------------------------------------
// A minimal reorderable list built on Pragmatic drag-and-drop.
//
// Wrap a group of siblings in <SortableGroup> and each sibling in
// <SortableItem>. Each item exposes a grab handle in a left gutter; dragging
// it and dropping on a sibling calls the group's `onReorderAction` with the
// full list of item ids in their new order.
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

// ---------------------------------------------------------------------------
// Step-aware reordering for tasks. A "step" is a group of task ids shown as
// concurrent (they share a sort_order). Dropping a task *beside* another
// (along the concurrent axis) joins that step; dropping *across* creates a new
// step before/after the target's step.
// ---------------------------------------------------------------------------

type ConcurrentAxis = "horizontal" | "vertical"

function stepsEqual(a: string[][], b: string[][]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[i][j]) return false
    }
  }
  return true
}

function computeStepReorder(
  steps: string[][],
  startId: string,
  targetId: string,
  edge: Edge | null,
  concurrentAxis: ConcurrentAxis,
): string[][] {
  if (startId === targetId || edge === null) return steps
  // Remove the dragged id, then discard any step it emptied.
  const next = steps
    .map((step) => step.filter((id) => id !== startId))
    .filter((step) => step.length > 0)

  let targetStep = -1
  let targetPos = -1
  for (let i = 0; i < next.length; i++) {
    const idx = next[i].indexOf(targetId)
    if (idx !== -1) {
      targetStep = i
      targetPos = idx
      break
    }
  }
  if (targetStep === -1) return steps

  // Edges parallel to the concurrent axis join the target's step; edges across
  // it start a new step.
  const joinStep =
    concurrentAxis === "horizontal"
      ? edge === "left" || edge === "right"
      : edge === "top" || edge === "bottom"

  if (joinStep) {
    const after =
      concurrentAxis === "horizontal" ? edge === "right" : edge === "bottom"
    const merged = [...next[targetStep]]
    merged.splice(after ? targetPos + 1 : targetPos, 0, startId)
    next[targetStep] = merged
  } else {
    const after =
      concurrentAxis === "horizontal" ? edge === "bottom" : edge === "right"
    next.splice(after ? targetStep + 1 : targetStep, 0, [startId])
  }
  return next
}

export function SortableGroup({
  items,
  onReorderAction,
  children,
}: {
  items: string[]
  onReorderAction: (orderedIds: string[]) => void
  children: ReactNode
}) {
  const instanceRef = useRef<symbol | null>(null)
  if (instanceRef.current === null) instanceRef.current = Symbol("sortable")
  const instanceId = instanceRef.current

  const itemsRef = useRef(items)
  itemsRef.current = items
  const onReorderRef = useRef(onReorderAction)
  onReorderRef.current = onReorderAction

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

// Step-aware group for tasks. Reports the new step structure (list of
// concurrent groups) rather than a flat order.
export function TaskSortableGroup({
  steps,
  concurrentAxis,
  onReorderAction,
  children,
}: {
  steps: string[][]
  concurrentAxis: ConcurrentAxis
  onReorderAction: (steps: string[][]) => void
  children: ReactNode
}) {
  const instanceRef = useRef<symbol | null>(null)
  if (instanceRef.current === null)
    instanceRef.current = Symbol("task-sortable")
  const instanceId = instanceRef.current

  const stepsRef = useRef(steps)
  stepsRef.current = steps
  const onReorderRef = useRef(onReorderAction)
  onReorderRef.current = onReorderAction
  const axisRef = useRef(concurrentAxis)
  axisRef.current = concurrentAxis

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.instanceId === instanceId,
      onDrop: ({ source, location }) => {
        const target = location.current.dropTargets[0]
        if (!target) return
        const startId = source.data.id as string
        const targetId = target.data.id as string
        const edge = extractClosestEdge(target.data)
        const current = stepsRef.current
        const next = computeStepReorder(
          current,
          startId,
          targetId,
          edge,
          axisRef.current,
        )
        if (stepsEqual(next, current)) return
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
      className={`pointer-events-none absolute z-20 rounded bg-primary ${position[edge]}`}
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
  orientation?: "vertical" | "horizontal" | "free"
  className?: string
  children: ReactNode
}) {
  const ctx = useContext(GroupContext)
  const itemRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLButtonElement>(null)
  const [dragging, setDragging] = useState(false)
  const [edge, setEdge] = useState<Edge | null>(null)

  useEffect(() => {
    const el = itemRef.current
    const handle = handleRef.current
    if (!el || !handle || !ctx) return
    const { instanceId } = ctx
    const allowedEdges: Edge[] =
      orientation === "free"
        ? ["top", "bottom", "left", "right"]
        : orientation === "vertical"
          ? ["top", "bottom"]
          : ["left", "right"]

    return combine(
      draggable({
        element: el,
        dragHandle: handle,
        getInitialData: () => ({ instanceId, id }),
        // Suppress the browser's default full-element drag image (the
        // "onion-skin" ghost); we dim the source + show a drop indicator
        // instead.
        onGenerateDragPreview: ({ nativeSetDragImage }) =>
          disableNativeDragPreview({ nativeSetDragImage }),
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
      ref={itemRef}
      className={`relative pl-7 ${dragging ? "opacity-40" : ""} ${className ?? ""}`}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label="Drag to reorder"
        title="Drag to reorder"
        className="absolute left-0 top-3 z-20 flex h-6 w-6 cursor-grab touch-none items-center justify-center rounded-md border border-base-300 bg-base-100 text-base-content/50 shadow-sm hover:bg-base-200 hover:text-base-content active:cursor-grabbing"
      >
        <IoReorderTwoOutline size={16} />
      </button>
      {children}
      {edge && <DropIndicator edge={edge} />}
    </div>
  )
}

// Conditionally enable sorting without changing the DOM shape when disabled.
export function MaybeSortableGroup({
  enabled,
  items,
  onReorderAction,
  children,
}: {
  enabled: boolean
  items: string[]
  onReorderAction: (orderedIds: string[]) => void
  children: ReactNode
}) {
  if (!enabled) return <>{children}</>
  return (
    <SortableGroup items={items} onReorderAction={onReorderAction}>
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
  orientation?: "vertical" | "horizontal" | "free"
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

export function MaybeTaskSortableGroup({
  enabled,
  steps,
  concurrentAxis,
  onReorderAction,
  children,
}: {
  enabled: boolean
  steps: string[][]
  concurrentAxis: ConcurrentAxis
  onReorderAction: (steps: string[][]) => void
  children: ReactNode
}) {
  if (!enabled) return <>{children}</>
  return (
    <TaskSortableGroup
      steps={steps}
      concurrentAxis={concurrentAxis}
      onReorderAction={onReorderAction}
    >
      {children}
    </TaskSortableGroup>
  )
}
