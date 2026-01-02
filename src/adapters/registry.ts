import { ToolAdapter } from "./interface.js";
import { ErrorCode, OrchestratorError } from "../errors/index.js";

/**
 * Registry for managing tool adapters.
 * Provides methods to register, retrieve, and list available adapters.
 */
export class AdapterRegistry {
  private adapters: Map<string, ToolAdapter> = new Map();

  /**
   * Register a tool adapter
   * @param adapter - The adapter to register
   * @throws if an adapter with the same name is already registered
   */
  register(adapter: ToolAdapter): void {
    const name = adapter.getName();
    if (this.adapters.has(name)) {
      throw new OrchestratorError(
        ErrorCode.SYS_INTERNAL_ERROR,
        `Adapter "${name}" is already registered`,
      );
    }
    this.adapters.set(name, adapter);
  }

  /**
   * Get an adapter by name
   * @param name - The adapter name
   * @returns The adapter
   * @throws if no adapter with the given name is registered
   */
  get(name: string): ToolAdapter {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw new OrchestratorError(
        ErrorCode.LLM_MODEL_UNAVAILABLE,
        `Adapter "${name}" is not registered`,
      );
    }
    return adapter;
  }

  /**
   * Check if an adapter is registered
   * @param name - The adapter name
   * @returns true if the adapter is registered
   */
  has(name: string): boolean {
    return this.adapters.has(name);
  }

  /**
   * List all registered adapter names
   * @returns Array of adapter names
   */
  list(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Get all registered adapters
   * @returns Array of adapters
   */
  getAll(): ToolAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Unregister an adapter
   * @param name - The adapter name
   * @returns true if the adapter was removed
   */
  unregister(name: string): boolean {
    return this.adapters.delete(name);
  }

  /**
   * Clear all registered adapters
   */
  clear(): void {
    this.adapters.clear();
  }
}

/**
 * Default global adapter registry
 */
export const defaultRegistry = new AdapterRegistry();
