import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PatientFormComponent } from '../components/patient-form/patient-form.component';
import { PredictionResultsComponent } from '../components/prediction-results/prediction-results.component';
import { ReportingFormComponent } from '../components/reporting-form/reporting-form.component';
import { PredictionService } from '../services/prediction.service';
import { LayoutComponent } from '../components/layout';

/**
 * Page principale de l'application - Formulaire de prédiction médicale
 *
 * @description
 * Cette page coordonne les trois principaux composants :
 * 1. Le formulaire de saisie des données patient
 * 2. L'affichage des résultats de prédiction
 * 3. Le formulaire de reporting des divergences
 *
 * Elle gère également :
 * - La communication avec le service de prédiction
 * - La transformation des données au format FHIR
 * - L'affichage conditionnel des différentes sections
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    PatientFormComponent,
    PredictionResultsComponent,
    ReportingFormComponent,
    LayoutComponent,
  ],
  templateUrl: './home.page.html',
})
export class HomePage implements OnDestroy {
  //#region Etats d'affichage

  /** Détermine si la section des résultats doit être affichée */
  showResults = false;

  /** Détermine si les détails avancés des résultats sont visibles */
  showResultsDetails = false;

  /** Détermine si le formulaire de reporting est visible */
  showReportingDetails = false;

  /** Affiche un message de succès après soumission du reporting */
  showSuccessMessage = false;

  /** Indique si une soumission est en cours (état de chargement) */
  isSubmitting = false;

  //#endregion

  //#region Données

  /** Stocke les données de prédiction reçues du service */
  predictionData: any;

  //#endregion

  //#region Gestion des souscriptions

  /** Collection des souscriptions pour une désinscription propre */
  private subscriptions = new Subscription();

  //#endregion

  constructor(
    private translate: TranslateService,
    private predictionService: PredictionService
  ) {}

  /**
   * Nettoie les ressources lors de la destruction du composant
   * @public
   * @implementation OnDestroy
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  //#region Gestion des événements

  /**
   * Gère la soumission du formulaire patient
   * @param formData - Les données du formulaire formatées
   * @description
   * 1. Met à jour l'état de soumission
   * 2. Convertit les données au format FHIR
   * 3. Appelle le service de prédiction
   * 4. Gère la réponse ou les erreurs
   */
  handleFormSubmission(formData: any): void {
    this.isSubmitting = true;
    this.showResults = false;

    this.subscriptions.add(
      this.predictionService
        .predictHospitalization(this.createFhirPayload(formData))
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.predictionData = this.processApiResponse(response);
            this.showResults = true;
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error('Erreur de prédiction:', err);
            // TODO: Ajouter la gestion des erreurs utilisateur
          },
        })
    );
  }

  /**
   * Gère la soumission du formulaire de reporting
   * @param reportData - Données du formulaire de reporting
   * @description
   * Affiche un message de succès pendant 3 secondes
   */
  handleReportingSubmission(reportData: any): void {
    this.showSuccessMessage = true;
    setTimeout(() => (this.showSuccessMessage = false), 3000);
  }

  /**
   * Bascule l'affichage des détails des résultats
   */
  toggleDetails(): void {
    this.showResultsDetails = !this.showResultsDetails;
  }

  /**
   * Bascule l'affichage du formulaire de reporting
   */
  toggleReporting(): void {
    this.showReportingDetails = !this.showReportingDetails;
  }

  //#endregion

  //#region Méthodes privées

  /**
   * Transforme les données du formulaire en payload FHIR
   * @param formData - Données brutes du formulaire
   * @returns Payload au format FHIR
   * @private
   * @description
   * Structure FHIR attendue par l'API backend :
   * - Inclut les données obligatoires (âge, sexe)
   * - Formate les listes (risques, symptômes)
   * - Gère les champs optionnels (température, oxygène)
   */
  private createFhirPayload(formData: any): any[] {
    const now = new Date().toISOString();
    return [
      {
        subject: { reference: 'patient-id' },
        issued: now,
        component: [
          // Données démographiques
          {
            code: { coding: [{ code: 'age' }] },
            valueQuantity: { value: formData.age },
          },
          {
            code: { coding: [{ code: 'sexe' }] },
            valueQuantity: { value: formData.sexe },
          },

          // Facteurs de risque (format binaire)
          ...formData.fr.map((risk: string) => ({
            code: { coding: [{ code: `fr_${risk}` }] },
            valueQuantity: { value: 1 }, // 1 = présent, 0 = absent (non implémenté)
          })),

          // Symptômes (format binaire)
          ...formData.symp.map((symptom: string) => ({
            code: { coding: [{ code: `symp_${symptom}` }] },
            valueQuantity: { value: 1 },
          })),

          // Données physiologiques optionnelles
          ...(formData.temperature
            ? [
                {
                  code: { coding: [{ code: 'temperature' }] },
                  valueQuantity: { value: formData.temperature },
                },
              ]
            : []),
          ...(formData.oxygen
            ? [
                {
                  code: { coding: [{ code: 'oxygen' }] },
                  valueQuantity: { value: formData.oxygen },
                },
              ]
            : []),
        ],
      },
    ];
  }

  /**
   * Transforme la réponse de l'API pour l'affichage
   * @param response - Réponse brute de l'API
   * @returns Données structurées pour le template
   * @private
   */
  private processApiResponse(response: any): any {
    if (!response?.data?.length) return null;

    const prediction = response.data[0].prediction;
    return {
      // Probabilité globale (résumé)
      probabilityDecimal: prediction.find((p: any) => p.rationale === 'summary')
        ?.probabilityDecimal,

      // Détails par méthode de prédiction
      details: ['RF', 'NN', 'GBT'].map((method) => ({
        method: this.translate.instant(method), // Traduction du nom de méthode
        ambulatory: this.getProbability(prediction, method, 'ambulatoire'),
        hospitalization: this.getProbability(prediction, method, 'hospitalise'),
      })),
    };
  }

  /**
   * Extrait une probabilité spécifique des données de prédiction
   * @param data - Données de prédiction complètes
   * @param rationale - Méthode de prédiction (RF/NN/GBT)
   * @param outcome - Résultat recherché (ambulatoire/hospitalise)
   * @returns Probabilité entre 0 et 1
   * @private
   */
  private getProbability(
    data: any[],
    rationale: string,
    outcome: string
  ): number {
    const prediction = data.find(
      (p: any) =>
        p.rationale === rationale && p.outcome?.coding?.[0]?.code === outcome
    );
    return prediction?.probabilityDecimal || 0;
  }

  //#endregion
}
