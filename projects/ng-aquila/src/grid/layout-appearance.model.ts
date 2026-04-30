import { InjectionToken, WritableSignal } from '@angular/core';

export interface LayoutDefaultOptions {
  appearance: WritableSignal<'default' | 'functional'>;
}

export const LAYOUT_DEFAULT_OPTIONS: InjectionToken<LayoutDefaultOptions> =
  new InjectionToken<LayoutDefaultOptions>('DEFAULT_LAYOUT_OPTIONS');
