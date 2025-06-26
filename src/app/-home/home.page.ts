import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionService } from '../services/prediction.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LayoutComponent } from '../components/layout';
import { ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlertButton } from '@ionic/core';

/**
 * Validateur personnalisé pour s'assurer que la valeur respecte un pas donné (ex. 0.1).
 * Tolère les erreurs dues aux nombres flottants (arrondis binaires).
 */
export function stepValidator(step: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawValue = control.value;

    if (rawValue === null || rawValue === '') return null; // Champ vide est valide

    const value = parseFloat(rawValue);
    if (isNaN(value)) return { invalidNumber: true }; // Valeur non numérique invalide

    const remainder = (value / step) % 1;

    // Tolérance pour arrondis flottants
    const epsilon = 1e-8;
    if (remainder > epsilon && 1 - remainder > epsilon) {
      return { step: true }; // Erreur si pas respecté
    }

    return null; // Valide sinon
  };
}

// Interface pour la configuration d'une alerte IonAlert personnalisée
interface AlertTitles {
  header?: string;
  buttons: AlertButton[];
  cssClass?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    CommonModule,
    LayoutComponent,
    TranslateModule,
  ],
  templateUrl: './home.page.html',
})
export class HomePage implements OnDestroy {
  // Formulaires
  form: FormGroup; // Formulaire principal avec les données patients
  formResult: FormGroup; // Formulaire pour les résultats / reporting

  // États UI
  isSubmitting = false;
  isSending = false;
  isCleaning = false;
  submitButtonText = this.translate.instant('SUBMIT');
  sendButtonText = this.translate.instant('SEND');
  showResults = false;
  errorMessage: string | null = null;
  showResultsDetails = false;
  isMobile = false;
  showReportingDetails = false;
  showSuccessMessage = false;

  // Données affichées
  predictionSummary: any;
  predictionDetails: any[] = [];

  private translationSub: any; // Souscription à la langue pour mise à jour dynamique

  // Configuration des titres et boutons des alertes contextuelles
  alertOptions: Record<string, AlertTitles> = {};

  /**
   * Définit les options d'alertes (titre, boutons) traduits selon le contexte
   */
  availableTitles(): Record<string, AlertTitles> {
    return {
      sexe: {
        header: this.translate.instant('SEX_ALERT_TITLE'),
        buttons: [
          { text: this.translate.instant('CANCEL'), role: 'cancel' },
          { text: this.translate.instant('OK'), role: 'confirm' },
        ],
      },
      fr: {
        header: this.translate.instant('RISKS_ALERT_TITLE'),
        buttons: [
          { text: this.translate.instant('CANCEL'), role: 'cancel' },
          { text: this.translate.instant('OK'), role: 'confirm' },
        ],
      },
      symp: {
        header: this.translate.instant('SYMPTOMS_ALERT_TITLE'),
        buttons: [
          { text: this.translate.instant('CANCEL'), role: 'cancel' },
          { text: this.translate.instant('OK'), role: 'confirm' },
        ],
      },
      country: {
        header: this.translate.instant('COUNTRY_ALERT_TITLE'),
        buttons: [
          { text: this.translate.instant('CANCEL'), role: 'cancel' },
          { text: this.translate.instant('OK'), role: 'confirm' },
        ],
      },
    };
  }

  /**
   * Renvoie les options d'alerte avec un style CSS standard
   */
  getAlertOptions(context: string): AlertTitles {
    return {
      cssClass: 'custom-alert',
      ...this.availableTitles()[context],
    };
  }

  /**
   * Renvoie les options d'alerte avec un style CSS multi-sélections
   */
  getMultiAlertOptions(context: string): AlertTitles {
    return {
      cssClass: 'custom-multi-alert',
      ...this.availableTitles()[context],
    };
  }

  /**
   * Formate une probabilité décimale en pourcentage affichable
   */
  getFormattedProbability(decimal: number): string {
    if (decimal === null || isNaN(decimal)) return 'N/A';
    const percentage = Math.round(decimal * 100);
    return `${percentage}%`;
  }

  /**
   * Réinitialise les formulaires et cache les résultats
   */
  clearForm() {
    this.showResults = false;
    this.showResultsDetails = false;
    this.showReportingDetails = false;
    this.form.reset();
    this.formResult.reset();
  }

