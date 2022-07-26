import { Component, OnInit } from '@angular/core';
import { MenuBarService } from 'src/app/services/menu-bar.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(
    private menuBarService: MenuBarService,

  ) { }

  ngOnInit(): void {
    this.menuBarService.set('settings');
  }


}
