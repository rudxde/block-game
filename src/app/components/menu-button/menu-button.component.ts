import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-menu-button',
    templateUrl: './menu-button.component.html',
    styleUrls: ['./menu-button.component.scss'],
    imports: [NgIf, MatButtonModule, AsyncPipe]
})
export class MenuButtonComponent implements OnInit, OnDestroy {

  destroy$ = new Subject<void>();

  @Input('link') link?: string[];
  @Input('text') text?: string;
  @Output('clicked') clicked = new EventEmitter<void>();

  isActivatedRoute$: Observable<boolean> | undefined;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }


  ngOnInit(): void {
    this.isActivatedRoute$ = this.router.events
      .pipe(
        filter(x => x instanceof NavigationEnd),
        startWith(''),
        map(() => {
          const urlSegments = this.activatedRoute.snapshot.firstChild?.url;
          if (!urlSegments || !this.link) {
            return false
          }
          if (this.link.length !== urlSegments.length) {
            return false;
          }
          for (let i = 0; i < urlSegments.length; i++) {
            if (urlSegments[i].path !== this.link[i]) {
              return false;
            }
          }
          return true;
        }),
        takeUntil(this.destroy$)
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }


  async openLink(path: string[] | undefined) {
    if (!path) {
      throw new Error('Link path is undefined');
    }
    await this.router.navigate(path);
    this.clicked.emit();
  }
}
