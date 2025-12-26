import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  email = '';
  username = '';
  password = '';
  successMsg = signal<string | null>(null);
  errors = signal<Record<string, string>>({});
  hasErrors = computed(() => Object.keys(this.errors()).length > 0);

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        this.successMsg.set(res.message);
        console.log("Register Successful", res);
        this.errors.set({});
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },
      error: (err: HttpErrorResponse) => {
        if (err.error) {
          this.successMsg.set(null);
          this.errors.set(err.error);
          setTimeout(() => {
            this.errors.set({});
          }, 5000);
        }
      }
    });
  }
}
