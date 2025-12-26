import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    standalone: true,
    selector: 'app-login',
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html'
})
export class LoginComponent {
    username = '';
    password = '';
    errors = signal<Record<string, string>>({});

    constructor(private authService: AuthService, private router: Router) {
    }

    onSubmit() {
        this.authService.login(this.username, this.password).subscribe({
            next: (res) => {
                this.errors.set({});
                this.router.navigate(['/chat']);
            },
            error: (err: HttpErrorResponse) => {
                if (err.error) {
                    this.errors.set(err.error);
                    setTimeout(() => {
                        this.errors.set({});
                    }, 5000);
                }
            }
        });
    }
}
