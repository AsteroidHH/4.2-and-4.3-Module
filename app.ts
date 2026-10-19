/**
 * TypeTasks Studio - Main Application Logic
 * 
 * Wires the typed data model to the DOM with zero type errors and strictly typed event handlers.
 */

import {
  Task,
  TaskStatus,
  addTask,
  completeTask,
  filterByStatus,
  advanceTask,
  deleteTask,
  countByStatus,
  isTask,
  isTaskStatus
} from "./model.js";

/**
 * Valid view filter options: "all" or any valid TaskStatus.
 */
type FilterOption = "all" | TaskStatus;

// ---------------------------------------------------------------------------
// DOM Elements (Strictly typed with type casting, no `any`)
// ---------------------------------------------------------------------------

const taskForm = document.getElementById("task-form") as HTMLFormElement;
const taskTitleInput = document.getElementById("task-title") as HTMLInputElement;
const taskListElement = document.getElementById("task-list") as HTMLUListElement;
const emptyStateElement = document.getElementById("empty-state") as HTMLDivElement;
const emptyStateMessage = document.getElementById("empty-state-message") as HTMLParagraphElement;

// Stats summary badges
const statTotal = document.getElementById("stat-total") as HTMLSpanElement;
const statTodo = document.getElementById("stat-todo") as HTMLSpanElement;
const statInProgress = document.getElementById("stat-in-progress") as HTMLSpanElement;
const statDone = document.getElementById("stat-done") as HTMLSpanElement;

// Filter count pills
const chipCountAll = document.getElementById("chip-count-all") as HTMLSpanElement;
const chipCountTodo = document.getElementById("chip-count-todo") as HTMLSpanElement;
const chipCountInProgress = document.getElementById("chip-count-in-progress") as HTMLSpanElement;
const chipCountDone = document.getElementById("chip-count-done") as HTMLSpanElement;

const filterChips = document.querySelectorAll<HTMLButtonElement>(".filter-chips .chip");

// ---------------------------------------------------------------------------
// Application State
// ---------------------------------------------------------------------------

let currentFilter: FilterOption = "all";
let tasks: Task[] = loadInitialTasks();

/**
 * Loads tasks from localStorage or provides an initial set showcasing all statuses.
 */
function loadInitialTasks(): Task[] {
  try {
    const saved = localStorage.getItem("typetasks_data");
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const validated: Task[] = [];
        const rawItems: readonly unknown[] = parsed;
        for (const item of rawItems) {
          if (isTask(item)) {
            validated.push(item);
          }
        }
        if (validated.length > 0) {
          return validated;
        }
      }
    }
  } catch {
    // If reading localStorage fails, fallback to starter tasks
  }

  // Pre-populate with initial demonstration tasks
  let starter: Task[] = [];
  starter = addTask(starter, "Define TypeScript Task and TaskStatus model");
  starter = completeTask(starter, 1);
  starter = addTask(starter, "Build responsive HTML & modern CSS interface");
  starter = advanceTask(starter, 2);
  starter = addTask(starter, "Deploy TypeTasks to a live production URL");
  return starter;
}

/**
 * Persists current task list to localStorage.
 */
function persistTasks(): void {
  try {
    localStorage.setItem("typetasks_data", JSON.stringify(tasks));
  } catch {
    // Safely ignore storage quotas or permission blocks
  }
}

// ---------------------------------------------------------------------------
// UI Rendering
// ---------------------------------------------------------------------------

/**
 * Creates the formatted status badge element for a task.
 */
function createStatusBadge(status: TaskStatus): HTMLSpanElement {
  const badge = document.createElement("span");
  badge.className = `status-badge badge-${status}`;
  
  if (status === "todo") {
    badge.textContent = "To Do";
  } else if (status === "in-progress") {
    badge.textContent = "In Progress";
  } else {
    badge.textContent = "Done";
  }
  return badge;
}

/**
 * Creates a single DOM `li` element representing a Task with typed actions.
 */
