import { isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  DOCUMENT,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  PLATFORM_ID,
  Type,
} from '@angular/core';

import { LoadableStyle } from './loadable-style';

const appsWithLoaders = new WeakMap<
  ApplicationRef,
  {
    loaders: Set<Type<unknown>>;
    refs: ComponentRef<unknown>[];
  }
>();

@Injectable({
  providedIn: 'root',
})
export class StyleLoaderService {
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private _appRef: ApplicationRef | undefined;

  loadStyles(component: Type<LoadableStyle>): void {
    const appRef = (this._appRef = this._appRef || this.injector.get(ApplicationRef));
    let data = appsWithLoaders.get(appRef);

    if (!data) {
      data = { loaders: new Set(), refs: [] };
      appsWithLoaders.set(appRef, data);

      appRef.onDestroy(() => {
        appsWithLoaders.get(appRef)?.refs.forEach((ref) => ref.destroy());
        appsWithLoaders.delete(appRef);
      });
    }

    if (!data.loaders.has(component)) {
      data.loaders.add(component);
      const createdComponent = createComponent(component, {
        environmentInjector: this.environmentInjector,
      });
      data.refs.push(createdComponent);

      if (
        isPlatformBrowser(this.platformId) &&
        (createdComponent.instance as LoadableStyle).addHtmlElement
      ) {
        appRef.attachView(createdComponent.hostView);
        this.document.documentElement.appendChild(createdComponent.location.nativeElement);
      }
    }
  }
}
