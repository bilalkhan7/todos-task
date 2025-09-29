import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

export type Todo = {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

@Injectable({ providedIn: 'root' })
export class TodoApi {
  constructor(private http: HttpClient) {}

  list(): Observable<{ items: Todo[]; total: number }> {
    return this.http.get<{ items: Todo[]; total: number }>('/api/todos');
  }

  get(id: string): Observable<Todo> {
    return this.http.get<Todo>(`/api/todos/${id}`);
  }

  getOrNull(id: string): Observable<Todo | null> {
    return this.http.get<Todo>(`/api/todos/${id}`).pipe(
      catchError((err) => (err?.status === 404 ? of(null) : throwError(() => err)))
    );
  }

  create(dto: { title: string; description?: string }): Observable<Todo> {
    return this.withCsrf((token) =>
      this.http.post<Todo>('/api/todos', dto, {
        headers: new HttpHeaders({ 'X-CSRF-Token': token }),
      })
    );
  }

  update(
    id: string,
    dto: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>
  ): Observable<Todo> {
    return this.withCsrf((token) =>
      this.http.patch<Todo>(`/api/todos/${id}`, dto, {
        headers: new HttpHeaders({ 'X-CSRF-Token': token }),
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.withCsrf((token) =>
      this.http.delete<void>(`/api/todos/${id}`, {
        headers: new HttpHeaders({ 'X-CSRF-Token': token }),
      })
    );
  }

  private withCsrf<T>(fn: (token: string) => Observable<T>): Observable<T> {
    return this.http.get<{ csrfToken: string }>('/api/csrf').pipe(
      take(1),
      map((r) => r.csrfToken),
      switchMap((token) => fn(token))
    );
  }
}
