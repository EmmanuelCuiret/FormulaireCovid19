import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Composant d'affichage des résultats de prédiction médicale
 *
 * @description
 * Ce composant présente :
 * - Le résultat global de la prédiction
 * - Le détail par méthode d'analyse
 * - Les options d'interaction (détails, reporting)
 *
 * @example
 * <app-prediction-results
 *   [predictionData]="predictionResults"
 *   [showDetails]="showDetailedResults"
 *   (toggleDetails)="onToggleDetails()">
 * </app-prediction-results>
 */
@Component({
  selector: 'app-prediction-results',
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
  templateUrl: './prediction-results.component.html',
})
export class PredictionResultsComponent {
  /**
   * Données de prédiction à afficher
   * @input
   * @structure
   * {
   *   probabilityDecimal: number,
   *   details: Array<{
   *     method: string,
   *     ambulatory: number,
   *     hospitalization: number
   *   }>
   * }
   */
  @Input() predictionData: any;

  /**
   * Contrôle l'affichage des détails avancés
   * @input
   * @default false
   */
  @Input() showDetails = false;

  /**
   * Affiche le message de succès après reporting
   * @input
   * @default false
   */
  @Input() showSuccess = false;

  /**
   * Événement émis lors du clic sur le bouton de détails
   * @output
   */
  @Output() toggleDetails = new EventEmitter<void>();

  /**
   * Événement émis lors du clic sur le bouton de reporting
   * @output
   */
  @Output() toggleReporting = new EventEmitter<void>();

  /**
   * Formate une probabilité décimale en pourcentage lisible
   * @param decimal - Valeur décimale entre 0 et 1
   * @returns Chaîne formatée (ex: "75%") ou "N/A" si invalide
   * @example
   * getFormattedProbability(0.752) // "75%"
   */
  getFormattedProbability(decimal: number): string {
    if (decimal === null || isNaN(decimal)) return 'N/A';
    return (decimal * 100).toFixed(0) + '%';
  }
}
