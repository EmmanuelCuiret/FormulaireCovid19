import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root', // Composant racine de l’application
  templateUrl: 'app.component.html', // Template HTML associé
  imports: [IonApp, IonRouterOutlet], // Composants Ionic standalone utilisés ici
})
export class AppComponent {
  /**
   * Booléen indiquant si le mode sombre est activé.
   * Cette variable est utilisée pour refléter l'état actuel du thème.
   */
  isDarkMode = false;

  /**
   * Année courante, souvent affichée dans un footer ou ailleurs.
   * Initialisée à la date au moment de la création du composant.
   */
  currentYear = new Date().getFullYear();

  constructor(private translate: TranslateService) {
    // Récupération de la langue sauvegardée dans localStorage
    const savedLang = localStorage.getItem('lang');

    // Détection de la langue du navigateur (ex: 'fr', 'en', etc.)
    const browserLang = translate.getBrowserLang();

    // Définir la langue par défaut (ici, le français)
    translate.setDefaultLang('fr');

    // Utilisation de la langue sauvegardée, ou celle du navigateur si supportée (fr ou en),
    // sinon on revient à la langue par défaut ('fr')
    translate.use(
      savedLang ?? (browserLang?.match(/en|fr/) ? browserLang : 'fr')
    );

    // Récupérer l'état sauvegardé du mode sombre depuis localStorage
    const savedDark = localStorage.getItem('darkMode');

    // Correction : ici on doit comparer avec la chaîne 'true' pour définir le booléen correctement
    this.isDarkMode = savedDark === 'true';

    // Appliquer la classe CSS correspondante sur le body pour activer/désactiver le mode sombre
    this.updateDarkMode();
  }

  /**
   * Méthode pour changer la langue de l'application.
   * - Utilise ngx-translate pour appliquer la langue.
   * - Sauvegarde la sélection dans localStorage pour persistance.
   * @param lang Code langue (ex: 'fr', 'en')
   */
  setLanguage(lang: string) {
    console.log(`Langue sélectionnée : ${lang}`);
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  /**
   * Met à jour la classe CSS 'dark' sur le body selon l'état du mode sombre.
   * Cette classe est utilisée pour appliquer les styles dark via CSS.
   */
  private updateDarkMode() {
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  /**
   * Basculer le mode sombre.
   * - Inverse l'état `isDarkMode`
   * - Sauvegarde la nouvelle valeur dans localStorage
   * - Met à jour la classe CSS sur le body pour refléter le changement
   */
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.updateDarkMode();
  }
}
