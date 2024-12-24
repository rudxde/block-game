import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  imports: [TranslocoModule]
})
export class ErrorComponent implements OnInit {

  code = signal('unknown');

  constructor(
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const code = this.activatedRoute.snapshot.data['code'];
    this.code.set(code ?? 'unknown');
  }

}
