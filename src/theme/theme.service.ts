import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' }) // Ce service est singleton et disponible dans toute l'application
export class ThemeService {
  // Comportement observable qui émet l'état actuel du mode sombre (true = activé, false = désactivé)
  private darkMode$ = new BehaviorSubject<boolean>(false);

  constructor() {
    // Récupération de la préférence de mode sombre enregistrée dans localStorage
    const saved = localStorage.getItem('darkMode');

    // Si la préférence est définie (true/false), on l'utilise
    // Sinon on se base sur la préférence système (media query)
    const isDark =
      saved === 'true' ||
      (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Appliquer le mode sombre au chargement
    this.setDarkMode(isDark);
  }

  /**
   * Getter qui retourne l'observable pour s'abonner aux changements du mode sombre
   * Les composants peuvent s'abonner à cette observable pour réagir aux changements.
   */
  get isDarkMode() {
    return this.darkMode$.asObservable();
  }

  /**
   * Méthode pour modifier l'état du mode sombre.
   * - Met à jour le BehaviorSubject (émission d'un nouvel état)
   * - Ajoute ou enlève la classe 'dark' sur le body pour appliquer le thème
   * - Enregistre la préférence dans localStorage pour persistance entre sessions
   */
  setDarkMode(isDark: boolean) {
    this.darkMode$.next(isDark); // Notifie les abonnés du changement

    if (isDark) {
      document.body.classList.add('dark'); // Active le thème sombre
    } else {
      document.body.classList.remove('dark'); // Désactive le thème sombre
    }

    localStorage.setItem('darkMode', isDark.toString()); // Sauvegarde la préférence utilisateur
  }
}
