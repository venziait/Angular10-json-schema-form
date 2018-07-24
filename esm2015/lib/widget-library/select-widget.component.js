import * as tslib_1 from "tslib";
import { Component, ComponentFactoryResolver, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
let SelectWidgetComponent = class SelectWidgetComponent {
    constructor(componentFactory, jsf) {
        this.componentFactory = componentFactory;
        this.jsf = jsf;
        this.newComponent = null;
    }
    ngOnInit() {
        this.updateComponent();
    }
    ngOnChanges() {
        this.updateComponent();
    }
    updateComponent() {
        if (!this.newComponent && (this.layoutNode || {}).widget) {
            this.newComponent = this.widgetContainer.createComponent(this.componentFactory.resolveComponentFactory(this.layoutNode.widget));
        }
        if (this.newComponent) {
            for (let input of ['layoutNode', 'layoutIndex', 'dataIndex']) {
                this.newComponent.instance[input] = this[input];
            }
        }
    }
};
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], SelectWidgetComponent.prototype, "layoutNode", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], SelectWidgetComponent.prototype, "layoutIndex", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], SelectWidgetComponent.prototype, "dataIndex", void 0);
tslib_1.__decorate([
    ViewChild('widgetContainer', { read: ViewContainerRef }),
    tslib_1.__metadata("design:type", ViewContainerRef)
], SelectWidgetComponent.prototype, "widgetContainer", void 0);
SelectWidgetComponent = tslib_1.__decorate([
    Component({
        selector: 'select-widget-widget',
        template: `<div #widgetContainer></div>`,
    }),
    tslib_1.__metadata("design:paramtypes", [ComponentFactoryResolver,
        JsonSchemaFormService])
], SelectWidgetComponent);
export { SelectWidgetComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LXdpZGdldC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL3dpZGdldC1saWJyYXJ5L3NlbGVjdC13aWRnZXQuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUFFLHdCQUF3QixFQUFnQixLQUFLLEVBQ3JDLFNBQVMsRUFBRSxnQkFBZ0IsRUFDL0MsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFNcEUsSUFBYSxxQkFBcUIsR0FBbEM7SUFRRSxZQUNVLGdCQUEwQyxFQUMxQyxHQUEwQjtRQUQxQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTBCO1FBQzFDLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBVHBDLGlCQUFZLEdBQXNCLElBQUksQ0FBQztJQVVuQyxDQUFDO0lBRUwsUUFBUTtRQUNOLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsZUFBZTtRQUNiLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUN0RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FDdEUsQ0FBQztRQUNKLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUN0QixHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0NBQ0YsQ0FBQTtBQS9CVTtJQUFSLEtBQUssRUFBRTs7eURBQWlCO0FBQ2hCO0lBQVIsS0FBSyxFQUFFOzswREFBdUI7QUFDdEI7SUFBUixLQUFLLEVBQUU7O3dEQUFxQjtBQUUzQjtJQURELFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDO3NDQUN0QyxnQkFBZ0I7OERBQUM7QUFOekIscUJBQXFCO0lBSmpDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxzQkFBc0I7UUFDaEMsUUFBUSxFQUFFLDhCQUE4QjtLQUN6QyxDQUFDOzZDQVU0Qix3QkFBd0I7UUFDckMscUJBQXFCO0dBVnpCLHFCQUFxQixDQWlDakM7U0FqQ1kscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIENvbXBvbmVudFJlZiwgSW5wdXQsXG4gIE9uQ2hhbmdlcywgT25Jbml0LCBWaWV3Q2hpbGQsIFZpZXdDb250YWluZXJSZWZcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtU2VydmljZSB9IGZyb20gJy4uL2pzb24tc2NoZW1hLWZvcm0uc2VydmljZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3NlbGVjdC13aWRnZXQtd2lkZ2V0JyxcbiAgdGVtcGxhdGU6IGA8ZGl2ICN3aWRnZXRDb250YWluZXI+PC9kaXY+YCxcbn0pXG5leHBvcnQgY2xhc3MgU2VsZWN0V2lkZ2V0Q29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkluaXQge1xuICBuZXdDb21wb25lbnQ6IENvbXBvbmVudFJlZjxhbnk+ID0gbnVsbDtcbiAgQElucHV0KCkgbGF5b3V0Tm9kZTogYW55O1xuICBASW5wdXQoKSBsYXlvdXRJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGRhdGFJbmRleDogbnVtYmVyW107XG4gIEBWaWV3Q2hpbGQoJ3dpZGdldENvbnRhaW5lcicsIHsgcmVhZDogVmlld0NvbnRhaW5lclJlZiB9KVxuICAgIHdpZGdldENvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICBwcml2YXRlIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlXG4gICkgeyB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy51cGRhdGVDb21wb25lbnQoKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKCkge1xuICAgIHRoaXMudXBkYXRlQ29tcG9uZW50KCk7XG4gIH1cblxuICB1cGRhdGVDb21wb25lbnQoKSB7XG4gICAgaWYgKCF0aGlzLm5ld0NvbXBvbmVudCAmJiAodGhpcy5sYXlvdXROb2RlIHx8IHt9KS53aWRnZXQpIHtcbiAgICAgIHRoaXMubmV3Q29tcG9uZW50ID0gdGhpcy53aWRnZXRDb250YWluZXIuY3JlYXRlQ29tcG9uZW50KFxuICAgICAgICB0aGlzLmNvbXBvbmVudEZhY3RvcnkucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkodGhpcy5sYXlvdXROb2RlLndpZGdldClcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0aGlzLm5ld0NvbXBvbmVudCkge1xuICAgICAgZm9yIChsZXQgaW5wdXQgb2YgWydsYXlvdXROb2RlJywgJ2xheW91dEluZGV4JywgJ2RhdGFJbmRleCddKSB7XG4gICAgICAgIHRoaXMubmV3Q29tcG9uZW50Lmluc3RhbmNlW2lucHV0XSA9IHRoaXNbaW5wdXRdO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19