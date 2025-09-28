import { TodoStore } from './todo.store';
import { of } from 'rxjs';

describe('TodoStore (unit)', () => {
  it('sets items and counts', (done) => {
    const api: any = {
      list: () => of({ items: [
        { id: '1', userId: 'u', title: 'A', description: null, completed: false, createdAt: '', updatedAt: '' },
        { id: '2', userId: 'u', title: 'B', description: null, completed: true,  createdAt: '', updatedAt: '' },
      ], total: 2 })
    };
    const store = new TodoStore(api);

    const seen: any[] = [];
    const sub = store.items$.subscribe(v => { seen.push(v); });

    store.load();

    setTimeout(() => {
      expect(seen[seen.length - 1].length).toBe(2);
      sub.unsubscribe();
      done();
    }, 0);
  });
});
