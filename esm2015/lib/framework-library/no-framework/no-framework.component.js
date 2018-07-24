import * as tslib_1 from "tslib";
import { Component, Input } from '@angular/core';
let NoFrameworkComponent = class NoFrameworkComponent {
};
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], NoFrameworkComponent.prototype, "layoutNode", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], NoFrameworkComponent.prototype, "layoutIndex", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], NoFrameworkComponent.prototype, "dataIndex", void 0);
NoFrameworkComponent = tslib_1.__decorate([
    Component({
        selector: 'no-framework',
        template: `
    <select-widget-widget
      [dataIndex]="dataIndex"
      [layoutIndex]="layoutIndex"
      [layoutNode]="layoutNode"></select-widget-widget>`,
    })
], NoFrameworkComponent);
export { NoFrameworkComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8tZnJhbWV3b3JrLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvZnJhbWV3b3JrLWxpYnJhcnkvbm8tZnJhbWV3b3JrL25vLWZyYW1ld29yay5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBVWpELElBQWEsb0JBQW9CLEdBQWpDO0NBSUMsQ0FBQTtBQUhVO0lBQVIsS0FBSyxFQUFFOzt3REFBaUI7QUFDaEI7SUFBUixLQUFLLEVBQUU7O3lEQUF1QjtBQUN0QjtJQUFSLEtBQUssRUFBRTs7dURBQXFCO0FBSGxCLG9CQUFvQjtJQVJoQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsY0FBYztRQUN4QixRQUFRLEVBQUU7Ozs7d0RBSTRDO0tBQ3ZELENBQUM7R0FDVyxvQkFBb0IsQ0FJaEM7U0FKWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25vLWZyYW1ld29yaycsXG4gIHRlbXBsYXRlOiBgXG4gICAgPHNlbGVjdC13aWRnZXQtd2lkZ2V0XG4gICAgICBbZGF0YUluZGV4XT1cImRhdGFJbmRleFwiXG4gICAgICBbbGF5b3V0SW5kZXhdPVwibGF5b3V0SW5kZXhcIlxuICAgICAgW2xheW91dE5vZGVdPVwibGF5b3V0Tm9kZVwiPjwvc2VsZWN0LXdpZGdldC13aWRnZXQ+YCxcbn0pXG5leHBvcnQgY2xhc3MgTm9GcmFtZXdvcmtDb21wb25lbnQge1xuICBASW5wdXQoKSBsYXlvdXROb2RlOiBhbnk7XG4gIEBJbnB1dCgpIGxheW91dEluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgZGF0YUluZGV4OiBudW1iZXJbXTtcbn1cbiJdfQ==