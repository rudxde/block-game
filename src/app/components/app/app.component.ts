import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { IMenuBarActionButton, MenuBarService } from 'src/app/services/menu-bar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('drawer') drawer!: MatDrawer;

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
    await this.drawer.toggle();
  }

}
