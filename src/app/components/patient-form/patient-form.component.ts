import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Composant de formulaire patient pour la saisie des données médicales
 *
 * @description
 * Ce composant gère :
 * - La saisie des informations patient (âge, sexe)
 * - Les mesures physiologiques (température, oxygénation)
 * - Les facteurs de risque et symptômes
 * - La validation des données
 * - L'affichage des messages d'erreur
 *
 * @example
 * <app-patient-form
 *   [isSubmitting]="loadingState"
 *   (formSubmitted)="handleFormSubmit($event)">
 * </app-patient-form>
 */
@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './patient-form.component.html',
})
export class PatientFormComponent {
  /**
   * Entrée: État de soumission du formulaire parent
   * @default false
   */
  @Input() isSubmitting = false;

  /**
   * Sortie: Événement émis lors de la soumission valide
   * @emits Données du formulaire formatées
   */
  @Output() formSubmitted = new EventEmitter<any>();

  /** Groupe de formulaire contenant tous les contrôles */
  form!: FormGroup;

  //#region Options des boîtes de dialogue

  /** Configuration de l'alerte pour le champ sexe */
  sexAlertOptions: any;

  /** Configuration de l'alerte pour les facteurs de risque */
  risksAlertOptions: any;

  /** Configuration de l'alerte pour les symptômes */
  symptomsAlertOptions: any;

  //#endregion

  constructor(private fb: FormBuilder, private translate: TranslateService) {
    this.initializeForm();
    this.prepareAlertOptions();
  }

  //#region Initialisation

  /**
   * Initialise le formulaire avec les contrôles et validateurs
   * @private
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      sexe: ['', Validators.required],
      temperature: [
        '',
        [Validators.min(34), Validators.max(43), this.stepValidator(0.1)],
      ],
      oxygen: [
        '',
        [Validators.min(80), Validators.max(100), this.stepValidator(0.1)],
      ],
      fr: [[], Validators.required],
      symp: [[], Validators.required],
    });
  }

  /**
   * Prépare les configurations des boîtes de dialogue d'alerte
   * @private
   */
  private prepareAlertOptions(): void {
    this.sexAlertOptions = this.createAlertOptions('SEX_ALERT_TITLE');
    this.risksAlertOptions = this.createAlertOptions('RISKS_ALERT_TITLE');
    this.symptomsAlertOptions = this.createAlertOptions('SYMPTOMS_ALERT_TITLE');
  }

  /**
   * Crée une configuration standard pour les alertes
   * @param titleKey - Clé de traduction pour le titre
   * @returns Configuration de l'alerte
   * @private
   */
  private createAlertOptions(titleKey: string): any {
    return {
      header: this.translate.instant(titleKey),
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        { text: this.translate.instant('OK'), role: 'confirm' },
      ],
    };
  }

  //#endregion

  //#region Gestion du formulaire

  /**
   * Gère la soumission du formulaire
   * @description
   * - Valide le formulaire
   * - Émet les données si valides
   * - Marque les champs comme touchés si invalide
   */
  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmitted.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  //#endregion

  //#region Gestion des entrées

  /**
   * Convertit une valeur d'entrée en nombre décimal
   * @param event - Événement d'entrée
   * @param controlName - Nom du contrôle à mettre à jour
   */
  convertNumber(event: any, controlName: string): void {
    const value = parseFloat(event.target.value);
    this.form.get(controlName)?.setValue(isNaN(value) ? null : value);
  }

  /**
   * Convertit une valeur d'entrée en nombre entier
   * @param event - Événement d'entrée
   * @param controlName - Nom du contrôle à mettre à jour
   */
  convertIntNumber(event: any, controlName: string): void {
    const value = event.target.value;
    const intValue = parseInt(value, 10);
    this.form.get(controlName)?.setValue(isNaN(intValue) ? null : intValue);
  }

  //#endregion

  //#region Validation

  /**
   * Validateur personnalisé pour vérifier le pas des valeurs
   * @param step - Pas attendu (ex: 0.1)
   * @returns Fonction de validation
   * @private
   */
  private stepValidator(
    step: number
  ): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = parseFloat(control.value);
      if (isNaN(value)) return null;

      // Tolérance pour les imprécisions des nombres flottants
      const epsilon = 1e-8;
      const remainder = (value / step) % 1;

      return Math.abs(remainder) > epsilon && Math.abs(1 - remainder) > epsilon
        ? { step: { requiredStep: step, actualValue: value } }
        : null;
    };
  }

  /**
   * Récupère le message d'erreur pour un contrôle
   * @param controlName - Nom du contrôle
   * @returns Message d'erreur traduit ou null si valide
   */
  getError(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (!control?.errors || !control.touched) return null;

    if (control.hasError('required'))
      return this.translate.instant('FIELD_REQUIRED');

    if (control.hasError('min') || control.hasError('max'))
      return this.translate.instant('INVALID_RANGE');

    if (control.hasError('step')) {
      const error = control.getError('step');
      return this.translate.instant('INVALID_STEP', {
        step: error.requiredStep,
        value: error.actualValue,
      });
    }

    return null;
  }

  //#endregion
}
