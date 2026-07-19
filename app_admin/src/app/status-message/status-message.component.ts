import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-status-message',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './status-message.component.html'
})
export class StatusMessageComponent {
    @Input() type: 'success' | 'danger' | 'info' = 'info';
    @Input() message = '';
}