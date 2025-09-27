import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { TodoListPage } from './todo-list.page';
import { TodoStore } from '../todo.store';

type Todo = { id: string; title: string; completed: boolean; description?: string };

const makeTodo = (id: string, title: string, completed = false): Todo => ({
  id, title, completed
});

class MockTodoStore {
  loading$ = new BehaviorSubject<boolean>(false);
  pending$ = new BehaviorSubject<Todo[]>([]);
  completed$ = new BehaviorSubject<Todo[]>([]);
  pendingCount$ = new BehaviorSubject<number>(0);
  completedCount$ = new BehaviorSubject<number>(0);

  load = jest.fn();
  create = jest.fn();
  toggle = jest.fn();
  remove = jest.fn();

  setPending(items: Todo[]) {
    this.pending$.next(items);
    this.pendingCount$.next(items.length);
  }
  setCompleted(items: Todo[]) {
    this.completed$.next(items);
    this.completedCount$.next(items.length);
  }
}

describe('TodoListPage', () => {
  let fixture: ComponentFixture<TodoListPage>;
  let component: TodoListPage;
  let store: MockTodoStore;

  beforeEach(async () => {
    store = new MockTodoStore();

    await TestBed.configureTestingModule({
      imports: [TodoListPage, RouterTestingModule],
      providers: [{ provide: TodoStore, useValue: store }],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListPage);
    component = fixture.componentInstance;
  });

  it('calls store.load on init', () => {
    expect(store.load).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(store.load).toHaveBeenCalledTimes(1);
  });

  it('shows "Loading…" when loading$ is true', () => {
    store.loading$.next(true);
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement as HTMLElement;
    expect(el.textContent || '').toContain('Loading…');

    store.loading$.next(false);
    fixture.detectChanges();
    expect(el.textContent || '').not.toContain('Loading…');
  });

  it('renders pending and completed lists with correct counts', () => {
    store.setPending([makeTodo('1', 'A'), makeTodo('2', 'B')]);
    store.setCompleted([makeTodo('3', 'C', true)]);

    fixture.detectChanges();

    const host = fixture.debugElement.nativeElement as HTMLElement;
    const badges = host.querySelectorAll('.badge');
    expect(badges[0]?.textContent?.trim()).toBe('2');
    const successBadge = host.querySelector('.badge-success');
    expect(successBadge?.textContent?.trim()).toBe('1');

    const listItems = host.querySelectorAll('ul.list li.list-item');
    const completedItems = host.querySelectorAll('li.list-item-completed');
    expect(listItems.length).toBeGreaterThanOrEqual(3);
    expect(completedItems.length).toBe(1);
  });

  it('submits form and calls store.create, then clears inputs', () => {
    fixture.detectChanges();

    component.title = '  New Todo  ';
    component.description = 'desc';
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', {});
    fixture.detectChanges();

    expect(store.create).toHaveBeenCalledWith({ title: 'New Todo', description: 'desc' });
    expect(component.title).toBe('');
    expect(component.description).toBe('');
  });

  it('clicking checkbox calls toggle with the todo id', () => {
    store.setPending([makeTodo('1', 'A')]);
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('section:first-of-type input[type="checkbox"]'));
    checkbox.triggerEventHandler('change', { target: { checked: true } });
    expect(store.toggle).toHaveBeenCalledWith('1');
  });

  it('clicking Delete calls remove with the todo id', () => {
    store.setPending([makeTodo('10', 'X')]);
    fixture.detectChanges();

    const deleteBtn = fixture.debugElement.query(By.css('section:first-of-type .btn-danger'));
    deleteBtn.triggerEventHandler('click', {});
    expect(store.remove).toHaveBeenCalledWith('10');
  });
});
