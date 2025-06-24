import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular'; // Modules Ionic pour les composants UI
import { CommonModule } from '@angular/common'; // Module Angular commun (ngIf, ngFor, etc.)
import { FormsModule } from '@angular/forms'; // Support des formulaires (ngModel, etc.)

import { ThemeService } from 'src/theme/theme.service'; // Service personnalisé pour gérer le thème sombre/claire
import { LanguageService } from 'src/app/services/language.service'; // Service personnalisé pour gérer la langue

import { TranslateModule } from '@ngx-translate/core'; // Module de traduction (pipe | translate)

@Component({
  selector: 'app-header', // Sélecteur pour utiliser ce composant dans les templates HTML
  standalone: true, // Ce composant est autonome (Angular 14+), pas besoin de le déclarer dans un module
  templateUrl: './header.component.html', // Fichier HTML associé
  styleUrls: ['./header.component.scss'], // Fichier SCSS associé pour les styles
  imports: [
    IonicModule, // Import du module Ionic (boutons, icônes, etc.)
    CommonModule, // Directives communes Angular (ngIf, ngFor)
    FormsModule, // Support des formulaires (ngModel, formulaire réactif)
    TranslateModule, // Permet d’utiliser le pipe | translate dans ce template
  ],
})
export class HeaderComponent {
  /**
   * Booléen indiquant si le mode sombre est activé ou non.
   * Cette variable est liée au template pour afficher l’état du toggle sombre.
   */
  isDarkMode = false;

  /**
   * Stocke la langue courante de l'application.
   * Utile pour afficher la langue sélectionnée dans l'interface utilisateur,
   * par exemple pour pré-sélectionner un bouton radio ou une option.
   */
  currentLang = this.languageService.currentLang;

  /**
   * Constructeur du composant
   * Injection des services pour gérer le thème et la langue.
   */
  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService
  ) {
    /*
     * Abonnement au flux `isDarkMode` du service de thème
     * pour mettre à jour automatiquement `isDarkMode` à chaque changement.
     * Ainsi, le toggle du mode sombre dans le header reflète toujours l’état actuel.
     */
    this.themeService.isDarkMode.subscribe((value) => {
      this.isDarkMode = value;
    });
  }

  /**
   * Méthode appelée lors de l’interaction utilisateur pour inverser le thème.
   * Active ou désactive le mode sombre en appelant la méthode correspondante du service.
   */
  toggleDarkMode(): void {
    this.themeService.setDarkMode(!this.isDarkMode);
  }

  /**
   * Change la langue courante de l’application.
   * Appelle le service de langue pour changer la langue.
   * Met à jour aussi la variable locale `currentLang` pour refléter ce changement dans le template.
   * @param lang Code de la langue (ex: 'fr', 'en')
   */
  setLanguage(lang: string): void {
    this.languageService.setLanguage(lang);
    this.currentLang = lang;
  }
}
