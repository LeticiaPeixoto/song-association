import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { WordsService } from './core/services/words.service';

/** Tenta conectar ao Firestore via arquivo de conexão antes do app renderizar as rotas. */
function initWords(wordsService: WordsService): () => Promise<void> {
  return () => wordsService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: APP_INITIALIZER, useFactory: initWords, deps: [WordsService], multi: true },
  ]
};
