import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { COMPONENT_ICONS } from './component-icons';

@Component({
  selector: 'nxv-component-icon',
  template: `<span class="nxv-component-icon" [innerHTML]="svg()"></span>`,
  styles: [
    `
      .nxv-component-icon {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        opacity: 0.8;
        color: var(--text-01);
        vertical-align: middle;

        svg {
          display: block;
          width: var(--icon-plain-xl-size, 36px);
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NxvComponentIconComponent {
  private readonly _sanitizer = inject(DomSanitizer);

  readonly label = input.required<string>();

  protected readonly svg = computed<SafeHtml>(() => {
    const paths = COMPONENT_ICONS[this.label()];
    if (!paths) return this._sanitizer.bypassSecurityTrustHtml('');
    return this._sanitizer.bypassSecurityTrustHtml(
      `<svg viewBox="-1 -1 39 26" fill="currentColor" aria-hidden="true">${paths}</svg>`,
    );
  });
}
