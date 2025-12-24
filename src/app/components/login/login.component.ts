import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
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
    errorMsg = signal<string | null>(null);

    constructor(private authService: AuthService, private router: Router) { }

    onSubmit() {
        this.authService.login(this.username, this.password).subscribe({
            next: (res) => {
                console.log("login successful");
                setTimeout(() => {
                    this.router.navigate(['/chat']);
                }, 10000);
            },
            error: (err: HttpErrorResponse) => {
                if (err.error && err.error.message) {
                    console.error("login failed", err.error.message);
                    this.errorMsg.set(err.error.message);
                }
                else {
                    this.errorMsg.set("An unexpected error happened.");
                }
            }
        });
    }
}
