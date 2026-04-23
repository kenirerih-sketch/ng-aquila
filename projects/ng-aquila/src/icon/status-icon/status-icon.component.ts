import { ALLIANZ_ONE, AllianzOneOptions } from '@allianz/ng-aquila/config/allianz-one/token';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { NxIconComponent } from '../icon.component';

export type NxStatusIconType = 'success' | 'info' | 'error' | 'warning';

export type NxStatusIconSize = 'auto' | 's' | 'm' | 'l' | 'xl' | '2xl';

@Component({
  selector: 'nx-status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxIconComponent, NgClass],
})
export class NxStatusIconComponent {
  private readonly allianzOne = inject(ALLIANZ_ONE, { optional: true }) as AllianzOneOptions | null;

  private readonly a1Enabled = computed(() => this.allianzOne?.enabled?.() ?? false);

  /** Sets status type */
  readonly type = input.required<NxStatusIconType>();

  /** Specifies the size of the icon. */
  readonly size = input<NxStatusIconSize>('auto');

  private readonly statusListNdbx: { [key in NxStatusIconType]: any } = {
    error: { icon: 'exclamation-triangle' },
    warning: { icon: 'exclamation-circle-warning' },
    success: { icon: 'check-circle' },
    info: { icon: 'info-circle' },
  };

  private readonly statusListA1: { [key in NxStatusIconType]: any } = {
    error: { iconSmall: 'exclamation-circle', iconLarge: 'product-important-info' },
    warning: { iconSmall: 'exclamation-triangle', iconLarge: 'exclamation-triangle-o' },
    success: { iconSmall: 'check-circle', iconLarge: 'product-check' },
    info: { iconSmall: 'info-circle', iconLarge: 'product-help-information' },
  };

  /** @docs-private */
  protected readonly icon = computed(() => {
    if (this.a1Enabled() && ['auto', 's', 'm'].includes(this.size())) {
      return this.statusListA1[this.type()]?.iconSmall;
    }

    if (this.a1Enabled()) {
      return this.statusListA1[this.type()]?.iconLarge;
    }

    return this.statusListNdbx[this.type()]?.icon;
  });

  /** @docs-private */
  get typeClass(): string {
    return `nx-status-icon--${this.type()}`;
  }
}
