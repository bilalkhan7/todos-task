import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TodoStore } from '../todos/todo.store';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const todos = inject(TodoStore);

  return next(req).pipe(
    catchError((err) => {
      // If backend says "not authenticated" -> clear everything & send to login
      if (err?.status === 401) {
        auth.clearSession();
        todos.reset();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