  /**
   * Convertit une valeur saisie en nombre et la place dans le formControl
   */
  convertNumber(event: any, controlName: string) {
    const value = parseFloat(event.target.value);
    this.form.get(controlName)?.setValue(isNaN(value) ? null : value);
  }

  /**
   * Convertit une valeur saisie en nombre entier et la place dans le formControl
   */
  convertIntNumber(event: any, controlName: string) {
    const value = event.target.value;
    const intValue = parseInt(value, 10);
    if (isNaN(intValue)) {
      this.form.get(controlName)?.setValue(null);
    } else {
      this.form.get(controlName)?.setValue(intValue);
    }
  }

  /**
   * Filtre la saisie pour ne garder que les chiffres, met à jour et valide
   */
  filterNumbers(event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    input.value = value.replace(/[^0-9]/g, ''); // Ne garder que chiffres
    this.formResult.get('providerNumber')?.setValue(input.value);
    this.formResult.get('providerNumber')?.updateValueAndValidity();
  }

  /**
   * Simule l'envoi d'un message à l'équipe médicale,
   * affiche une confirmation, réinitialise le formulaire
   */
  contactMedicalTeam() {
    if (this.formResult.valid && !this.isSubmitting) {
      this.isSending = true;
      this.isCleaning = true;
      this.sendButtonText = this.translate.instant('SENDING');
      this.showSuccessMessage = false;

      setTimeout(() => {
        console.log('Message transmis avec succès (simulation)');
        this.isSending = false;
        this.isCleaning = false;
        this.sendButtonText = this.translate.instant('SEND');
        this.showSuccessMessage = true;
        this.formResult.reset();

        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      }, 1000);
    } else {
      this.formResult.markAllAsTouched();
    }
  }

  /**
   * Affiche ou cache le détail des résultats
   */
  toggleDetails(event: Event) {
    event.preventDefault();
    this.showResultsDetails = !this.showResultsDetails;
  }

  /**
   * Affiche ou cache les détails du reporting médical
   */
  toggleReporting(event: Event) {
    event.preventDefault();
    this.showReportingDetails = !this.showReportingDetails;
  }

  /**
   * Getter indiquant si un message global d'erreur doit être affiché sur le formulaire
   */
  get showGlobalError(): boolean {
    return !!(
      this.form.invalid &&
      this.form.touched &&
      (this.form.get('age')?.hasError('required') ||
        this.form.get('sexe')?.hasError('required') ||
        this.form.get('fr')?.hasError('required') ||
        this.form.get('symp')?.hasError('required'))
    );
  }

