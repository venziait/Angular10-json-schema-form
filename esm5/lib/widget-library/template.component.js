import * as tslib_1 from "tslib";
import { Component, ComponentFactoryResolver, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
var TemplateComponent = /** @class */ (function () {
    function TemplateComponent(componentFactory, jsf) {
        this.componentFactory = componentFactory;
        this.jsf = jsf;
        this.newComponent = null;
    }
    TemplateComponent.prototype.ngOnInit = function () {
        this.updateComponent();
    };
    TemplateComponent.prototype.ngOnChanges = function () {
        this.updateComponent();
    };
    TemplateComponent.prototype.updateComponent = function () {
        if (!this.newComponent && this.layoutNode.options.template) {
            this.newComponent = this.widgetContainer.createComponent(this.componentFactory.resolveComponentFactory(this.layoutNode.options.template));
        }
        if (this.newComponent) {
            try {
                for (var _a = tslib_1.__values(['layoutNode', 'layoutIndex', 'dataIndex']), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var input = _b.value;
                    this.newComponent.instance[input] = this[input];
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        var e_1, _c;
    };
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], TemplateComponent.prototype, "layoutNode", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], TemplateComponent.prototype, "layoutIndex", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], TemplateComponent.prototype, "dataIndex", void 0);
    tslib_1.__decorate([
        ViewChild('widgetContainer', { read: ViewContainerRef }),
        tslib_1.__metadata("design:type", ViewContainerRef)
    ], TemplateComponent.prototype, "widgetContainer", void 0);
    TemplateComponent = tslib_1.__decorate([
        Component({
            selector: 'template-widget',
            template: "<div #widgetContainer></div>",
        }),
        tslib_1.__metadata("design:paramtypes", [ComponentFactoryResolver,
            JsonSchemaFormService])
    ], TemplateComponent);
    return TemplateComponent;
}());
export { TemplateComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjYtanNvbi1zY2hlbWEtZm9ybS8iLCJzb3VyY2VzIjpbImxpYi93aWRnZXQtbGlicmFyeS90ZW1wbGF0ZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQUUsd0JBQXdCLEVBQWdCLEtBQUssRUFDckMsU0FBUyxFQUFFLGdCQUFnQixFQUMvQyxNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQU1wRTtJQVFFLDJCQUNVLGdCQUEwQyxFQUMxQyxHQUEwQjtRQUQxQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTBCO1FBQzFDLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBVHBDLGlCQUFZLEdBQXNCLElBQUksQ0FBQztJQVVuQyxDQUFDO0lBRUwsb0NBQVEsR0FBUjtRQUNFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsdUNBQVcsR0FBWDtRQUNFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsMkNBQWUsR0FBZjtRQUNFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQ3RELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FDaEYsQ0FBQztRQUNKLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzs7Z0JBQ3RCLEdBQUcsQ0FBQyxDQUFjLElBQUEsS0FBQSxpQkFBQSxDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUEsZ0JBQUE7b0JBQXZELElBQUksS0FBSyxXQUFBO29CQUNaLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDakQ7Ozs7Ozs7OztRQUNILENBQUM7O0lBQ0gsQ0FBQztJQTlCUTtRQUFSLEtBQUssRUFBRTs7eURBQWlCO0lBQ2hCO1FBQVIsS0FBSyxFQUFFOzswREFBdUI7SUFDdEI7UUFBUixLQUFLLEVBQUU7O3dEQUFxQjtJQUUzQjtRQURELFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDOzBDQUN0QyxnQkFBZ0I7OERBQUM7SUFOekIsaUJBQWlCO1FBSjdCLFNBQVMsQ0FBQztZQUNULFFBQVEsRUFBRSxpQkFBaUI7WUFDM0IsUUFBUSxFQUFFLDhCQUE4QjtTQUN6QyxDQUFDO2lEQVU0Qix3QkFBd0I7WUFDckMscUJBQXFCO09BVnpCLGlCQUFpQixDQWlDN0I7SUFBRCx3QkFBQztDQUFBLEFBakNELElBaUNDO1NBakNZLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBDb21wb25lbnRSZWYsIElucHV0LFxuICBPbkNoYW5nZXMsIE9uSW5pdCwgVmlld0NoaWxkLCBWaWV3Q29udGFpbmVyUmVmXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgfSBmcm9tICcuLi9qc29uLXNjaGVtYS1mb3JtLnNlcnZpY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICd0ZW1wbGF0ZS13aWRnZXQnLFxuICB0ZW1wbGF0ZTogYDxkaXYgI3dpZGdldENvbnRhaW5lcj48L2Rpdj5gLFxufSlcbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcbiAgbmV3Q29tcG9uZW50OiBDb21wb25lbnRSZWY8YW55PiA9IG51bGw7XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuICBAVmlld0NoaWxkKCd3aWRnZXRDb250YWluZXInLCB7IHJlYWQ6IFZpZXdDb250YWluZXJSZWYgfSlcbiAgICB3aWRnZXRDb250YWluZXI6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgcHJpdmF0ZSBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZVxuICApIHsgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMudXBkYXRlQ29tcG9uZW50KCk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcygpIHtcbiAgICB0aGlzLnVwZGF0ZUNvbXBvbmVudCgpO1xuICB9XG5cbiAgdXBkYXRlQ29tcG9uZW50KCkge1xuICAgIGlmICghdGhpcy5uZXdDb21wb25lbnQgJiYgdGhpcy5sYXlvdXROb2RlLm9wdGlvbnMudGVtcGxhdGUpIHtcbiAgICAgIHRoaXMubmV3Q29tcG9uZW50ID0gdGhpcy53aWRnZXRDb250YWluZXIuY3JlYXRlQ29tcG9uZW50KFxuICAgICAgICB0aGlzLmNvbXBvbmVudEZhY3RvcnkucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkodGhpcy5sYXlvdXROb2RlLm9wdGlvbnMudGVtcGxhdGUpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy5uZXdDb21wb25lbnQpIHtcbiAgICAgIGZvciAobGV0IGlucHV0IG9mIFsnbGF5b3V0Tm9kZScsICdsYXlvdXRJbmRleCcsICdkYXRhSW5kZXgnXSkge1xuICAgICAgICB0aGlzLm5ld0NvbXBvbmVudC5pbnN0YW5jZVtpbnB1dF0gPSB0aGlzW2lucHV0XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==