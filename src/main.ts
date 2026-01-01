import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { App } from './app/app';

const routes: Routes = [
  { path: '', component: App },            // Home = App component
  { path: 'analytics', loadComponent: () => import('./app/pages/analytics').then(m => m.AnalyticsPage) },
  { path: 'settings', loadComponent: () => import('./app/pages/setting').then(m => m.SettingsPage) }
];

bootstrapApplication(App, {
  providers: [provideRouter(routes)]
}).catch(err => console.error(err));
