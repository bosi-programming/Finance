import { type StoredRow } from '@/types/budget';

export interface StoragePort {
  persist(row: StoredRow): Promise<unknown>;
}
