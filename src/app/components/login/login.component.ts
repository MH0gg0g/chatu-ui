import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

    constructor(private auth: AuthService, private router: Router) { }

    onSubmit() {
        this.auth.login(this.username, this.password).subscribe(() => {
            this.router.navigate(['/chat']);
        });
    }
}
