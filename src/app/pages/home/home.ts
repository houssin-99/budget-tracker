import { Component } from '@angular/core';
import { App } from '../../app'; // <-- correcte pad naar app.ts

@Component({
  standalone: true,
  templateUrl: './home.html',
  imports: [App]  // <---- hierdoor werkt <app></app>
})
export class HomePage {}
