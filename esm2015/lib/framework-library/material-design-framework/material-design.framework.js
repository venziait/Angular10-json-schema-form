import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { Framework } from '../framework';
// Material Design Framework
// https://github.com/angular/material2
import { FlexLayoutRootComponent } from './flex-layout-root.component';
import { FlexLayoutSectionComponent } from './flex-layout-section.component';
import { MaterialAddReferenceComponent } from './material-add-reference.component';
import { MaterialOneOfComponent } from './material-one-of.component';
import { MaterialButtonComponent } from './material-button.component';
import { MaterialButtonGroupComponent } from './material-button-group.component';
import { MaterialCheckboxComponent } from './material-checkbox.component';
import { MaterialCheckboxesComponent } from './material-checkboxes.component';
import { MaterialChipListComponent } from './material-chip-list.component';
import { MaterialDatepickerComponent } from './material-datepicker.component';
import { MaterialFileComponent } from './material-file.component';
import { MaterialInputComponent } from './material-input.component';
import { MaterialNumberComponent } from './material-number.component';
import { MaterialRadiosComponent } from './material-radios.component';
import { MaterialSelectComponent } from './material-select.component';
import { MaterialSliderComponent } from './material-slider.component';
import { MaterialStepperComponent } from './material-stepper.component';
import { MaterialTabsComponent } from './material-tabs.component';
import { MaterialTextareaComponent } from './material-textarea.component';
import { MaterialDesignFrameworkComponent } from './material-design-framework.component';
let MaterialDesignFramework = class MaterialDesignFramework extends Framework {
    constructor() {
        super(...arguments);
        this.name = 'material-design';
        this.framework = MaterialDesignFrameworkComponent;
        this.stylesheets = [
            '//fonts.googleapis.com/icon?family=Material+Icons',
            '//fonts.googleapis.com/css?family=Roboto:300,400,500,700',
        ];
        this.widgets = {
            'root': FlexLayoutRootComponent,
            'section': FlexLayoutSectionComponent,
            '$ref': MaterialAddReferenceComponent,
            'button': MaterialButtonComponent,
            'button-group': MaterialButtonGroupComponent,
            'checkbox': MaterialCheckboxComponent,
            'checkboxes': MaterialCheckboxesComponent,
            'chip-list': MaterialChipListComponent,
            'date': MaterialDatepickerComponent,
            'file': MaterialFileComponent,
            'number': MaterialNumberComponent,
            'one-of': MaterialOneOfComponent,
            'radios': MaterialRadiosComponent,
            'select': MaterialSelectComponent,
            'slider': MaterialSliderComponent,
            'stepper': MaterialStepperComponent,
            'tabs': MaterialTabsComponent,
            'text': MaterialInputComponent,
            'textarea': MaterialTextareaComponent,
            'alt-date': 'date',
            'any-of': 'one-of',
            'card': 'section',
            'color': 'text',
            'expansion-panel': 'section',
            'hidden': 'none',
            'image': 'none',
            'integer': 'number',
            'radiobuttons': 'button-group',
            'range': 'slider',
            'submit': 'button',
            'tagsinput': 'chip-list',
            'wizard': 'stepper',
        };
    }
};
MaterialDesignFramework = tslib_1.__decorate([
    Injectable()
], MaterialDesignFramework);
export { MaterialDesignFramework };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGVzaWduLmZyYW1ld29yay5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvZnJhbWV3b3JrLWxpYnJhcnkvbWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay9tYXRlcmlhbC1kZXNpZ24uZnJhbWV3b3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFekMsNEJBQTRCO0FBQzVCLHVDQUF1QztBQUN2QyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUN2RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUNuRixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNyRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUNqRixPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUM5RSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUM5RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUN4RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUd6RixJQUFhLHVCQUF1QixHQUFwQyw2QkFBcUMsU0FBUSxTQUFTO0lBRHREOztRQUVFLFNBQUksR0FBRyxpQkFBaUIsQ0FBQztRQUV6QixjQUFTLEdBQUcsZ0NBQWdDLENBQUM7UUFFN0MsZ0JBQVcsR0FBRztZQUNaLG1EQUFtRDtZQUNuRCwwREFBMEQ7U0FDM0QsQ0FBQztRQUVGLFlBQU8sR0FBRztZQUNSLE1BQU0sRUFBYSx1QkFBdUI7WUFDMUMsU0FBUyxFQUFVLDBCQUEwQjtZQUM3QyxNQUFNLEVBQWEsNkJBQTZCO1lBQ2hELFFBQVEsRUFBVyx1QkFBdUI7WUFDMUMsY0FBYyxFQUFLLDRCQUE0QjtZQUMvQyxVQUFVLEVBQVMseUJBQXlCO1lBQzVDLFlBQVksRUFBTywyQkFBMkI7WUFDOUMsV0FBVyxFQUFRLHlCQUF5QjtZQUM1QyxNQUFNLEVBQWEsMkJBQTJCO1lBQzlDLE1BQU0sRUFBYSxxQkFBcUI7WUFDeEMsUUFBUSxFQUFXLHVCQUF1QjtZQUMxQyxRQUFRLEVBQVcsc0JBQXNCO1lBQ3pDLFFBQVEsRUFBVyx1QkFBdUI7WUFDMUMsUUFBUSxFQUFXLHVCQUF1QjtZQUMxQyxRQUFRLEVBQVcsdUJBQXVCO1lBQzFDLFNBQVMsRUFBVSx3QkFBd0I7WUFDM0MsTUFBTSxFQUFhLHFCQUFxQjtZQUN4QyxNQUFNLEVBQWEsc0JBQXNCO1lBQ3pDLFVBQVUsRUFBUyx5QkFBeUI7WUFDNUMsVUFBVSxFQUFTLE1BQU07WUFDekIsUUFBUSxFQUFXLFFBQVE7WUFDM0IsTUFBTSxFQUFhLFNBQVM7WUFDNUIsT0FBTyxFQUFZLE1BQU07WUFDekIsaUJBQWlCLEVBQUUsU0FBUztZQUM1QixRQUFRLEVBQVcsTUFBTTtZQUN6QixPQUFPLEVBQVksTUFBTTtZQUN6QixTQUFTLEVBQVUsUUFBUTtZQUMzQixjQUFjLEVBQUssY0FBYztZQUNqQyxPQUFPLEVBQVksUUFBUTtZQUMzQixRQUFRLEVBQVcsUUFBUTtZQUMzQixXQUFXLEVBQVEsV0FBVztZQUM5QixRQUFRLEVBQVcsU0FBUztTQUM3QixDQUFDO0lBQ0osQ0FBQztDQUFBLENBQUE7QUE1Q1ksdUJBQXVCO0lBRG5DLFVBQVUsRUFBRTtHQUNBLHVCQUF1QixDQTRDbkM7U0E1Q1ksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBGcmFtZXdvcmsgfSBmcm9tICcuLi9mcmFtZXdvcmsnO1xuXG4vLyBNYXRlcmlhbCBEZXNpZ24gRnJhbWV3b3JrXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9tYXRlcmlhbDJcbmltcG9ydCB7IEZsZXhMYXlvdXRSb290Q29tcG9uZW50IH0gZnJvbSAnLi9mbGV4LWxheW91dC1yb290LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBGbGV4TGF5b3V0U2VjdGlvbkNvbXBvbmVudCB9IGZyb20gJy4vZmxleC1sYXlvdXQtc2VjdGlvbi5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxBZGRSZWZlcmVuY2VDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLWFkZC1yZWZlcmVuY2UuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdGVyaWFsT25lT2ZDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLW9uZS1vZi5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxCdXR0b25Db21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLWJ1dHRvbi5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxCdXR0b25Hcm91cENvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtYnV0dG9uLWdyb3VwLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbENoZWNrYm94Q29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1jaGVja2JveC5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxDaGVja2JveGVzQ29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1jaGVja2JveGVzLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbENoaXBMaXN0Q29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1jaGlwLWxpc3QuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdGVyaWFsRGF0ZXBpY2tlckNvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtZGF0ZXBpY2tlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxGaWxlQ29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1maWxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbElucHV0Q29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1pbnB1dC5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxOdW1iZXJDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLW51bWJlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxSYWRpb3NDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLXJhZGlvcy5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxTZWxlY3RDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLXNlbGVjdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxTbGlkZXJDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLXNsaWRlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxTdGVwcGVyQ29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1zdGVwcGVyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbFRhYnNDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLXRhYnMuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdGVyaWFsVGV4dGFyZWFDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLXRleHRhcmVhLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbERlc2lnbkZyYW1ld29ya0NvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay5jb21wb25lbnQnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmsgZXh0ZW5kcyBGcmFtZXdvcmsge1xuICBuYW1lID0gJ21hdGVyaWFsLWRlc2lnbic7XG5cbiAgZnJhbWV3b3JrID0gTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmtDb21wb25lbnQ7XG5cbiAgc3R5bGVzaGVldHMgPSBbXG4gICAgJy8vZm9udHMuZ29vZ2xlYXBpcy5jb20vaWNvbj9mYW1pbHk9TWF0ZXJpYWwrSWNvbnMnLFxuICAgICcvL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2Nzcz9mYW1pbHk9Um9ib3RvOjMwMCw0MDAsNTAwLDcwMCcsXG4gIF07XG5cbiAgd2lkZ2V0cyA9IHtcbiAgICAncm9vdCc6ICAgICAgICAgICAgRmxleExheW91dFJvb3RDb21wb25lbnQsXG4gICAgJ3NlY3Rpb24nOiAgICAgICAgIEZsZXhMYXlvdXRTZWN0aW9uQ29tcG9uZW50LFxuICAgICckcmVmJzogICAgICAgICAgICBNYXRlcmlhbEFkZFJlZmVyZW5jZUNvbXBvbmVudCxcbiAgICAnYnV0dG9uJzogICAgICAgICAgTWF0ZXJpYWxCdXR0b25Db21wb25lbnQsXG4gICAgJ2J1dHRvbi1ncm91cCc6ICAgIE1hdGVyaWFsQnV0dG9uR3JvdXBDb21wb25lbnQsXG4gICAgJ2NoZWNrYm94JzogICAgICAgIE1hdGVyaWFsQ2hlY2tib3hDb21wb25lbnQsXG4gICAgJ2NoZWNrYm94ZXMnOiAgICAgIE1hdGVyaWFsQ2hlY2tib3hlc0NvbXBvbmVudCxcbiAgICAnY2hpcC1saXN0JzogICAgICAgTWF0ZXJpYWxDaGlwTGlzdENvbXBvbmVudCxcbiAgICAnZGF0ZSc6ICAgICAgICAgICAgTWF0ZXJpYWxEYXRlcGlja2VyQ29tcG9uZW50LFxuICAgICdmaWxlJzogICAgICAgICAgICBNYXRlcmlhbEZpbGVDb21wb25lbnQsXG4gICAgJ251bWJlcic6ICAgICAgICAgIE1hdGVyaWFsTnVtYmVyQ29tcG9uZW50LFxuICAgICdvbmUtb2YnOiAgICAgICAgICBNYXRlcmlhbE9uZU9mQ29tcG9uZW50LFxuICAgICdyYWRpb3MnOiAgICAgICAgICBNYXRlcmlhbFJhZGlvc0NvbXBvbmVudCxcbiAgICAnc2VsZWN0JzogICAgICAgICAgTWF0ZXJpYWxTZWxlY3RDb21wb25lbnQsXG4gICAgJ3NsaWRlcic6ICAgICAgICAgIE1hdGVyaWFsU2xpZGVyQ29tcG9uZW50LFxuICAgICdzdGVwcGVyJzogICAgICAgICBNYXRlcmlhbFN0ZXBwZXJDb21wb25lbnQsXG4gICAgJ3RhYnMnOiAgICAgICAgICAgIE1hdGVyaWFsVGFic0NvbXBvbmVudCxcbiAgICAndGV4dCc6ICAgICAgICAgICAgTWF0ZXJpYWxJbnB1dENvbXBvbmVudCxcbiAgICAndGV4dGFyZWEnOiAgICAgICAgTWF0ZXJpYWxUZXh0YXJlYUNvbXBvbmVudCxcbiAgICAnYWx0LWRhdGUnOiAgICAgICAgJ2RhdGUnLFxuICAgICdhbnktb2YnOiAgICAgICAgICAnb25lLW9mJyxcbiAgICAnY2FyZCc6ICAgICAgICAgICAgJ3NlY3Rpb24nLFxuICAgICdjb2xvcic6ICAgICAgICAgICAndGV4dCcsXG4gICAgJ2V4cGFuc2lvbi1wYW5lbCc6ICdzZWN0aW9uJyxcbiAgICAnaGlkZGVuJzogICAgICAgICAgJ25vbmUnLFxuICAgICdpbWFnZSc6ICAgICAgICAgICAnbm9uZScsXG4gICAgJ2ludGVnZXInOiAgICAgICAgICdudW1iZXInLFxuICAgICdyYWRpb2J1dHRvbnMnOiAgICAnYnV0dG9uLWdyb3VwJyxcbiAgICAncmFuZ2UnOiAgICAgICAgICAgJ3NsaWRlcicsXG4gICAgJ3N1Ym1pdCc6ICAgICAgICAgICdidXR0b24nLFxuICAgICd0YWdzaW5wdXQnOiAgICAgICAnY2hpcC1saXN0JyxcbiAgICAnd2l6YXJkJzogICAgICAgICAgJ3N0ZXBwZXInLFxuICB9O1xufVxuIl19