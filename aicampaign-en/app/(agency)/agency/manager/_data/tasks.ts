"use client";

export type TaskStatus = "open" | "done";
export type TaskSeverity = "ok" | "warning" | "critical";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;

  // optional – used for coloring / linking to campaign etc.
  severity?: TaskSeverity;

  // store accountId / campaignId / checkKey / report etc.
  meta?: Record<string, any>;
};

const STORAGE_KEY = "agency_manager_tasks_v1";

function safeParse(json: string | null): Task[] {
  if (!json) return [];
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) return [];
    return data as Task[];
  } catch {
    return [];
  }
}

function load(): Task[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

function save(items: Task[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function uid() {
  return `t_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function getTasks(): Task[] {
  const items = load();
  // newest first
  return items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export function addTask(input: Omit<Task, "id" | "createdAt">): Task {
  const items = load();
  const t: Task = {
    id: uid(),
    createdAt: Date.now(),
    status: input.status ?? "open",
    title: input.title,
    description: input.description,
    severity: input.severity,
    meta: input.meta,
  };
  items.unshift(t);
  save(items);
  return t;
}

export function deleteTask(id: string) {
  const items = load().filter((t) => t.id !== id);
  save(items);
}

export function setTaskDone(id: string) {
  const items = load().map((t) =>
    t.id === id ? { ...t, status: "done" as const } : t
  );
  save(items);
}

export function setTaskOpen(id: string) {
  const items = load().map((t) =>
    t.id === id ? { ...t, status: "open" as const } : t
  );
  save(items);
}

export function clearTasks() {
  save([]);
}
