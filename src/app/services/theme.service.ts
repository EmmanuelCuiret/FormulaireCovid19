import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' }) // Service singleton disponible dans toute l'application
export class ThemeService {
  /**
   * Booléen qui indique si le mode sombre est activé ou non.
   * Initialisé en fonction de la valeur sauvegardée dans localStorage.
   */
  isDarkMode = false;

  constructor() {
    // Lors de la création du service, récupération de la préférence enregistrée dans localStorage
    const saved = localStorage.getItem('darkMode');

    // La préférence est une chaîne, on la convertit en booléen
    this.isDarkMode = saved === 'true';

    // Appliquer immédiatement le thème (ajout ou suppression de la classe CSS 'dark' sur le body)
    this.applyTheme();
  }

  /**
   * Inverse l'état actuel du mode sombre.
   * Met à jour localStorage avec la nouvelle valeur.
   * Applique le thème mis à jour sur le body.
   */
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyTheme();
  }

  /**
   * Applique ou retire la classe CSS 'dark' sur le body selon l'état isDarkMode.
   * Utilisation de classList.toggle avec second param pour ajouter ou retirer explicitement.
   */
  private applyTheme() {
    document.body.classList.toggle('dark', this.isDarkMode);
  }
}
