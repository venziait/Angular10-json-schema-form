import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonSchemaFormService } from '../json-schema-form.service';
import { BASIC_WIDGETS } from './index';
import { OrderableDirective } from './orderable.directive';
var WidgetLibraryModule = /** @class */ (function () {
    function WidgetLibraryModule() {
    }
    WidgetLibraryModule_1 = WidgetLibraryModule;
    WidgetLibraryModule.forRoot = function () {
        return {
            ngModule: WidgetLibraryModule_1,
            providers: [JsonSchemaFormService]
        };
    };
    WidgetLibraryModule = WidgetLibraryModule_1 = tslib_1.__decorate([
        NgModule({
            imports: [CommonModule, FormsModule, ReactiveFormsModule],
            declarations: tslib_1.__spread(BASIC_WIDGETS, [OrderableDirective]),
            exports: tslib_1.__spread(BASIC_WIDGETS, [OrderableDirective]),
            entryComponents: tslib_1.__spread(BASIC_WIDGETS),
            providers: [JsonSchemaFormService]
        })
    ], WidgetLibraryModule);
    return WidgetLibraryModule;
    var WidgetLibraryModule_1;
}());
export { WidgetLibraryModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0LWxpYnJhcnkubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjYtanNvbi1zY2hlbWEtZm9ybS8iLCJzb3VyY2VzIjpbImxpYi93aWRnZXQtbGlicmFyeS93aWRnZXQtbGlicmFyeS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQXVCLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFbEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFcEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUN4QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQVMzRDtJQUFBO0lBT0EsQ0FBQzs0QkFQWSxtQkFBbUI7SUFDdkIsMkJBQU8sR0FBZDtRQUNFLE1BQU0sQ0FBQztZQUNMLFFBQVEsRUFBRSxxQkFBbUI7WUFDN0IsU0FBUyxFQUFFLENBQUUscUJBQXFCLENBQUU7U0FDckMsQ0FBQztJQUNKLENBQUM7SUFOVSxtQkFBbUI7UUFQL0IsUUFBUSxDQUFDO1lBQ1IsT0FBTyxFQUFVLENBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsQ0FBRTtZQUNuRSxZQUFZLG1CQUFVLGFBQWEsR0FBRSxrQkFBa0IsRUFBRTtZQUN6RCxPQUFPLG1CQUFlLGFBQWEsR0FBRSxrQkFBa0IsRUFBRTtZQUN6RCxlQUFlLG1CQUFPLGFBQWEsQ0FBRTtZQUNyQyxTQUFTLEVBQVEsQ0FBRSxxQkFBcUIsQ0FBRTtTQUMzQyxDQUFDO09BQ1csbUJBQW1CLENBTy9CO0lBQUQsMEJBQUM7O0NBQUEsQUFQRCxJQU9DO1NBUFksbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUsIE1vZHVsZVdpdGhQcm92aWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnLi4vanNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlJztcblxuaW1wb3J0IHsgQkFTSUNfV0lER0VUUyB9IGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0IHsgT3JkZXJhYmxlRGlyZWN0aXZlIH0gZnJvbSAnLi9vcmRlcmFibGUuZGlyZWN0aXZlJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogICAgICAgICBbIENvbW1vbk1vZHVsZSwgRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGUgXSxcbiAgZGVjbGFyYXRpb25zOiAgICBbIC4uLkJBU0lDX1dJREdFVFMsIE9yZGVyYWJsZURpcmVjdGl2ZSBdLFxuICBleHBvcnRzOiAgICAgICAgIFsgLi4uQkFTSUNfV0lER0VUUywgT3JkZXJhYmxlRGlyZWN0aXZlIF0sXG4gIGVudHJ5Q29tcG9uZW50czogWyAuLi5CQVNJQ19XSURHRVRTIF0sXG4gIHByb3ZpZGVyczogICAgICAgWyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgXVxufSlcbmV4cG9ydCBjbGFzcyBXaWRnZXRMaWJyYXJ5TW9kdWxlIHtcbiAgc3RhdGljIGZvclJvb3QoKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBXaWRnZXRMaWJyYXJ5TW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbIEpzb25TY2hlbWFGb3JtU2VydmljZSBdXG4gICAgfTtcbiAgfVxufVxuIl19