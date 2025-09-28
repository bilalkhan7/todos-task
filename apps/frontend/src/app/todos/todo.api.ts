import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Todo = {
  id: string; userId: string; title: string; description: string | null;
  completed: boolean; createdAt: string; updatedAt: string;
};

@Injectable({ providedIn: 'root' })
export class TodoApi {
  private http = inject(HttpClient);

  list() {
    return this.http.get<{ items: Todo[]; total: number }>('/api/todos', { withCredentials: true });
  }
  get(id: string) {
    return this.http.get<Todo>(`/api/todos/${id}`, { withCredentials: true });
  }
  create(dto: { title: string; description?: string }) {
    return this.http.post<Todo>('/api/todos', dto, { withCredentials: true });
  }
  update(id: string, dto: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>) {
    return this.http.patch<Todo>(`/api/todos/${id}`, dto, { withCredentials: true });
  }
  delete(id: string) {
    return this.http.delete<void>(`/api/todos/${id}`, { withCredentials: true });
  }
}
