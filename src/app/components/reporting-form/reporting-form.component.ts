import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';

/**
 * Interface pour les données de reporting
 */
interface ReportingData {
  providerNumber: string;
  country: string;
}

/**
 * Constantes pour les valeurs fixes
 */
const DEFAULT_COUNTRY = 'BE';
const NUMERIC_PATTERN = /^[0-9]+$/;
const DEFAULT_SUCCESS_DURATION = 3000; // 3 secondes

/**
 * Composant de formulaire de reporting médical
 *
 * @description
 * Ce composant permet :
 * - De signaler un désaccord avec les résultats de prédiction
 * - De saisir les informations du prestataire médical
 * - De sélectionner le pays concerné
 * - De valider et soumettre le rapport
 *
 * @example
 * <app-reporting-form
 *   [showSuccess]="showSuccessMessage"
 *   (formSubmitted)="handleReportingSubmit($event)">
 * </app-reporting-form>
 */
@Component({
  selector: 'app-reporting-form',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './reporting-form.component.html',
})
export class ReportingFormComponent {
  /**
   * Contrôle l'affichage du message de succès
   * @input
   * @default false
   */
  @Input() showSuccess = false;

  /**
   * Durée d'affichage du message de succès en ms
   * @input
   * @default 3000
   */
  @Input() successDuration = DEFAULT_SUCCESS_DURATION;

  /**
   * Événement émis lors de la soumission valide du formulaire
   * @output
   * @emits ReportingData Données du formulaire validées
   */
  @Output() formSubmitted = new EventEmitter<ReportingData>();

  /**
   * Groupe de formulaire contenant les contrôles de reporting
   */
  form!: FormGroup;

  /**
   * Configuration de la boîte de dialogue de sélection du pays
   */
  countryAlertOptions: any;

  constructor(private fb: FormBuilder, private translate: TranslateService) {
    this.initializeForm();
    this.prepareAlertOptions();
  }

  /**
   * Initialise le formulaire avec ses contrôles et validateurs
   * @private
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      providerNumber: [
        '',
        [Validators.required, Validators.pattern(NUMERIC_PATTERN)],
      ],
      country: [DEFAULT_COUNTRY],
    });
  }

  /**
   * Prépare la configuration de la boîte de dialogue de sélection du pays
   * @private
   */
  private prepareAlertOptions(): void {
    this.countryAlertOptions = {
      header: this.translate.instant('COUNTRY_ALERT_TITLE'),
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        { text: this.translate.instant('OK'), role: 'confirm' },
      ],
    };
  }

  /**
   * Gère la soumission du formulaire
   * @description
   * - Valide les données du formulaire
   * - Émet l'événement formSubmitted si valide
   * - Affiche les erreurs si invalide
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.showFieldErrors();
      return;
    }

    this.formSubmitted.emit({
      providerNumber: this.form.value.providerNumber,
      country: this.form.value.country,
    });

    if (this.successDuration > 0) {
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, this.successDuration);
    }
  }

  /**
   * Affiche les erreurs de champ et scroll vers la première erreur
   * @private
   */
  private showFieldErrors(): void {
    this.form.markAllAsTouched();
    // Ici vous pourriez ajouter un scroll vers le premier champ invalide
  }

  /**
   * Filtre les caractères non numériques dans le champ providerNumber
   * @param event - Événement d'entrée
   * @description
   * Garantit que le numéro de prestataire ne contient que des chiffres
   * et met à jour la valeur du contrôle
   */
  filterNumbers(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filteredValue = input.value.replace(/[^0-9]/g, '');

    if (input.value !== filteredValue) {
      input.value = filteredValue;
    }

    this.form.get('providerNumber')?.setValue(filteredValue);
    this.form.get('providerNumber')?.updateValueAndValidity();
  }

  /**
   * Helper pour accéder facilement aux contrôles du formulaire dans le template
   * @param controlName - Nom du contrôle
   * @returns FormControl
   * @throws Error si le contrôle n'existe pas
   */
  getFormControl(controlName: string): FormControl {
    const control = this.form.get(controlName);
    if (!control) {
      throw new Error(`Control ${controlName} not found`);
    }
    return control as FormControl;
  }
}
