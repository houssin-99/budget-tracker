import { Component } from '@angular/core';
import { App } from '../../app';

@Component({
  standalone: true,
  imports: [App],
  template: `
    <app-root></app-root>
    `
})
export class HomePage {}
