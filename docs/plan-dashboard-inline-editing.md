# Plan: Fold `/manage` CRUD into the dashboard (inline, editor-gated)

Status: in progress. Commits 1–8 done. Pick up at commit 9.

## Vision (locked)

- **No edit-mode toggle.** Everything is gated on `canEdit = role === "editor"`,
  mirroring the existing inline checklist/notes editing in the task modal.
- **Viewers** see today's dashboard unchanged. **Editors (admins)** get every
  field editable in place.
- **Task modal**: fields become editable behind a single **Save** button
  (Notes-style dirty/"Saved" feedback), reusing `updateTaskAction`.
- **Team members + New task list**: editor-only sections rendered on the
  dashboard (lifted from the manage page — not suited to inline editing).
- **Drag-and-drop reorder** (tasks within a list, lists within a section) via
  Atlassian **Pragmatic drag and drop**. No up/down arrow buttons.
- **Delete the `/manage` route** at the very end.

## Key facts / gotchas

- Roles live in `lib/session.ts` (`viewer` | `editor`). **`editor` == admin.**
- Server actions currently in `app/manage/actions.ts`; all call
  `revalidatePath("/manage")` **and** `revalidatePath("/dashboard")`.
- `components/task-checklist-notes.tsx` imports actions from
  `@/app/manage/actions`.
- **Reorder is swap-only today** (`reorderTaskList` / `reorderTask` take
  `"up" | "down"`). Drag-and-drop needs arbitrary repositioning → add
  index-based `setTaskListOrder(orderedIds)` / `setTaskOrder(listId, orderedIds)`
  that rewrite `sort_order` from a full ordered id list.
- **`Task.sortOrder` doubles as the flow "step"** — `groupByStep` in
  `components/dashboard-view.tsx` treats tasks sharing a `sortOrder` as
  concurrent (no arrow between them). Dragging tasks will linearize steps;
  keep the manual **Step** field in the modal for setting concurrency.
- `TaskFields` / `TaskListFields` are currently defined inline inside
  `app/manage/page.tsx` and need extracting to be reused on the dashboard.
- DnD packages installed: `@atlaskit/pragmatic-drag-and-drop`,
  `@atlaskit/pragmatic-drag-and-drop-hitbox`,
  `@atlaskit/pragmatic-drag-and-drop-auto-scroll`.

## Decisions locked

- Save behavior: **Save button in the modal** (not auto-save).
- Reordering: **drag-and-drop only**, no arrows.
- DnD library: **Atlassian Pragmatic drag and drop**.

## Commit sequence

Each commit must build + lint green and leave the app working. `/manage` stays
alive until the final commit so nothing breaks mid-stream.

1. **`chore(deps): install Pragmatic drag and drop`** — ✅ **DONE**
   Added `@atlaskit/pragmatic-drag-and-drop` `^2.0.1`, `-hitbox` `^2.0.0`,
   `-auto-scroll` `^3.0.0`.
2. **`refactor(actions): move server actions out of /manage`** — ✅ **DONE**
   Relocated `app/manage/actions.ts` → `lib/actions.ts` (via `git mv`). Updated imports in
   `app/manage/page.tsx` and `components/task-checklist-notes.tsx`. Pure move.
3. **`feat(data): index-based reorder for lists and tasks`** — ✅ **DONE**
   Added `setTaskListOrder` / `setTaskOrder` to `lib/data.ts` +
   `reorderTaskListsAction` / `reorderTasksAction` in `lib/actions.ts`. Additive, not wired to UI.
4. **`refactor(ui): extract shared TaskFields / TaskListFields`** — ✅ **DONE**
   Moved them into `components/task-fields.tsx`; manage page imports them.
5. **`feat(dashboard): editable task fields in the detail modal`** — ✅ **DONE**
   In `components/task-detail-modal.tsx`, editors get `TaskFields` inside a
   `<form action={updateTaskAction}>` with a Save button + delete-task button;
   read-only otherwise. Threaded `teamNames` + `listId`
   `dashboard/page.tsx` → `DashboardView` → modal.
6. **`feat(dashboard): inline task-list editing on cards`** — ✅ **DONE**
   New `components/list-admin-controls.tsx` (edit-details / add-task dialogs +
   archive) rendered on Simple and Detailed list cards for editors. Threaded
   `canEdit` + `teamNames` into both card components.
7. **`feat(dashboard): admin-only Team Members & New Task List sections`** — ✅ **DONE**
   New `components/dashboard-admin-tools.tsx` (team-member add/remove +
   new-list form), rendered when `canEdit`. Threaded `teamMembers` from page.
8. **`feat(dashboard): drag-and-drop reordering`** — ✅ **DONE**
   New `components/sortable.tsx` (Pragmatic DnD closest-edge helpers).
   - 8a — draggable task-list cards within a section (Simple + Detailed) →
     `reorderTaskListsAction` (rebuilds full global order via
     `reorderSectionInGlobal`).
   - 8b — draggable task nodes within a list (Detailed view) →
     `reorderTasksAction`; drag linearizes steps, concurrency stays manual via
     the Step field. Simple-view task nodes remain click-only.
9. **`feat: remove /manage and clean up`**
   Delete `app/manage/`, remove the header Manage link, drop the dead swap
   actions and all `revalidatePath("/manage")` calls.

## Open micro-decisions (for later commits)

- **Cross-section list dragging** (drop a list into a different section to change
  its `section`) — bonus, currently scoped out; 8a is within-section only.
- **Actions home** — proposed `lib/actions.ts`; could be `app/actions.ts` instead.
