import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Service de prédiction d'hospitalisation COVID-19
 *
 * @description
 * Ce service permet d'envoyer des données médicales au format FHIR
 * à une API de prédiction et de recevoir une estimation du risque d'hospitalisation.
 *
 * @remarks
 * Le service est configuré comme singleton et utilise HttpClient pour les requêtes HTTP.
 *
 * @example
 * // Usage dans un composant :
 * this.predictionService.predictHospitalization(fhirData)
 *   .subscribe({
 *     next: (response) => this.handlePrediction(response),
 *     error: (err) => this.handleError(err)
 *   });
 */
@Injectable({
  providedIn: 'root', // Service disponible globalement dans l'application
})
export class PredictionService {
  /**
   * URL de base de l'API de prédiction
   * @private
   */
  private readonly API_URL =
    'https://canalytics.comunicare.io/api/predictionHospitalizationCovidFhir';

  /**
   * En-têtes HTTP par défaut
   * @private
   */
  private readonly DEFAULT_HEADERS = new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });

  /**
   * Initialise une nouvelle instance du PredictionService
   * @param http - Client HTTP injecté pour effectuer les requêtes
   */
  constructor(private http: HttpClient) {}

  /**
   * Envoie une requête de prédiction d'hospitalisation
   * @param fhirData - Données patient au format FHIR JSON
   * @returns Observable émettant la réponse du serveur
   *
   * @throws {Error} En cas d'échec de la requête HTTP
   *
   * @example
   * const patientData = {
   *   resourceType: "Patient",
   *   // ... autres données FHIR
   * };
   *
   * this.predictionService.predictHospitalization(patientData)
   *   .subscribe(response => console.log(response));
   */
  predictHospitalization(fhirData: object): Observable<any> {
    return this.http.post(this.API_URL, fhirData, {
      headers: this.DEFAULT_HEADERS,
      responseType: 'json',
    });
  }

  /**
   * Gère les erreurs de requête HTTP
   * @param error - Objet d'erreur reçu
   * @returns Message d'erreur lisible
   * @private
   */
  private handleError(error: any): string {
    console.error('Erreur lors de la prédiction:', error);

    if (error.status === 0) {
      return 'Erreur de connexion au serveur';
    } else if (error.status >= 400 && error.status < 500) {
      return `Erreur client: ${error.error?.message || error.message}`;
    } else {
      return `Erreur serveur: ${
        error.statusText || 'Problème interne du serveur'
      }`;
    }
  }
}
