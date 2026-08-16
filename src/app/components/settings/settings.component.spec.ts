import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { AppUpdateService } from '../../services/update.service';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SettingsComponent, getTranslocoTestingModule()],
    providers: [
      {
        provide: AppUpdateService,
        useValue: {
          autoUpdateEnabled: () => true,
          checkForUpdates: vi.fn(),
          setEnableAutoUpdate: vi.fn(),
        },
      },
    ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
