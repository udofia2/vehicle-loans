export interface BaseRepository<T> {
  create(entity: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, updateData: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}