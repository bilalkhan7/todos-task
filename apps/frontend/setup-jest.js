require('jest-preset-angular/setup-jest');

Object.defineProperty(global, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});
