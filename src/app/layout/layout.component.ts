import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../login/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  async signOut() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
} 