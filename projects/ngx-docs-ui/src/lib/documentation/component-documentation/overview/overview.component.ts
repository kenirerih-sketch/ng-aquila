import { NxBadgeModule } from '@allianz/ng-aquila/badge';
import { NxPlainButtonComponent } from '@allianz/ng-aquila/button';
import { NxFormfieldModule } from '@allianz/ng-aquila/formfield';
import { NxGridModule } from '@allianz/ng-aquila/grid';
import { NxHeadlineModule } from '@allianz/ng-aquila/headline';
import { NxIconComponent } from '@allianz/ng-aquila/icon';
import { NxIndicatorComponent } from '@allianz/ng-aquila/indicator';
import { NxInputModule } from '@allianz/ng-aquila/input';
import {
  NxRadioToggleButtonComponent,
  NxRadioToggleComponent,
} from '@allianz/ng-aquila/radio-toggle';
import { NxTableModule } from '@allianz/ng-aquila/table';
import { NxTagComponent, NxTagGroupComponent } from '@allianz/ng-aquila/taglist';
import { NX_DOCS_GITHUB_LINK, ThemeSwitcherService } from '@allianz/ngx-docs-ui';
import { Component, computed, Inject, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { NxvComponentIconComponent } from '../../../documentation/component-icon/component-icon.component';
import { ComponentDescriptor } from '../../../core/manifest';
import { GithubLinkConfig } from '../../../core/types';
import { ManifestService } from '../../../service/manifest.service';

type A1FilterTag = 'a1Light' | 'densities' | 'a1Full' | 'ndbxOnly';

@Component({
  selector: 'nxv-overview',
  templateUrl: 'overview.component.html',
  styleUrls: ['overview.component.scss'],
  imports: [
    NxFormfieldModule,
    NxGridModule,
    NxHeadlineModule,
    NxInputModule,
    NxTableModule,
    RouterLink,
    NxBadgeModule,
    NxIconComponent,
    NxIndicatorComponent,
    NxTagGroupComponent,
    NxTagComponent,
    NxPlainButtonComponent,
    NxRadioToggleComponent,
    NxRadioToggleButtonComponent,
    FormsModule,
    NxvComponentIconComponent,
  ],
})
export class NxvOverviewComponent {
  protected readonly _components = inject(ManifestService).groupedComponents;
  issueBoardLink: string;

  protected readonly _themeService = inject(ThemeSwitcherService);
  protected readonly _isAquilaDocs = computed(() =>
    this._themeService.selectedTheme().name.includes('aquila'),
  );

  readonly filterTags: { value: A1FilterTag; label: string }[] = [
    { value: 'a1Light', label: 'Only A1 Light' },
    { value: 'densities', label: 'A1 Light & Densities' },
    { value: 'a1Full', label: 'A1 Full' },
    { value: 'ndbxOnly', label: 'NDBX Only' },
  ];

  readonly selectedFilters = signal<A1FilterTag[]>(['a1Light', 'densities', 'a1Full', 'ndbxOnly']);

  readonly searchQuery = signal('');

  readonly selectedGroup = signal<string>('all');

  readonly componentGroups = [
    'Navigation',
    'Forms & Inputs',
    'Data Display',
    'Overlays',
    'Layout',
    'Actions',
    'Utilities',
  ] as const;

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.selectedFilters.set(this.filterTags.map((t) => t.value));
    this.selectedGroup.set('all');
  }

  constructor(
    @Inject(NX_DOCS_GITHUB_LINK) private readonly githubLinkConfig: GithubLinkConfig,
    private readonly _router: Router,
  ) {
    this.issueBoardLink = `${githubLinkConfig.repoLink}/issues`;
  }

  readonly allSelected = computed(
    () =>
      this.selectedFilters().length === this.filterTags.length && this.selectedGroup() === 'all',
  );
  readonly totalCount = computed(() =>
    (this._components() ?? []).reduce((sum, cat) => sum + cat.children.length, 0),
  );
  readonly filteredCount = computed(() =>
    this.filteredComponents().reduce((sum, cat) => sum + cat.children.length, 0),
  );

  navigateToComponent(component: { component: { id: string | number } }) {
    this._router.navigate(['/documentation', component.component.id]);
  }

  getComponentGroup(group: string | string[] | undefined): string | undefined {
    return Array.isArray(group) ? group.join(', ') : group;
  }

  readonly filteredComponents = computed(() => {
    const selected: Set<A1FilterTag | null> = new Set(this.selectedFilters());
    const query = this.searchQuery().trim().toLowerCase();
    const group = this.selectedGroup();
    return (this._components() ?? []).map((cat) => ({
      ...cat,
      totalChildren: cat.children.length,
      children: cat.children.filter((child) => {
        const category = this._getA1Category(child.component);
        const matchesA1Progress = category === null || selected.has(category);
        const matchesSearch = !query || this._matchesSearch(child, query);
        const groups = child.component.group;
        const matchesGroup =
          group === 'all' || (Array.isArray(groups) ? groups.includes(group) : groups === group);
        return matchesA1Progress && matchesSearch && matchesGroup;
      }),
    }));
  });

  private _matchesSearch(
    child: { label: string; component: ComponentDescriptor },
    query: string,
  ): boolean {
    if (child.label.toLowerCase().includes(query)) return true;
    if (child.component.alias) {
      return child.component.alias
        .split(',')
        .some((part) => part.trim().toLowerCase().includes(query));
    }
    return false;
  }

  private _getA1Category(c: ComponentDescriptor): A1FilterTag | null {
    if (c.a1Full) return 'a1Full';
    if (c.a1Densities) return 'densities';
    if (c.a1Light) return 'a1Light';
    if (c.a1 === false) return 'ndbxOnly';
    return null;
  }
}
