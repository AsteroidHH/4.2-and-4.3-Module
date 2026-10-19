/**
 * TypeTasks - Part 1: Typed Logic Layer
 * 
 * Data model and pure functions for managing tasks with compile-time type safety.
 */

/**
 * TaskStatus literal union representing all valid states of a task.
 */
export type TaskStatus = "todo" | "in-progress" | "done";

/**
 * Task interface defining the exact shape of a task.
 */
export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

/**
 * Appends a new task with status "todo" and a unique id to the tasks array.
 * 
 * @param tasks - The existing list of tasks
 * @param title - The title of the task to add
 * @returns A new array containing the existing tasks plus the newly created task
 */
export function addTask(tasks: Task[], title: string): Task[] {
  const nextId = tasks.reduce((maxId, task) => (task.id > maxId ? task.id : maxId), 0) + 1;
  const newTask: Task = {
    id: nextId,
    title,
    status: "todo",
  };
  return [...tasks, newTask];
}

/**
 * Marks the task with the matching id as "done".
 * 
 * @param tasks - The existing list of tasks
 * @param id - The id of the task to complete
 * @returns A new array with the target task's status updated to "done"
 */
export function completeTask(tasks: Task[], id: number): Task[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, status: "done" } : task
  );
}

/**
 * Filters tasks by a specific TaskStatus.
 * 
 * @param tasks - The list of tasks to filter
 * @param status - The TaskStatus to filter by ("todo" | "in-progress" | "done")
 * @returns A new array containing only tasks matching the provided status
 */
export function filterByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status);
}

// ---------------------------------------------------------------------------
// Make It Yours: Custom Typed Operations
// ---------------------------------------------------------------------------

/**
 * Removes a task with the matching id from the tasks array.
 * 
 * @param tasks - The existing list of tasks
 * @param id - The id of the task to remove
 * @returns A new array without the task with the specified id
 */
export function deleteTask(tasks: Task[], id: number): Task[] {
  return tasks.filter((task) => task.id !== id);
}

/**
 * Advances a task to the next logical state in the workflow:
 * "todo" -> "in-progress" -> "done". Tasks already "done" remain "done".
 * 
 * @param tasks - The existing list of tasks
 * @param id - The id of the task to advance
 * @returns A new array with the target task advanced to its next status
 */
export function advanceTask(tasks: Task[], id: number): Task[] {
  return tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }
    const nextStatus: TaskStatus =
      task.status === "todo"
        ? "in-progress"
        : "done";
    return { ...task, status: nextStatus };
  });
}

/**
 * Counts how many tasks exist with a given status.
 * 
 * @param tasks - The list of tasks to count
 * @param status - The TaskStatus to count
 * @returns The count of tasks matching the given status
 */
export function countByStatus(tasks: Task[], status: TaskStatus): number {
  return tasks.filter((task) => task.status === status).length;
}

/**
 * Updates the title of a specific task.
 * 
 * @param tasks - The existing list of tasks
 * @param id - The id of the task to update
 * @param newTitle - The updated title text
 * @returns A new array with the target task's title updated
 */
export function updateTaskTitle(tasks: Task[], id: number, newTitle: string): Task[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, title: newTitle } : task
  );
}
