import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Service de gestion des langues de l'application
 *
 * @description
 * Ce service permet :
 * - De gérer la langue active de l'application
 * - De persister le choix de langue
 * - De détecter la langue du navigateur
 * - De fournir une langue par défaut
 *
 * @example
 * // Pour changer de langue
 * languageService.setLanguage('en');
 *
 * // Pour obtenir la langue courante
 * const currentLang = languageService.currentLang;
 */
@Injectable({
  providedIn: 'root', // Service singleton disponible dans toute l'application
})
export class LanguageService {
  /**
   * Langues supportées par l'application
   * @private
   */
  private readonly SUPPORTED_LANGUAGES = ['fr', 'en'];

  /**
   * Langue par défaut (français)
   * @private
   */
  private readonly DEFAULT_LANGUAGE = 'fr';

  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  /**
   * Initialise la langue de l'application
   * @private
   * @description
   * 1. Définit la langue par défaut
   * 2. Essaie de récupérer la langue sauvegardée
   * 3. Sinon, détecte la langue du navigateur
   * 4. Utilise la première langue valide trouvée
   */
  private initializeLanguage(): void {
    this.translate.setDefaultLang(this.DEFAULT_LANGUAGE);

    const langToUse =
      this.getSavedLanguage() ||
      this.getBrowserLanguage() ||
      this.DEFAULT_LANGUAGE;

    this.translate.use(langToUse);
  }

  /**
   * Récupère la langue sauvegardée dans le localStorage
   * @returns La langue sauvegardée ou null si non trouvée/invalide
   * @private
   */
  private getSavedLanguage(): string | null {
    const savedLang = localStorage.getItem('lang');
    return this.isLanguageSupported(savedLang) ? savedLang : null;
  }

  /**
   * Détecte la langue du navigateur
   * @returns La langue du navigateur si supportée, sinon null
   * @private
   */
  private getBrowserLanguage(): string | null {
    const browserLang = this.translate.getBrowserLang();
    return browserLang && this.isLanguageSupported(browserLang)
      ? browserLang
      : null;
  }

  /**
   * Vérifie si une langue est supportée par l'application
   * @param lang Code de langue à vérifier
   * @returns true si la langue est supportée, false sinon
   * @private
   */
  private isLanguageSupported(lang: string | null): boolean {
    return !!lang && this.SUPPORTED_LANGUAGES.includes(lang);
  }

  /**
   * Change la langue active de l'application
   * @param lang Code de langue (doit être une langue supportée)
   * @throws {Error} Si la langue n'est pas supportée
   *
   * @description
   * 1. Vérifie que la langue est supportée
   * 2. Met à jour ngx-translate
   * 3. Persiste le choix dans localStorage
   */
  setLanguage(lang: string): void {
    if (!this.isLanguageSupported(lang)) {
      throw new Error(`Language ${lang} is not supported`);
    }

    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  /**
   * Récupère la langue actuellement utilisée
   * @returns Code de la langue active (ex: 'fr', 'en')
   */
  get currentLang(): string {
    return this.translate.currentLang;
  }

  /**
   * Récupère la liste des langues supportées
   * @returns Tableau des codes de langues supportées
   */
  get supportedLanguages(): string[] {
    return [...this.SUPPORTED_LANGUAGES];
  }
}
