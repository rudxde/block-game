import { Component, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { MenuBarService } from 'src/app/services/menu-bar.service';
import { NgIf, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MenuButtonComponent } from '../menu-button/menu-button.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [MatSidenavModule, TranslocoModule, MenuButtonComponent, MatToolbarModule, MatButtonModule, MatIconModule, NgIf, RouterOutlet]
})
export class AppComponent implements OnInit {

  drawerOpen = signal<boolean>(false);

  // This is a workaround, since the sidenav wont open on the settings page for some reason, why this helps, i have no idea...
  // cold be this one: https://stackoverflow.com/questions/59864180/angular-sidenav-toggle-doesnt-work-after-button-reappear-by-ngif
  _ = effect(() => this.drawerOpen());

  title = toSignal(this.menuBarService.title);
  actionButton = toSignal(this.menuBarService.actionButton);

  constructor(
    private readonly router: Router,
    private readonly menuBarService: MenuBarService,
  ) { }

  ngOnInit(): void {
  }

  async openLink(path: string[]) {
    await this.router.navigate(path);
    this.drawerOpen.set(false);
  }

  toggleDrawer() {
    this.drawerOpen.set(!this.drawerOpen());
  }

}
