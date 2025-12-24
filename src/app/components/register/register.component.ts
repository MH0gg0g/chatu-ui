import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
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
  errorMsg = signal<string | null>(null);

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        console.log("next: Registeration successful", res);
        this.successMsg.set(res.message);
        this.errorMsg.set(null);
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 10000);
      },
      error: (err: HttpErrorResponse) => {
        this.successMsg.set(null);
        if (err.error && err.error.message) {
          console.error("error: Registration failed", err.error.message);
          this.errorMsg.set(err.error.message);
        }
        else {
          this.errorMsg.set("An unexpected error happened.");
        }
      }
    });
  }
}
