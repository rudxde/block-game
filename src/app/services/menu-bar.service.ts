import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IMenuBarActionButton {
  icon: string;
  title: string;
  click: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class MenuBarService {

  public title = new BehaviorSubject<string | undefined>(undefined);
  public actionButton = new BehaviorSubject<IMenuBarActionButton | undefined>(undefined);

  constructor() { }

  reset() {
    this.title.next(undefined);
    this.actionButton.next(undefined);
  }

  set(title?: string, button?: IMenuBarActionButton) {
    this.title.next(title);
    this.actionButton.next(button);
  }
}

