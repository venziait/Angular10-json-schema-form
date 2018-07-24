import * as tslib_1 from "tslib";
import { Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '../../json-schema-form.service';
let MaterialTabsComponent = class MaterialTabsComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.selectedItem = 0;
        this.showAddTab = true;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.itemCount = this.layoutNode.items.length - 1;
        this.updateControl();
    }
    select(index) {
        if (this.layoutNode.items[index].type === '$ref') {
            this.jsf.addItem({
                layoutNode: this.layoutNode.items[index],
                layoutIndex: this.layoutIndex.concat(index),
                dataIndex: this.dataIndex.concat(index)
            });
            this.updateControl();
        }
        ;
        this.selectedItem = index;
    }
    updateControl() {
        this.itemCount = this.layoutNode.items.length - 1;
        const lastItem = this.layoutNode.items[this.layoutNode.items.length - 1];
        this.showAddTab = lastItem.type === '$ref' &&
            this.itemCount < (lastItem.options.maxItems || 1000);
    }
    setTabTitle(item, index) {
        return this.jsf.setArrayItemTitle(this, item, index);
    }
};
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], MaterialTabsComponent.prototype, "layoutNode", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], MaterialTabsComponent.prototype, "layoutIndex", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], MaterialTabsComponent.prototype, "dataIndex", void 0);
MaterialTabsComponent = tslib_1.__decorate([
    Component({
        selector: 'material-tabs-widget',
        template: `
    <nav mat-tab-nav-bar
      [attr.aria-label]="options?.label || options?.title || ''"
      [style.width]="'100%'">
        <a mat-tab-link *ngFor="let item of layoutNode?.items; let i = index"
          [active]="selectedItem === i"
          (click)="select(i)">
          <span *ngIf="showAddTab || item.type !== '$ref'"
            [innerHTML]="setTabTitle(item, i)"></span>
        </a>
    </nav>
    <div *ngFor="let layoutItem of layoutNode?.items; let i = index"
      [class]="options?.htmlClass || ''">
      <select-framework-widget *ngIf="selectedItem === i"
        [class]="(options?.fieldHtmlClass || '') + ' ' + (options?.activeClass || '') + ' ' + (options?.style?.selected || '')"
        [dataIndex]="layoutNode?.dataType === 'array' ? (dataIndex || []).concat(i) : dataIndex"
        [layoutIndex]="(layoutIndex || []).concat(i)"
        [layoutNode]="layoutItem"></select-framework-widget>
    </div>`,
        styles: [` a { cursor: pointer; } `],
    }),
    tslib_1.__metadata("design:paramtypes", [JsonSchemaFormService])
], MaterialTabsComponent);
export { MaterialTabsComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtdGFicy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL2ZyYW1ld29yay1saWJyYXJ5L21hdGVyaWFsLWRlc2lnbi1mcmFtZXdvcmsvbWF0ZXJpYWwtdGFicy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBRXpELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBeUJ2RSxJQUFhLHFCQUFxQixHQUFsQztJQVNFLFlBQ1UsR0FBMEI7UUFBMUIsUUFBRyxHQUFILEdBQUcsQ0FBdUI7UUFQcEMsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFDakIsZUFBVSxHQUFHLElBQUksQ0FBQztJQU9kLENBQUM7SUFFTCxRQUFRO1FBQ04sSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUs7UUFDVixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztnQkFDZixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO2dCQUN4QyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUMzQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2FBQ3hDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBQUEsQ0FBQztRQUNGLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBQzVCLENBQUM7SUFFRCxhQUFhO1FBQ1gsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEtBQUssTUFBTTtZQUN4QyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELFdBQVcsQ0FBQyxJQUFTLEVBQUUsS0FBYTtRQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FDRixDQUFBO0FBcENVO0lBQVIsS0FBSyxFQUFFOzt5REFBaUI7QUFDaEI7SUFBUixLQUFLLEVBQUU7OzBEQUF1QjtBQUN0QjtJQUFSLEtBQUssRUFBRTs7d0RBQXFCO0FBUGxCLHFCQUFxQjtJQXZCakMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLHNCQUFzQjtRQUNoQyxRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQWtCRDtRQUNULE1BQU0sRUFBRSxDQUFDLDBCQUEwQixDQUFDO0tBQ3JDLENBQUM7NkNBV2UscUJBQXFCO0dBVnpCLHFCQUFxQixDQXlDakM7U0F6Q1kscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtU2VydmljZSB9IGZyb20gJy4uLy4uL2pzb24tc2NoZW1hLWZvcm0uc2VydmljZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdGVyaWFsLXRhYnMtd2lkZ2V0JyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmF2IG1hdC10YWItbmF2LWJhclxuICAgICAgW2F0dHIuYXJpYS1sYWJlbF09XCJvcHRpb25zPy5sYWJlbCB8fCBvcHRpb25zPy50aXRsZSB8fCAnJ1wiXG4gICAgICBbc3R5bGUud2lkdGhdPVwiJzEwMCUnXCI+XG4gICAgICAgIDxhIG1hdC10YWItbGluayAqbmdGb3I9XCJsZXQgaXRlbSBvZiBsYXlvdXROb2RlPy5pdGVtczsgbGV0IGkgPSBpbmRleFwiXG4gICAgICAgICAgW2FjdGl2ZV09XCJzZWxlY3RlZEl0ZW0gPT09IGlcIlxuICAgICAgICAgIChjbGljayk9XCJzZWxlY3QoaSlcIj5cbiAgICAgICAgICA8c3BhbiAqbmdJZj1cInNob3dBZGRUYWIgfHwgaXRlbS50eXBlICE9PSAnJHJlZidcIlxuICAgICAgICAgICAgW2lubmVySFRNTF09XCJzZXRUYWJUaXRsZShpdGVtLCBpKVwiPjwvc3Bhbj5cbiAgICAgICAgPC9hPlxuICAgIDwvbmF2PlxuICAgIDxkaXYgKm5nRm9yPVwibGV0IGxheW91dEl0ZW0gb2YgbGF5b3V0Tm9kZT8uaXRlbXM7IGxldCBpID0gaW5kZXhcIlxuICAgICAgW2NsYXNzXT1cIm9wdGlvbnM/Lmh0bWxDbGFzcyB8fCAnJ1wiPlxuICAgICAgPHNlbGVjdC1mcmFtZXdvcmstd2lkZ2V0ICpuZ0lmPVwic2VsZWN0ZWRJdGVtID09PSBpXCJcbiAgICAgICAgW2NsYXNzXT1cIihvcHRpb25zPy5maWVsZEh0bWxDbGFzcyB8fCAnJykgKyAnICcgKyAob3B0aW9ucz8uYWN0aXZlQ2xhc3MgfHwgJycpICsgJyAnICsgKG9wdGlvbnM/LnN0eWxlPy5zZWxlY3RlZCB8fCAnJylcIlxuICAgICAgICBbZGF0YUluZGV4XT1cImxheW91dE5vZGU/LmRhdGFUeXBlID09PSAnYXJyYXknID8gKGRhdGFJbmRleCB8fCBbXSkuY29uY2F0KGkpIDogZGF0YUluZGV4XCJcbiAgICAgICAgW2xheW91dEluZGV4XT1cIihsYXlvdXRJbmRleCB8fCBbXSkuY29uY2F0KGkpXCJcbiAgICAgICAgW2xheW91dE5vZGVdPVwibGF5b3V0SXRlbVwiPjwvc2VsZWN0LWZyYW1ld29yay13aWRnZXQ+XG4gICAgPC9kaXY+YCxcbiAgc3R5bGVzOiBbYCBhIHsgY3Vyc29yOiBwb2ludGVyOyB9IGBdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbFRhYnNDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBvcHRpb25zOiBhbnk7XG4gIGl0ZW1Db3VudDogbnVtYmVyO1xuICBzZWxlY3RlZEl0ZW0gPSAwO1xuICBzaG93QWRkVGFiID0gdHJ1ZTtcbiAgQElucHV0KCkgbGF5b3V0Tm9kZTogYW55O1xuICBASW5wdXQoKSBsYXlvdXRJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGRhdGFJbmRleDogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZVxuICApIHsgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMub3B0aW9ucyA9IHRoaXMubGF5b3V0Tm9kZS5vcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuaXRlbUNvdW50ID0gdGhpcy5sYXlvdXROb2RlLml0ZW1zLmxlbmd0aCAtIDE7XG4gICAgdGhpcy51cGRhdGVDb250cm9sKCk7XG4gIH1cblxuICBzZWxlY3QoaW5kZXgpIHtcbiAgICBpZiAodGhpcy5sYXlvdXROb2RlLml0ZW1zW2luZGV4XS50eXBlID09PSAnJHJlZicpIHtcbiAgICAgIHRoaXMuanNmLmFkZEl0ZW0oe1xuICAgICAgICBsYXlvdXROb2RlOiB0aGlzLmxheW91dE5vZGUuaXRlbXNbaW5kZXhdLFxuICAgICAgICBsYXlvdXRJbmRleDogdGhpcy5sYXlvdXRJbmRleC5jb25jYXQoaW5kZXgpLFxuICAgICAgICBkYXRhSW5kZXg6IHRoaXMuZGF0YUluZGV4LmNvbmNhdChpbmRleClcbiAgICAgIH0pO1xuICAgICAgdGhpcy51cGRhdGVDb250cm9sKCk7XG4gICAgfTtcbiAgICB0aGlzLnNlbGVjdGVkSXRlbSA9IGluZGV4O1xuICB9XG5cbiAgdXBkYXRlQ29udHJvbCgpIHtcbiAgICB0aGlzLml0ZW1Db3VudCA9IHRoaXMubGF5b3V0Tm9kZS5pdGVtcy5sZW5ndGggLSAxO1xuICAgIGNvbnN0IGxhc3RJdGVtID0gdGhpcy5sYXlvdXROb2RlLml0ZW1zW3RoaXMubGF5b3V0Tm9kZS5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICB0aGlzLnNob3dBZGRUYWIgPSBsYXN0SXRlbS50eXBlID09PSAnJHJlZicgJiZcbiAgICAgIHRoaXMuaXRlbUNvdW50IDwgKGxhc3RJdGVtLm9wdGlvbnMubWF4SXRlbXMgfHwgMTAwMCk7XG4gIH1cblxuICBzZXRUYWJUaXRsZShpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmpzZi5zZXRBcnJheUl0ZW1UaXRsZSh0aGlzLCBpdGVtLCBpbmRleCk7XG4gIH1cbn1cbiJdfQ==