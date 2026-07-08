"use client"

import { IoAdd, IoPersonRemoveOutline } from "react-icons/io5"
import type { TeamMember } from "@/lib/data"
import {
  createTaskListAction,
  addTeamMemberAction,
  deleteTeamMemberAction,
} from "@/lib/actions"
import { TaskListFields } from "./task-fields"
import { SubmitButton } from "./submit-button"

/**
 * Editor-only management sections on the dashboard: team members and creating
 * a new task list. Lifted from the (now removed) manage page.
 */
export function DashboardAdminTools({
  teamMembers,
}: {
  teamMembers: TeamMember[]
}) {
  return (
    <div className="space-y-6 mb-8">
      {/* Team Members */}
      <div className="collapse collapse-arrow bg-base-100 shadow-sm">
        <input type="checkbox" />
        <div className="collapse-title font-semibold">Team Members</div>
        <div className="collapse-content space-y-3">
          {teamMembers.length === 0 && (
            <p className="text-sm text-base-content/60">No team members yet.</p>
          )}
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-box border border-base-300 px-4 py-2"
            >
              <span className="text-sm font-medium">{member.name}</span>
              <form action={deleteTeamMemberAction}>
                <input type="hidden" name="id" value={member.id} />
                <button type="submit" className="btn btn-error btn-xs btn-soft">
                  <IoPersonRemoveOutline />
                  Remove
                </button>
              </form>
            </div>
          ))}
          <form action={addTeamMemberAction} className="flex gap-2 pt-1">
            <input
              name="name"
              required
              placeholder="Full name"
              className="input input-sm flex-1"
            />
            <SubmitButton className="btn btn-primary btn-sm">
              Add member
            </SubmitButton>
          </form>
        </div>
      </div>

      {/* New task list */}
      <div className="collapse collapse-arrow bg-base-100 shadow-sm">
        <input type="checkbox" />
        <div className="collapse-title font-semibold flex items-center gap-2">
          <IoAdd />
          New task list
        </div>
        <div className="collapse-content">
          <form action={createTaskListAction} className="space-y-4">
            <TaskListFields />
            <SubmitButton className="btn btn-primary">
              Create task list
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  )
}
