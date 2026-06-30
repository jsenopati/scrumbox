"use client"

import { useState } from "react"
import { IoAdd, IoTrashOutline, IoCheckmarkCircle } from "react-icons/io5"

export function ChecklistBuilder() {
  const [items, setItems] = useState<string[]>([])
  const [draft, setDraft] = useState("")

  function add() {
    const value = draft.trim()
    if (!value) return
    setItems((prev) => [...prev, value])
    setDraft("")
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {/* Submitted as part of the form */}
      {items.map((item, i) => (
        <input key={i} type="hidden" name="checklistItem" value={item} />
      ))}

      <h4 className="text-sm font-medium flex items-center gap-2">
        <IoCheckmarkCircle className="text-success" />
        Checklist (optional)
      </h4>

      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-btn px-2 py-1 bg-base-100"
            >
              <span className="flex-1 text-sm">{item}</span>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle"
                onClick={() => remove(i)}
                aria-label="Remove item"
              >
                <IoTrashOutline />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Add an item…"
          className="input input-sm flex-1"
        />
        <button
          type="button"
          className="btn btn-sm"
          disabled={draft.trim().length === 0}
          onClick={add}
        >
          <IoAdd />
          Add
        </button>
      </div>
    </div>
  )
}
