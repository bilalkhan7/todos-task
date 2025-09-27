import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TodoApi, Todo } from '../todo.api';
import { TodoStore } from '../todo.store';

@Component({
  standalone: true,
  selector: 'app-todo-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-detail.page.html',
  styleUrls: ['./todo-detail.page.scss'],
})
export class TodoDetailPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(TodoApi);
  private store = inject(TodoStore);

  todo: Todo | null = null;
  desc: string | null = null;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.todo = (await firstValueFrom(this.api.get(id))) ?? null;
    this.desc = this.todo?.description ?? null;
  }

  save() {
    if (!this.todo) return;
    this.store.update({
      id: this.todo.id,
      dto: {
        title: this.todo.title,
        description: this.desc ?? undefined,
        completed: this.todo.completed,
      },
    });
    this.router.navigateByUrl('/todos');
  }

  remove() {
    if (!this.todo) return;
    this.store.remove(this.todo.id);
    this.router.navigateByUrl('/todos');
  }
}
