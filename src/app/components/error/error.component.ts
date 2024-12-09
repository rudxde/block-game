import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss'],
    standalone: true,
    imports: [TranslocoModule]
})
export class ErrorComponent implements OnInit {

  code = 'unknown';

  constructor(
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.code = this.activatedRoute.snapshot.data['code']
      ?? this.activatedRoute.snapshot.queryParams['code']
      ?? 'unknown';
  }


}
