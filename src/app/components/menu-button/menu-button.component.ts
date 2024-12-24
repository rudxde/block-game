import { Component, computed, input, output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['./menu-button.component.scss'],
  imports: [MatButtonModule]
})
export class MenuButtonComponent {
  link = input.required<string[]>();
  text = input.required<string>();
  clicked = output<void>();

  routed = toSignal(this.router.events.pipe(filter(event => event instanceof NavigationEnd)));
  currentRoute = computed(() => {
    const _dependsOn = this.routed();
    return this.activatedRoute.snapshot.firstChild?.url ?? [];
  });

  isActivatedRoute = computed(() => {
    const urlSegments = this.currentRoute();
    const link = this.link();
    if (!urlSegments || !link) {
      return false
    }
    if (link.length !== urlSegments.length) {
      return false;
    }
    for (let i = 0; i < urlSegments.length; i++) {
      if (urlSegments[i].path !== link[i]) {
        return false;
      }
    }
    return true;
  });

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) { }

  async openLink(path: string[]) {
    await this.router.navigate(path);
    this.clicked.emit();
  }
}
