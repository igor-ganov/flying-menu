/** Minimal storage abstraction so persistence is testable and failure-safe. */
export interface StoragePort {
  get(key: string): string | undefined
  set(key: string, value: string): void
}