function createTaskElement(task: Task): HTMLLIElement {
  const li = document.createElement("li");
  li.className = `task-item status-${task.status}`;

  // Left container: status badge + task title
  const left = document.createElement("div");
  left.className = "task-left";

  const badge = createStatusBadge(task.status);
  const titleSpan = document.createElement("span");
  titleSpan.className = "task-title";
  titleSpan.textContent = task.title;

  left.appendChild(badge);
  left.appendChild(titleSpan);

  // Right container: Action buttons
  const actions = document.createElement("div");
  actions.className = "task-actions";

  // 1. Advance button (todo -> in-progress -> done)
  if (task.status !== "done") {
    const advanceBtn = document.createElement("button");
    advanceBtn.type = "button";
    advanceBtn.className = "action-btn btn-advance";
    advanceBtn.title = task.status === "todo" ? "Move to In Progress" : "Move to Done";
    advanceBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
      <span>${task.status === "todo" ? "Start" : "Done"}</span>
    `;
    advanceBtn.addEventListener("click", () => {
      tasks = advanceTask(tasks, task.id);
      persistTasks();
      render();
    });
    actions.appendChild(advanceBtn);

    // 2. Complete button (directly complete to "done")
    const completeBtn = document.createElement("button");
    completeBtn.type = "button";
    completeBtn.className = "action-btn btn-complete";
    completeBtn.title = "Mark as Done";
    completeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Complete</span>
    `;
    completeBtn.addEventListener("click", () => {
      tasks = completeTask(tasks, task.id);
      persistTasks();
      render();
    });
    actions.appendChild(completeBtn);
  }

  // 3. Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "action-btn btn-delete";
  deleteBtn.title = "Delete task";
  deleteBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `;
  deleteBtn.addEventListener("click", () => {
    tasks = deleteTask(tasks, task.id);
    persistTasks();
    render();
  });
  actions.appendChild(deleteBtn);

  li.appendChild(left);
  li.appendChild(actions);

  return li;
}

/**
 * Updates summary statistics in the header and count badges in filter chips.
 */
function updateStatsAndChips(): void {
  const totalCount = tasks.length;
  const todoCount = countByStatus(tasks, "todo");
  const inProgressCount = countByStatus(tasks, "in-progress");
  const doneCount = countByStatus(tasks, "done");

  // Header pills
  statTotal.textContent = totalCount.toString();
  statTodo.textContent = todoCount.toString();
  statInProgress.textContent = inProgressCount.toString();
  statDone.textContent = doneCount.toString();

  // Filter chip counters
  chipCountAll.textContent = totalCount.toString();
  chipCountTodo.textContent = todoCount.toString();
  chipCountInProgress.textContent = inProgressCount.toString();
  chipCountDone.textContent = doneCount.toString();
}

/**
 * Main render function: filters tasks using typed filterByStatus and updates DOM.
 */
function render(): void {
  // Use filterByStatus for specific TaskStatus filters, or show all
  const visibleTasks: Task[] =
    currentFilter === "all"
      ? tasks
      : filterByStatus(tasks, currentFilter);

  // Clear existing items
  taskListElement.innerHTML = "";

  if (visibleTasks.length === 0) {
    emptyStateElement.classList.remove("hidden");
    emptyStateMessage.textContent =
      currentFilter === "all"
        ? "Add your first task above!"
        : `No tasks found with status "${currentFilter}".`;
  } else {
    emptyStateElement.classList.add("hidden");
    visibleTasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      taskListElement.appendChild(taskElement);
    });
  }

  updateStatsAndChips();
}

// ---------------------------------------------------------------------------
// Event Listeners
// ---------------------------------------------------------------------------

/**
 * Add Task Form submission handler
 */
taskForm.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();
  const title = taskTitleInput.value.trim();
  if (!title) {
    return;
  }

  // Call the typed addTask operation from model.ts
  tasks = addTask(tasks, title);
  persistTasks();

  taskTitleInput.value = "";
  taskTitleInput.focus();
  render();
});

/**
 * Filter Chip click handlers
 */
filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const rawFilter = chip.getAttribute("data-filter");
    if (rawFilter === "all" || isTaskStatus(rawFilter)) {
      currentFilter = rawFilter;
      filterChips.forEach((btn) => btn.classList.remove("active"));
      chip.classList.add("active");
      render();
    }
  });
});

// Initial mount
render();
