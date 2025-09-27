import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TodoStore } from '../todos/todo.store';

export type Me = { id: string; email: string; name?: string | null };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private todos = inject(TodoStore);

  readonly user = signal<Me | null>(null);
  readonly isAuthenticated = computed(() => this.user() !== null);

  async refreshSession(): Promise<void> {
    try {
      const me = await this.http.get<Me>('/api/auth/me', { withCredentials: true }).toPromise();
      this.user.set(me ?? null);
    } catch {
      this.user.set(null);
    }
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<'registered' | 'exists' | 'error'> {
    try {
      await this.http
        .post('/api/auth/register', { name, email, password }, { withCredentials: true })
        .toPromise();
      await this.refreshSession();
      return 'registered';
    } catch (err: any) {
      if (err?.status === 409) return 'exists';
      return 'error';
    }
  }

  async login(email: string, password: string): Promise<void> {
    await this.http.post('/api/auth/login', { email, password }, { withCredentials: true }).toPromise();
    await this.refreshSession();
    await this.router.navigateByUrl('/todos');
  }

  async logout(): Promise<void> {
    try {
      await this.http.post('/api/auth/logout', {}, { withCredentials: true }).toPromise();
    } catch {}
    this.clearSession(); 
    await this.router.navigateByUrl('/login');
  }

  clearSession(): void {
    this.user.set(null);
    this.todos.reset();
  }
}
