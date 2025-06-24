import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' }) // Service singleton disponible dans toute l'application
export class LanguageService {
  /**
   * Constructeur qui initialise la langue à utiliser pour l'application.
   * - Récupère la langue sauvegardée dans localStorage si elle existe.
   * - Sinon, détecte la langue du navigateur.
   * - Définit le français comme langue par défaut.
   * - Utilise la langue sauvegardée ou celle du navigateur si elle est 'fr' ou 'en',
   *   sinon retombe sur le français.
   * @param translate Service ngx-translate injecté
   */
  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('lang'); // Langue précédemment sauvegardée
    const browserLang = translate.getBrowserLang(); // Langue du navigateur

    translate.setDefaultLang('fr'); // Langue par défaut

    translate.use(
      savedLang ?? (browserLang?.match(/en|fr/) ? browserLang : 'fr')
    );
  }

  /**
   * Change la langue active de l’application.
   * Met à jour ngx-translate et sauvegarde le choix dans localStorage.
   * @param lang Code langue (ex : 'fr', 'en')
   */
  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  /**
   * Getter pour récupérer la langue courante utilisée par ngx-translate.
   */
  get currentLang(): string {
    return this.translate.currentLang;
  }
}
