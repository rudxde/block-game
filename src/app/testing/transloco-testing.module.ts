import { TranslocoTestingModule } from '@jsverse/transloco';

export function getTranslocoTestingModule() {
  return TranslocoTestingModule.forRoot({
    langs: {
      en: {},
    },
    translocoConfig: {
      availableLangs: ['en'],
      defaultLang: 'en',
    },
  });
}
