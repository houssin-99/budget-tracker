import { Component } from '@angular/core';

@Component({
    selector: 'app-analytics',
    standalone: true,
    template: `
    <div class="page">
        <h1>📊 Analytics</h1>
        <p></p>

        <a routerLink="/" class="back-btn">← Back to Dashboard</a>
    </div>
    `,
    styles: [`
        .page { padding: 40px text-align:center; color:white; }
        .back-btn { color:#00ffc3; text-decoration:none; font-weight:600; }
    `]
})
export class AnalyticsPage {}