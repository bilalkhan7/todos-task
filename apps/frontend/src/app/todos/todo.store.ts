import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { TodoApi, Todo } from './todo.api';

type TodosState = {
  items: Todo[];
  total: number;
  loading: boolean;
  error?: string | null;
};

const initialState: TodosState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class TodoStore extends ComponentStore<TodosState> {
  readonly items$ = this.select((s) => s.items);
  readonly total$ = this.select((s) => s.total);
  readonly loading$ = this.select((s) => s.loading);
  readonly error$ = this.select((s) => s.error);

  readonly pending$ = this.select((s) => s.items.filter((t) => !t.completed));
  readonly completed$ = this.select((s) => s.items.filter((t) => t.completed));
  readonly pendingCount$ = this.select(this.pending$, (p) => p.length);
  readonly completedCount$ = this.select(this.completed$, (c) => c.length);

  readonly setItems = this.updater<Todo[]>((state, items) => ({ ...state, items }));
  readonly setTotal = this.updater<number>((state, total) => ({ ...state, total }));
  readonly setLoading = this.updater<boolean>((state, loading) => ({ ...state, loading }));
  readonly setError = this.updater<string | null>((state, error) => ({ ...state, error }));

  reset() {
    this.setState(initialState);
  }

  constructor(private api: TodoApi) {
    super(initialState);
  }

  readonly load = this.effect<void>((trigger$) =>
    trigger$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(() =>
        this.api.list().pipe(
          tapResponse({
            next: (res: { items: Todo[]; total: number }) => {
              this.setItems(res.items);
              this.setTotal(res.total);
              this.setError(null);
            },
            error: () => {
              this.setError('Failed to load todos');
            },
            finalize: () => {
              this.setLoading(false);
            },
          })
        )
      )
    )
  );

  readonly create = this.effect<{ title: string; description?: string }>((dto$) =>
    dto$.pipe(
      withLatestFrom(this.items$),
      switchMap(([dto, items]) =>
        this.api.create(dto).pipe(
          tapResponse({
            next: (created: Todo) => {
              this.setItems([created, ...items]);
              this.setTotal(items.length + 1);
              this.setError(null);
            },
            error: () => {
              this.setError('Failed to create todo');
            },
          })
        )
      )
    )
  );

  readonly update = this.effect<{
    id: string;
    dto: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>;
  }>((params$) =>
    params$.pipe(
      withLatestFrom(this.items$),
      switchMap(([{ id, dto }, before]) => {
        const optimistic = before.map((t) => (t.id === id ? ({ ...t, ...dto } as Todo) : t));
        this.setItems(optimistic);

        return this.api.update(id, dto).pipe(
          tapResponse({
            next: (saved: Todo) => {
              this.setItems(optimistic.map((t) => (t.id === id ? saved : t)));
              this.setError(null);
            },
            error: () => {
              this.setItems(before);
              this.setError('Failed to update todo');
            },
          })
        );
      })
    )
  );

  readonly toggle = this.effect<string>((id$) =>
    id$.pipe(
      withLatestFrom(this.items$),
      switchMap(([id, before]) => {
        const optimistic = before.map((t) =>
          t.id === id ? ({ ...t, completed: !t.completed } as Todo) : t
        );
        this.setItems(optimistic);

        const completed = optimistic.find((t) => t.id === id)?.completed ?? false;

        return this.api.update(id, { completed }).pipe(
          tapResponse({
            next: (saved: Todo) => {
              this.setItems(optimistic.map((t) => (t.id === id ? saved : t)));
              this.setError(null);
            },
            error: () => {
              this.setItems(before);
              this.setError('Failed to toggle todo');
            },
          })
        );
      })
    )
  );

  readonly remove = this.effect<string>((id$) =>
    id$.pipe(
      withLatestFrom(this.items$),
      switchMap(([id, before]) => {
        const after = before.filter((t) => t.id !== id);
        this.setItems(after);
        this.setTotal(after.length);

        return this.api.delete(id).pipe(
          tapResponse({
            next: () => {
              this.setError(null);
            },
            error: () => {
              this.setItems(before);
              this.setTotal(before.length);
              this.setError('Failed to delete todo');
            },
          })
        );
      })
    )
  );
}
