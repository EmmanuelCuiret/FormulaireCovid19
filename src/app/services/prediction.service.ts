import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root', // Service singleton accessible dans toute l'application
})
export class PredictionService {
  // Injection du client HTTP Angular pour faire des requêtes API REST
  constructor(private http: HttpClient) {}

  /**
   * Envoie les données au service de prédiction d'hospitalisation COVID via une requête POST.
   *
   * @param data Données à envoyer au serveur (format JSON attendu)
   * @returns Observable de la réponse HTTP (à souscrire dans le composant appelant)
   */
  predictHospitalization(data: any) {
    return this.http.post(
      'https://canalytics.comunicare.io/api/predictionHospitalizationCovidFhir',
      data,
      {
        headers: { 'Content-Type': 'application/json' }, // Précise que le corps est du JSON
      }
    );
  }
}