  // Reference sur l’élément DOM pour le scroll automatique vers les résultats
  @ViewChild('resultsRef') resultsRef!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private predictionService: PredictionService,
    private breakpointObserver: BreakpointObserver,
    private translate: TranslateService
  ) {
    // Formulaire résultats (ex: numéro fournisseur)
    this.formResult = this.fb.group({
      providerNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/), // chiffres uniquement
        ],
      ],
    });

    // Formulaire principal patient
    this.form = this.fb.group({
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      sexe: ['', Validators.required],
      temperature: [
        '',
        [Validators.min(34), Validators.max(43), stepValidator(0.1)],
      ],
      oxygen: [
        '',
        [Validators.min(80), Validators.max(100), stepValidator(0.1)],
      ],
      fr: [[], Validators.required],
      symp: [[], Validators.required],
    });

    // Initialisation des textes traduits des boutons
    this.setTranslatedButtons();

    // Souscription aux changements de langue pour mettre à jour les labels boutons
    this.translationSub = this.translate.onLangChange.subscribe(() => {
      this.setTranslatedButtons();
    });
  }

  ngOnDestroy(): void {
    // Nettoyage de la souscription pour éviter fuite mémoire
    if (this.translationSub) {
      this.translationSub.unsubscribe();
    }
  }

  /**
   * Met à jour les libellés des boutons à la langue courante
   */
  private setTranslatedButtons(): void {
    this.submitButtonText = this.translate.instant('SUBMIT');
    this.sendButtonText = this.translate.instant('SEND');
  }

  /**
   * Getter qui retourne un message d'erreur si le formulaire des résultats est invalide
   */
  get requiredFieldsResultError(): string | null {
    if (!this.formResult.invalid || !this.formResult.touched) return null;
    const missingFields = this.formResult
      .get('providerNumber')
      ?.hasError('required');
    if (!missingFields) return null;
    return this.translate.instant('FORM_RESULTS_FILLING_ERRORS');
  }

  /**
   * Getter qui retourne un message d'erreur pour les champs requis du formulaire principal
   */
  get requiredFieldsError(): String | null {
    if (!this.form.invalid || !this.form.touched) return null;

    const labels: Record<string, string> = {
      age: this.translate.instant('FORM_FILLING_AGE_ERRORS'),
      sexe: this.translate.instant('FORM_FILLING_SEX_ERRORS'),
      fr: this.translate.instant('FORM_FILLING_RISKS_ERRORS'),
      symp: this.translate.instant('FORM_FILLING_SYMPTOMS_ERRORS'),
    };

    const missingFields = Object.keys(labels).filter((field) =>
      this.form.get(field)?.hasError('required')
    );

    if (missingFields.length === 0) return null;

    const labelList = missingFields.map((f) => `${labels[f]}`);

    let message: string;

    if (labelList.length === 1) {
      message =
        this.translate.instant('FORM_FILLING_LEFT_PART_SINGLE') +
        labelList[0] +
        this.translate.instant('FORM_FILLING_RIGHT_PART_SINGLE');
    } else {
      const last = labelList.pop();
      message =
        this.translate.instant('FORM_FILLING_LEFT_PART') +
        labelList.join(', ') +
        this.translate.instant('FORM_FILLING_MIDDLE_PART') +
        last +
        this.translate.instant('FORM_FILLING_RIGHT_PART');
    }

    return message;
  }

  /**
   * Affiche un message d'erreur temporaire dans l'UI
   * @param message Message à afficher
   */
  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = null;
    }, 10000); // 10 secondes
  }

  /**
   * Soumission du formulaire principal pour lancer la prédiction
   */
  onSubmit() {
    this.errorMessage = null;
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.isCleaning = true;
      this.submitButtonText = this.translate.instant('SUBMITTING');
      this.showResults = false;

      // Conversion des données du formulaire au format attendu par l'API (FHIR)
      const fhirData = this.createFhirPayLoad(this.form.value);

      console.log('Données envoyées:', fhirData);

      this.predictionService.predictHospitalization(fhirData).subscribe({
        next: (response: any) => {
          // Vérification robuste de la validité de la réponse
          if (!response || typeof response.success !== 'boolean') {
            this.showError('Réponse serveur invalide');
            this.resetSubmitState();
            return;
          }

          if (response.success === false) {
            const errorMessage =
              response.message || 'Une erreur inconnue est survenue';
            this.showError(errorMessage);
            this.resetSubmitState();
            return;
          }

          // Traitement en cas de succès
          console.log('Succès:', response);
          this.processApiResponse(response);
          this.resetSubmitState();
          this.showResults = true;

          // Scroll vers résultats sur mobile
          this.scrollToResultsOnMobile();
        },
        error: (err: any) => {
          console.error('Erreur:', err);
          this.resetSubmitState();

          // Gestion détaillée des erreurs HTTP
          let errorMessage = 'Erreur réseau';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          } else if (err.status) {
            errorMessage =
              `Erreur ${err.status}` +
              (err.statusText ? `: ${err.statusText}` : '');
          }

          this.showError(errorMessage);
        },
      });
    } else {
      this.form.markAllAsTouched(); // Affiche les erreurs dans le formulaire
      console.warn('❌ Formulaire invalide', this.form.value);
    }
  }

  /**
   * Réinitialise les états d'envoi du formulaire et le texte du bouton
   */
  private resetSubmitState(): void {
    this.isSubmitting = false;
    this.isCleaning = false;
    this.submitButtonText = this.translate.instant('SUBMIT');
  }

  /**
   * Scroll automatique vers les résultats sur mobile, pour une meilleure UX
   */
  private scrollToResultsOnMobile(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        if (result.matches) {
          this.isMobile = true;
          setTimeout(() => {
            this.resultsRef?.nativeElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }, 100);
        }
      });
  }

  /**
   * Crée le payload au format FHIR attendu par l'API,
   * à partir des données du formulaire utilisateur
   *
   * Le format est un tableau d'objets, avec chaque élément
   * représentant un composant (age, sexe, facteurs de risques, symptômes, etc.)
   */
  private createFhirPayLoad(formData: any): any[] {
    const now = new Date().toISOString();

    // Conversion des facteurs de risque en 0/1 selon la présence dans le formulaire
    const riskFactors = {
      fr_asthme: formData.fr.includes('asthme') ? 1 : 0,
      fr_bpco: formData.fr.includes('bpco') ? 1 : 0,
      fr_diabete: formData.fr.includes('diabete') ? 1 : 0,
      fr_maladie_cardiovasculaire: formData.fr.includes(
        'maladie_cardiovasculaire'
      )
        ? 1
        : 0,
      fr_neoplasie: formData.fr.includes('neoplasie') ? 1 : 0,
      fr_obese: formData.fr.includes('obese') ? 1 : 0,
    };

    // Conversion des symptômes en 0/1
    const symptoms = {
      symp_cephalees: formData.symp.includes('cephalees') ? 1 : 0,
      symp_digestifs: formData.symp.includes('digestifs') ? 1 : 0,
      symp_dyspnee: formData.symp.includes('dyspnee') ? 1 : 0,
      symp_fievre: formData.symp.includes('fievre') ? 1 : 0,
      symp_myalgies: formData.symp.includes('myalgies') ? 1 : 0,
      symp_toux: formData.symp.includes('toux') ? 1 : 0,
    };

    // Construction de la structure FHIR attendue par l'API
    return [
      {
        subject: {
          reference: 'patient-id', // A remplacer par ID réel
          display: 'nom et prénom du patient', // Facultatif
        },
        issued: now,
        component: [
          {
            valueQuantity: { value: Number(formData.age) },
            code: {
              coding: [
                { code: 'age', display: 'Age', system: 'http://comunicare.io' },
              ],
            },
          },
          {
            valueQuantity: { value: Number(formData.sexe) },
            code: {
              coding: [
                {
                  code: 'sexe',
                  display: 'Sexe',
                  system: 'http://comunicare.io',
                },
              ],
            },
          },
          // Ajout des facteurs de risque
          ...Object.entries(riskFactors).map(([code, value]) => ({
            valueQuantity: { value },
            code: {
              coding: [
                {
                  code,
                  display: code.replace('fr_', '').replace('_', ' '),
                  system: 'http://comunicare.io',
                },
              ],
            },
          })),
          // Ajout des symptômes
          ...Object.entries(symptoms).map(([code, value]) => ({
            valueQuantity: { value },
            code: {
              coding: [
                {
                  code,
                  display: code.replace('symp_', ''),
                  system: 'http://comunicare.io',
                },
              ],
            },
          })),
          // Température (optionnelle)
          ...(formData.temperature
            ? [
                {
                  valueQuantity: { value: Number(formData.temperature) },
                  code: {
                    coding: [
                      {
                        code: 'temperature',
                        display: 'Température',
                        system: 'http://comunicare.io',
                      },
                    ],
                  },
                },
              ]
            : []),
          // Oxygène (optionnelle)
          ...(formData.oxygen
            ? [
                {
                  valueQuantity: { value: Number(formData.oxygen) },
                  code: {
                    coding: [
                      {
                        code: 'oxygen',
                        display: 'Oxygène',
                        system: 'http://comunicare.io',
                      },
                    ],
                  },
                },
              ]
            : []),
        ],
      },
    ];
  }

  /**
   * Traite la réponse API et prépare les données à afficher
   */
  private processApiResponse(response: any) {
    if (response.success && response.data?.length > 0) {
      const predictionData = response.data[0].prediction;

      // Extraction du résumé
      this.predictionSummary = predictionData.find(
        (p: any) => p.rationale === 'summary'
      );

      // Organisation des détails selon la méthode utilisée
      this.predictionDetails = [
        {
          method: this.translate.instant('RF'),
          ambulatory: this.getProbability(predictionData, 'RF', 'ambulatoire'),
          hospitalization: this.getProbability(
            predictionData,
            'RF',
            'hospitalise'
          ),
        },
        {
          method: this.translate.instant('NN'),
          ambulatory: this.getProbability(predictionData, 'NN', 'ambulatoire'),
          hospitalization: this.getProbability(
            predictionData,
            'NN',
            'hospitalise'
          ),
        },
        {
          method: this.translate.instant('GBT'),
          ambulatory: this.getProbability(predictionData, 'GBT', 'ambulatoire'),
          hospitalization: this.getProbability(
            predictionData,
            'GBT',
            'hospitalise'
          ),
        },
      ];
    }
  }

  /**
   * Récupère la probabilité dans le tableau de prédictions
   * selon la méthode (rationale) et le type de résultat (outcome)
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
}
