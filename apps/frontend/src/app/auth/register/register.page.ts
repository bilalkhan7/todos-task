import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  error = '';

  async submit() {
    this.error = '';
    const result = await this.auth.register(this.name, this.email, this.password); // 'registered' | 'exists' | 'error'

    if (result === 'exists') {
      this.error = 'Account already exists. Please sign in.';
      await this.router.navigate(['/login'], { queryParams: { email: this.email } });
      return;
    }

    if (result === 'error') {
      this.error = 'Registration failed. Please try again.';
      return;
    }

    // success
    await this.router.navigate(['/todos']);
  }
}
