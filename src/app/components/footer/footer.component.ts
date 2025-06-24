import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular'; // Modules UI Ionic (boutons, grilles, etc.)
import { CommonModule } from '@angular/common'; // Module Angular commun (ngIf, ngFor, etc.)

@Component({
  selector: 'app-footer', // Sélecteur pour insérer ce composant dans les templates HTML
  standalone: true, // Composant autonome (Angular 14+), pas besoin de module
  templateUrl: './footer.component.html', // Fichier HTML associé au footer
  styleUrls: ['./footer.component.scss'], // Fichier SCSS associé pour les styles
  imports: [IonicModule, CommonModule], // Modules importés et disponibles dans ce composant
})
export class FooterComponent {
  /**
   * Année courante calculée à l'instanciation du composant.
   * Utile pour afficher dynamiquement l'année dans le footer (ex: © 2025).
   */
  year = new Date().getFullYear();
}
