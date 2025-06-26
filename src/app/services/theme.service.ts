import { Injectable } from '@angular/core';

/**
 * Service de gestion du thème d'application (clair/sombre)
 *
 * @description
 * Ce service permet :
 * - De persister la préférence de thème dans localStorage
 * - D'appliquer dynamiquement le thème au body du document
 * - De basculer entre les modes clair et sombre
 *
 * @example
 * // Pour basculer le thème
 * themeService.toggleDarkMode();
 *
 * // Pour vérifier l'état actuel
 * const isDark = themeService.isDarkMode;
 */
@Injectable({
  providedIn: 'root', // Service singleton disponible dans toute l'application
})
export class ThemeService {
  /**
   * État actuel du mode sombre
   * @remarks
   * Initialisé à partir de localStorage lors de la construction
   * Utilise 'false' comme valeur par défaut si aucune préférence n'est sauvegardée
   */
  public isDarkMode: boolean = false;

  constructor() {
    this.initializeTheme();
  }

  /**
   * Initialise le thème au démarrage
   * @private
   * @description
   * 1. Récupère la préférence depuis localStorage
   * 2. Convertit la chaîne en booléen
   * 3. Applique le thème correspondant
   */
  private initializeTheme(): void {
    const savedPreference = localStorage.getItem('darkMode');
    this.isDarkMode = savedPreference === 'true'; // Convertit 'true' en true, autre valeur en false
    this.applyTheme();
  }

  /**
   * Bascule entre les modes clair et sombre
   * @description
   * 1. Inverse l'état actuel
   * 2. Persiste la nouvelle préférence
   * 3. Applique le changement visuel
   */
  public toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.persistPreference();
    this.applyTheme();
  }

  /**
   * Persiste la préférence de thème dans localStorage
   * @private
   */
  private persistPreference(): void {
    try {
      localStorage.setItem('darkMode', this.isDarkMode.toString());
    } catch (e) {
      console.error('Erreur de sauvegarde du thème', e);
    }
  }

  /**
   * Applique le thème actuel au document
   * @private
   * @description
   * Ajoute ou retire la classe 'dark' sur le body selon l'état actuel
   * Utilise classList.toggle avec force pour une gestion explicite
   */
  private applyTheme(): void {
    document.body.classList.toggle('dark', this.isDarkMode);
  }

  /**
   * Vérifie si le mode sombre est activé
   * @returns État actuel du mode sombre
   * @deprecated Préférer l'accès direct à isDarkMode
   */
  public isDarkModeEnabled(): boolean {
    return this.isDarkMode;
  }
}
