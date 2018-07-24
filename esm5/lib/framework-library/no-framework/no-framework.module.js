import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetLibraryModule } from '../../widget-library/widget-library.module';
import { Framework } from '../framework';
// No framework - plain HTML controls (styles from form layout only)
import { NoFrameworkComponent } from './no-framework.component';
import { NoFramework } from './no.framework';
import { WidgetLibraryService } from '../../widget-library/widget-library.service';
import { JsonSchemaFormService } from '../../json-schema-form.service';
import { FrameworkLibraryService } from '../framework-library.service';
var NoFrameworkModule = /** @class */ (function () {
    function NoFrameworkModule() {
    }
    NoFrameworkModule = tslib_1.__decorate([
        NgModule({
            imports: [CommonModule, WidgetLibraryModule],
            declarations: [NoFrameworkComponent],
            exports: [NoFrameworkComponent],
            providers: [JsonSchemaFormService, FrameworkLibraryService, WidgetLibraryService,
                { provide: Framework, useClass: NoFramework, multi: true }
            ],
            entryComponents: [NoFrameworkComponent]
        })
    ], NoFrameworkModule);
    return NoFrameworkModule;
}());
export { NoFrameworkModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8tZnJhbWV3b3JrLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvZnJhbWV3b3JrLWxpYnJhcnkvbm8tZnJhbWV3b3JrL25vLWZyYW1ld29yay5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQXVCLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUNqRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLG9FQUFvRTtBQUNwRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDbkYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdkUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFXdkU7SUFBQTtJQUFpQyxDQUFDO0lBQXJCLGlCQUFpQjtRQVQ3QixRQUFRLENBQUM7WUFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsbUJBQW1CLENBQUM7WUFDNUMsWUFBWSxFQUFFLENBQUMsb0JBQW9CLENBQUM7WUFDcEMsT0FBTyxFQUFFLENBQUMsb0JBQW9CLENBQUM7WUFDL0IsU0FBUyxFQUFFLENBQUMscUJBQXFCLEVBQUUsdUJBQXVCLEVBQUUsb0JBQW9CO2dCQUM5RSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO2FBQzNEO1lBQ0QsZUFBZSxFQUFFLENBQUMsb0JBQW9CLENBQUM7U0FDeEMsQ0FBQztPQUNXLGlCQUFpQixDQUFJO0lBQUQsd0JBQUM7Q0FBQSxBQUFsQyxJQUFrQztTQUFyQixpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgTW9kdWxlV2l0aFByb3ZpZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgV2lkZ2V0TGlicmFyeU1vZHVsZSB9IGZyb20gJy4uLy4uL3dpZGdldC1saWJyYXJ5L3dpZGdldC1saWJyYXJ5Lm1vZHVsZSc7XG5pbXBvcnQgeyBGcmFtZXdvcmsgfSBmcm9tICcuLi9mcmFtZXdvcmsnO1xuLy8gTm8gZnJhbWV3b3JrIC0gcGxhaW4gSFRNTCBjb250cm9scyAoc3R5bGVzIGZyb20gZm9ybSBsYXlvdXQgb25seSlcbmltcG9ydCB7IE5vRnJhbWV3b3JrQ29tcG9uZW50IH0gZnJvbSAnLi9uby1mcmFtZXdvcmsuY29tcG9uZW50JztcbmltcG9ydCB7IE5vRnJhbWV3b3JrIH0gZnJvbSAnLi9uby5mcmFtZXdvcmsnO1xuXG5pbXBvcnQgeyBXaWRnZXRMaWJyYXJ5U2VydmljZSB9IGZyb20gJy4uLy4uL3dpZGdldC1saWJyYXJ5L3dpZGdldC1saWJyYXJ5LnNlcnZpY2UnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vanNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlJztcbmltcG9ydCB7IEZyYW1ld29ya0xpYnJhcnlTZXJ2aWNlIH0gZnJvbSAnLi4vZnJhbWV3b3JrLWxpYnJhcnkuc2VydmljZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsIFdpZGdldExpYnJhcnlNb2R1bGVdLFxuICBkZWNsYXJhdGlvbnM6IFtOb0ZyYW1ld29ya0NvbXBvbmVudF0sXG4gIGV4cG9ydHM6IFtOb0ZyYW1ld29ya0NvbXBvbmVudF0sXG4gIHByb3ZpZGVyczogW0pzb25TY2hlbWFGb3JtU2VydmljZSwgRnJhbWV3b3JrTGlicmFyeVNlcnZpY2UsIFdpZGdldExpYnJhcnlTZXJ2aWNlLFxuICAgIHsgcHJvdmlkZTogRnJhbWV3b3JrLCB1c2VDbGFzczogTm9GcmFtZXdvcmssIG11bHRpOiB0cnVlIH1cbiAgXSxcbiAgZW50cnlDb21wb25lbnRzOiBbTm9GcmFtZXdvcmtDb21wb25lbnRdXG59KVxuZXhwb3J0IGNsYXNzIE5vRnJhbWV3b3JrTW9kdWxlIHsgfVxuIl19