import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TodoStore } from '../todo.store';

@Component({
  standalone: true,
  selector: 'app-todo-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './todo-list.page.html',
  styleUrls: ['./todo-list.page.scss'],
})
export class TodoListPage implements OnInit {
  store = inject(TodoStore);

  title = '';
  description = '';

  ngOnInit() {
    this.store.load();
  }

  create() {
    const t = this.title.trim();
    if (!t) return;
    this.store.create({ title: t, description: this.description || undefined });
    this.title = '';
    this.description = '';
  }

  toggle(id: string) {
    this.store.toggle(id);
  }

  remove(id: string) {
    this.store.remove(id);
  }
}
