/**
 * Persistence layer for the scheduler using SQLite
 */
import { createRequire } from "node:module";
import type DatabaseConstructor from "better-sqlite3";
import { RunState, Task, TaskState } from "./types";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3") as DatabaseConstructor;
type DatabaseInstance = InstanceType<DatabaseConstructor>;

export interface PersistenceOptions {
  dbPath?: string;
}

export class Persistence {
  private db: DatabaseInstance;
  private dbPath: string;

  constructor(options: PersistenceOptions = {}) {
    this.dbPath = options.dbPath || ":memory:"; // Use in-memory DB by default for testing
    this.db = new Database(this.dbPath);

    // Create tables if they don't exist
    this.initTables();
  }

  private initTables(): void {
    // Create runs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS runs (
        id TEXT PRIMARY KEY,
        start_time TEXT,
        end_time TEXT,
        status TEXT
      )
    `);

    // Create tasks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        run_id TEXT,
        title TEXT,
        repo TEXT,
        tool TEXT,
        depends_on TEXT,
        state TEXT,
        assigned_model TEXT,
        start_time TEXT,
        end_time TEXT,
        error TEXT,
        retry_count INTEGER,
        max_retries INTEGER,
        FOREIGN KEY (run_id) REFERENCES runs (id)
      )
    `);

    // Create an index on run_id for faster queries
    this.db.exec(
      "CREATE INDEX IF NOT EXISTS idx_tasks_run_id ON tasks (run_id)",
    );
  }

  saveRunState(runState: RunState): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO runs (id, start_time, end_time, status)
      VALUES (@id, @startTime, @endTime, @status)
    `);

    stmt.run({
      id: runState.id,
      startTime: runState.startTime.toISOString(),
      endTime: runState.endTime?.toISOString() || null,
      status: runState.status,
    });

    // Save tasks
    this.saveTasks(runState.id, runState.tasks);
  }

  loadRunState(runId: string): RunState | null {
    interface RunRow {
      id: string;
      start_time: string;
      end_time: string | null;
      status: string;
    }

    const runRow = this.db
      .prepare("SELECT * FROM runs WHERE id = ?")
      .get(runId) as RunRow | undefined;

    if (!runRow) {
      return null;
    }

    const tasks = this.loadTasks(runId);

    return {
      id: runRow.id,
      tasks,
      startTime: new Date(runRow.start_time),
      endTime: runRow.end_time ? new Date(runRow.end_time) : undefined,
      status: runRow.status as "running" | "completed" | "failed" | "cancelled",
    };
  }

  private saveTasks(runId: string, tasks: Task[]): void {
    const deleteStmt = this.db.prepare("DELETE FROM tasks WHERE run_id = ?");
    deleteStmt.run(runId);

    const insertStmt = this.db.prepare(`
      INSERT INTO tasks (
        id, run_id, title, repo, tool, depends_on, state, assigned_model,
        start_time, end_time, error, retry_count, max_retries
      ) VALUES (
        @id, @runId, @title, @repo, @tool, @dependsOn, @state, @assignedModel,
        @startTime, @endTime, @error, @retryCount, @maxRetries
      )
    `);

    for (const task of tasks) {
      insertStmt.run({
        id: task.id,
        runId,
        title: task.title,
        repo: task.repo,
        tool: task.tool,
        dependsOn: JSON.stringify(task.dependsOn),
        state: task.state,
        assignedModel: task.assignedModel || null,
        startTime: task.startTime?.toISOString() || null,
        endTime: task.endTime?.toISOString() || null,
        error: task.error || null,
        retryCount: task.retryCount,
        maxRetries: task.maxRetries,
      });
    }
  }

  private loadTasks(runId: string): Task[] {
    interface TaskRow {
      id: string;
      run_id: string;
      title: string;
      repo: string;
      tool: string;
      depends_on: string;
      state: string;
      assigned_model: string | null;
      start_time: string | null;
      end_time: string | null;
      error: string | null;
      retry_count: number;
      max_retries: number;
    }

    const taskRows = this.db
      .prepare("SELECT * FROM tasks WHERE run_id = ?")
      .all(runId) as TaskRow[];

    return taskRows.map((row) => ({
      id: row.id,
      title: row.title,
      repo: row.repo,
      tool: row.tool,
      dependsOn: JSON.parse(row.depends_on || "[]"),
      state: row.state as TaskState,
      assignedModel: row.assigned_model || undefined,
      startTime: row.start_time ? new Date(row.start_time) : undefined,
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      error: row.error || undefined,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
    }));
  }

  close(): void {
    this.db.close();
  }

  getDbPath(): string {
    return this.dbPath;
  }
}
