import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withXsrfConfiguration,
  withInterceptors,
} from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { LoginPage } from './app/auth/login/login.page';
import { RegisterPage } from './app/auth/register/register.page';
import { TodoListPage } from './app/todos/todo-list/todo-list.page';
import { TodoDetailPage } from './app/todos/todo-detail/todo-detail.page';

import { authGuard } from './app/core/auth.guard';
import { authInterceptor } from './app/core/auth.interceptor';

const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: '', pathMatch: 'full', redirectTo: 'todos' },
  { path: 'todos', component: TodoListPage, canActivate: [authGuard] },
  { path: 'todos/:id', component: TodoDetailPage, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
      withInterceptors([authInterceptor])
    ),
  ],
}).catch((err) => console.error('[bootstrap] failed:', err));
