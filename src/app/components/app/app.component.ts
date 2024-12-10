import { Component, effect, OnInit, signal, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { IMenuBarActionButton, MenuBarService } from 'src/app/services/menu-bar.service';
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
  standalone: true,
  imports: [MatSidenavModule, TranslocoModule, MenuButtonComponent, MatToolbarModule, MatButtonModule, MatIconModule, NgIf, RouterOutlet, AsyncPipe]
})
export class AppComponent implements OnInit {

  drawerOpen = signal<boolean>(false);

  // This is a workaround, since the sidenav wont open on the settings page for some reason, why this helps, i have no idea...
  _ = effect(() => this.drawerOpen());

  title$: BehaviorSubject<string | undefined>;
  actionButton$: BehaviorSubject<IMenuBarActionButton | undefined>;

  constructor(
    private router: Router,
    menuBarService: MenuBarService,
  ) {
    this.title$ = menuBarService.title;
    this.actionButton$ = menuBarService.actionButton;
  }

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
