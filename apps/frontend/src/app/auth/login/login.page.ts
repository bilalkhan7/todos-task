import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule,RouterLink],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  error = '';

  ngOnInit() {
    const prefill = this.route.snapshot.queryParamMap.get('email');
    if (prefill) this.email = prefill;
  }

  async submit() {
    this.error = '';
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/todos']);
    } catch (e: any) {
      this.error = e?.error?.message ?? 'Invalid email or password.';
    }
  }
}
