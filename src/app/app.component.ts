import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';

/**
 * Composant racine de l'application Ionic/Angular
 *
 * @description
 * Ce composant sert de point d'entrée principal de l'application et gère :
 * - L'initialisation et la gestion des langues (i18n)
 * - La configuration du thème (light/dark mode)
 * - Les préférences utilisateur persistantes
 *
 * @example
 * <app-root></app-root> // Sélecteur utilisé dans index.html
 */
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  /**
   * État actuel du mode sombre
   * @default false Mode clair par défaut
   *
   * @remarks
   * La valeur est persistée dans localStorage et récupérée à l'initialisation
   */
  isDarkMode = false;

  /**
   * Année courante utilisée dans le footer
   * @example
   * <!-- Dans le template -->
   * <p>© {{ currentYear }} MonApplication</p>
   */
  currentYear = new Date().getFullYear();

  constructor(private translate: TranslateService) {
    this.initLanguage();
    this.initTheme();
  }

  /**
   * Initialise la configuration linguistique de l'application
   *
   * @private
   * @procedure
   * 1. Définit le français comme langue par défaut
   * 2. Tente de récupérer la langue sauvegardée
   * 3. Sinon, utilise la langue du navigateur si supportée
   * 4. Finalement, utilise le français comme fallback
   *
   */
  private initLanguage(): void {
    this.translate.setDefaultLang('fr');

    const langToUse =
      this.getValidLanguage(localStorage.getItem('lang')) ?? // Essai 1: Langue sauvegardée
      this.getValidLanguage(this.translate.getBrowserLang()) ?? // Essai 2: Langue navigateur
      'fr'; // Fallback final

    this.translate.use(langToUse);
  }

  /**
   * Valide et retourne une langue si elle est supportée
   *
   * @private
   * @param lang La langue à valider (peut être null ou undefined)
   * @returns La langue si valide, sinon undefined
   *
   * @remarks
   * Cette méthode sert de filtre de sécurité pour les langues non supportées
   */
  private getValidLanguage(
    lang: string | null | undefined
  ): string | undefined {
    return lang && this.isSupportedLanguage(lang) ? lang : undefined;
  }

  /**
   * Initialise le thème de l'application
   *
   * @private
   * @procedure
   * 1. Récupère la préférence depuis localStorage
   * 2. Applique le thème correspondant
   */
  private initTheme(): void {
    const savedDark = localStorage.getItem('darkMode');
    this.isDarkMode = savedDark === 'true';
    this.updateDarkMode();
  }

  /**
   * Change la langue active de l'application
   *
   * @param lang Le code de langue à utiliser (fr/en)
   *
   * @remarks
   * La nouvelle langue est immédiatement appliquée et persistée
   */
  setLanguage(lang: string) {
    console.log(`Changement de langue : ${lang}`);
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  /**
   * Met à jour les classes CSS pour appliquer le thème actuel
   *
   * @private
   * @description
   * Ajoute ou retire la classe 'dark' sur le body selon l'état actuel
   *
   * @see toggleDarkMode()
   */
  private updateDarkMode() {
    document.body.classList.toggle('dark', this.isDarkMode);
  }

  /**
   * Bascule entre les modes clair et sombre
   *
   * @description
   * Inverse l'état actuel, persiste le changement et met à jour l'interface
   *
   * @see initTheme()
   */
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.updateDarkMode();
  }

  /**
   * Vérifie si une langue est supportée par l'application
   *
   * @private
   * @param lang Le code de langue à vérifier
   * @returns true si la langue est supportée, false sinon
   */
  private isSupportedLanguage(lang?: string | null): boolean {
    return !!lang && ['fr', 'en'].includes(lang);
  }
}
