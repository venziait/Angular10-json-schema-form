import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WidgetLibraryModule } from './widget-library/widget-library.module';
import { JsonSchemaFormComponent } from './json-schema-form.component';
import { NoFrameworkModule } from './framework-library/no-framework/no-framework.module';
var JsonSchemaFormModule = /** @class */ (function () {
    function JsonSchemaFormModule() {
    }
    JsonSchemaFormModule = tslib_1.__decorate([
        NgModule({
            imports: [
                CommonModule, FormsModule, ReactiveFormsModule,
                WidgetLibraryModule, NoFrameworkModule
            ],
            declarations: [JsonSchemaFormComponent],
            exports: [JsonSchemaFormComponent, WidgetLibraryModule]
        })
    ], JsonSchemaFormModule);
    return JsonSchemaFormModule;
}());
export { JsonSchemaFormModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEtZm9ybS5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL2pzb24tc2NoZW1hLWZvcm0ubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUF1QixNQUFNLGVBQWUsQ0FBQztBQUM5RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRTdFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXZFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBVXpGO0lBQUE7SUFBbUMsQ0FBQztJQUF2QixvQkFBb0I7UUFSaEMsUUFBUSxDQUFDO1lBQ1IsT0FBTyxFQUFFO2dCQUNQLFlBQVksRUFBRSxXQUFXLEVBQUUsbUJBQW1CO2dCQUM5QyxtQkFBbUIsRUFBRSxpQkFBaUI7YUFDdkM7WUFDRCxZQUFZLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztZQUN2QyxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxtQkFBbUIsQ0FBQztTQUN4RCxDQUFDO09BQ1csb0JBQW9CLENBQUc7SUFBRCwyQkFBQztDQUFBLEFBQXBDLElBQW9DO1NBQXZCLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBNb2R1bGVXaXRoUHJvdmlkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IFdpZGdldExpYnJhcnlNb2R1bGUgfSBmcm9tICcuL3dpZGdldC1saWJyYXJ5L3dpZGdldC1saWJyYXJ5Lm1vZHVsZSc7XG5cbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtQ29tcG9uZW50IH0gZnJvbSAnLi9qc29uLXNjaGVtYS1mb3JtLmNvbXBvbmVudCc7XG5cbmltcG9ydCB7IE5vRnJhbWV3b3JrTW9kdWxlIH0gZnJvbSAnLi9mcmFtZXdvcmstbGlicmFyeS9uby1mcmFtZXdvcmsvbm8tZnJhbWV3b3JrLm1vZHVsZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb21tb25Nb2R1bGUsIEZvcm1zTW9kdWxlLCBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuICAgIFdpZGdldExpYnJhcnlNb2R1bGUsIE5vRnJhbWV3b3JrTW9kdWxlXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW0pzb25TY2hlbWFGb3JtQ29tcG9uZW50XSxcbiAgZXhwb3J0czogW0pzb25TY2hlbWFGb3JtQ29tcG9uZW50LCBXaWRnZXRMaWJyYXJ5TW9kdWxlXVxufSlcbmV4cG9ydCBjbGFzcyBKc29uU2NoZW1hRm9ybU1vZHVsZSB7fVxuIl19