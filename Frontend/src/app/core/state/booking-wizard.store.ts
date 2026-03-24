import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Doctor, TimeSlot } from '../models/doctor.model';

interface BookingWizardState {
  step: 1 | 2 | 3;
  selectedDoctor: Doctor | null;
  selectedDate: string | null;
  selectedSlot: TimeSlot | null;
}

const initialState: BookingWizardState = {
  step: 1,
  selectedDoctor: null,
  selectedDate: null,
  selectedSlot: null
};

@Injectable({ providedIn: 'root' })
export class BookingWizardStore {
  /*
   * PATRON OBSERVER: BehaviorSubject publica cambios del flujo de agendamiento
   * para que varios componentes/pasos reaccionen sin acoplarse entre sí.
   */
  private readonly stateSubject = new BehaviorSubject<BookingWizardState>(initialState);
  readonly state$ = this.stateSubject.asObservable();

  get snapshot(): BookingWizardState {
    return this.stateSubject.value;
  }

  update(patch: Partial<BookingWizardState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...patch
    });
  }

  reset(): void {
    this.stateSubject.next(initialState);
  }
}
