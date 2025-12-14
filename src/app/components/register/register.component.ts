import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
    username = '';
    email = '';
    password = '';

    constructor(private auth: AuthService, private router: Router) { }

    onSubmit() {
        this.auth.register(this.username, this.email, this.password).subscribe(() => {
            this.router.navigate(['/login']);
        });
    }
}
