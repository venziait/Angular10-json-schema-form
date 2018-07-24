import * as tslib_1 from "tslib";
import { Directive, ElementRef, Input, NgZone } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
/**
 * OrderableDirective
 *
 * Enables array elements to be reordered by dragging and dropping.
 *
 * Only works for arrays that have at least two elements.
 *
 * Also detects arrays-within-arrays, and correctly moves either
 * the child array element or the parent array element,
 * depending on the drop targert.
 *
 * Listeners for movable element being dragged:
 * - dragstart: add 'dragging' class to element, set effectAllowed = 'move'
 * - dragover: set dropEffect = 'move'
 * - dragend: remove 'dragging' class from element
 *
 * Listeners for stationary items being dragged over:
 * - dragenter: add 'drag-target-...' classes to element
 * - dragleave: remove 'drag-target-...' classes from element
 * - drop: remove 'drag-target-...' classes from element, move dropped array item
 */
let OrderableDirective = class OrderableDirective {
    constructor(elementRef, jsf, ngZone) {
        this.elementRef = elementRef;
        this.jsf = jsf;
        this.ngZone = ngZone;
        this.overParentElement = false;
        this.overChildElement = false;
    }
    ngOnInit() {
        if (this.orderable && this.layoutNode && this.layoutIndex && this.dataIndex) {
            this.element = this.elementRef.nativeElement;
            this.element.draggable = true;
            this.arrayLayoutIndex = 'move:' + this.layoutIndex.slice(0, -1).toString();
            this.ngZone.runOutsideAngular(() => {
                // Listeners for movable element being dragged:
                this.element.addEventListener('dragstart', (event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    // Hack to bypass stupid HTML drag-and-drop dataTransfer protection
                    // so drag source info will be available on dragenter
                    const sourceArrayIndex = this.dataIndex[this.dataIndex.length - 1];
                    sessionStorage.setItem(this.arrayLayoutIndex, sourceArrayIndex + '');
                });
                this.element.addEventListener('dragover', (event) => {
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                    event.dataTransfer.dropEffect = 'move';
                    return false;
                });
                // Listeners for stationary items being dragged over:
                this.element.addEventListener('dragenter', (event) => {
                    // Part 1 of a hack, inspired by Dragster, to simulate mouseover and mouseout
                    // behavior while dragging items - http://bensmithett.github.io/dragster/
                    if (this.overParentElement) {
                        return this.overChildElement = true;
                    }
                    else {
                        this.overParentElement = true;
                    }
                    const sourceArrayIndex = sessionStorage.getItem(this.arrayLayoutIndex);
                    if (sourceArrayIndex !== null) {
                        if (this.dataIndex[this.dataIndex.length - 1] < +sourceArrayIndex) {
                            this.element.classList.add('drag-target-top');
                        }
                        else if (this.dataIndex[this.dataIndex.length - 1] > +sourceArrayIndex) {
                            this.element.classList.add('drag-target-bottom');
                        }
                    }
                });
                this.element.addEventListener('dragleave', (event) => {
                    // Part 2 of the Dragster hack
                    if (this.overChildElement) {
                        this.overChildElement = false;
                    }
                    else if (this.overParentElement) {
                        this.overParentElement = false;
                    }
                    const sourceArrayIndex = sessionStorage.getItem(this.arrayLayoutIndex);
                    if (!this.overParentElement && !this.overChildElement && sourceArrayIndex !== null) {
                        this.element.classList.remove('drag-target-top');
                        this.element.classList.remove('drag-target-bottom');
                    }
                });
                this.element.addEventListener('drop', (event) => {
                    this.element.classList.remove('drag-target-top');
                    this.element.classList.remove('drag-target-bottom');
                    // Confirm that drop target is another item in the same array as source item
                    const sourceArrayIndex = sessionStorage.getItem(this.arrayLayoutIndex);
                    const destArrayIndex = this.dataIndex[this.dataIndex.length - 1];
                    if (sourceArrayIndex !== null && +sourceArrayIndex !== destArrayIndex) {
                        // Move array item
                        this.jsf.moveArrayItem(this, +sourceArrayIndex, destArrayIndex);
                    }
                    sessionStorage.removeItem(this.arrayLayoutIndex);
                    return false;
                });
            });
        }
    }
};
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], OrderableDirective.prototype, "orderable", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], OrderableDirective.prototype, "layoutNode", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], OrderableDirective.prototype, "layoutIndex", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], OrderableDirective.prototype, "dataIndex", void 0);
OrderableDirective = tslib_1.__decorate([
    Directive({
        selector: '[orderable]',
    }),
    tslib_1.__metadata("design:paramtypes", [ElementRef,
        JsonSchemaFormService,
        NgZone])
], OrderableDirective);
export { OrderableDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXJhYmxlLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvd2lkZ2V0LWxpYnJhcnkvb3JkZXJhYmxlLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUM3RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUdwRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFJSCxJQUFhLGtCQUFrQixHQUEvQjtJQVVFLFlBQ1UsVUFBc0IsRUFDdEIsR0FBMEIsRUFDMUIsTUFBYztRQUZkLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsUUFBRyxHQUFILEdBQUcsQ0FBdUI7UUFDMUIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQVZ4QixzQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFDMUIscUJBQWdCLEdBQUcsS0FBSyxDQUFDO0lBVXJCLENBQUM7SUFFTCxRQUFRO1FBQ04sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztZQUM3QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDOUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUUzRSxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdB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QUNqRCxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUNmLENBQUMsQ0FBQyxDQUFDO1lBRUwsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUE7QUF4RlU7SUFBUixLQUFLLEVBQUU7O3FEQUFvQjtBQUNuQjtJQUFSLEtBQUssRUFBRTs7c0RBQWlCO0FBQ2hCO0lBQVIsS0FBSyxFQUFFOzt1REFBdUI7QUFDdEI7SUFBUixLQUFLLEVBQUU7O3FEQUFxQjtBQVJsQixrQkFBa0I7SUFIOUIsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7S0FDeEIsQ0FBQzs2Q0FZc0IsVUFBVTtRQUNqQixxQkFBcUI7UUFDbEIsTUFBTTtHQWJiLGtCQUFrQixDQTZGOUI7U0E3Rlksa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbnB1dCwgTmdab25lLCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtU2VydmljZSB9IGZyb20gJy4uL2pzb24tc2NoZW1hLWZvcm0uc2VydmljZSc7XG5cblxuLyoqXG4gKiBPcmRlcmFibGVEaXJlY3RpdmVcbiAqXG4gKiBFbmFibGVzIGFycmF5IGVsZW1lbnRzIHRvIGJlIHJlb3JkZXJlZCBieSBkcmFnZ2luZyBhbmQgZHJvcHBpbmcuXG4gKlxuICogT25seSB3b3JrcyBmb3IgYXJyYXlzIHRoYXQgaGF2ZSBhdCBsZWFzdCB0d28gZWxlbWVudHMuXG4gKlxuICogQWxzbyBkZXRlY3RzIGFycmF5cy13aXRoaW4tYXJyYXlzLCBhbmQgY29ycmVjdGx5IG1vdmVzIGVpdGhlclxuICogdGhlIGNoaWxkIGFycmF5IGVsZW1lbnQgb3IgdGhlIHBhcmVudCBhcnJheSBlbGVtZW50LFxuICogZGVwZW5kaW5nIG9uIHRoZSBkcm9wIHRhcmdlcnQuXG4gKlxuICogTGlzdGVuZXJzIGZvciBtb3ZhYmxlIGVsZW1lbnQgYmVpbmcgZHJhZ2dlZDpcbiAqIC0gZHJhZ3N0YXJ0OiBhZGQgJ2RyYWdnaW5nJyBjbGFzcyB0byBlbGVtZW50LCBzZXQgZWZmZWN0QWxsb3dlZCA9ICdtb3ZlJ1xuICogLSBkcmFnb3Zlcjogc2V0IGRyb3BFZmZlY3QgPSAnbW92ZSdcbiAqIC0gZHJhZ2VuZDogcmVtb3ZlICdkcmFnZ2luZycgY2xhc3MgZnJvbSBlbGVtZW50XG4gKlxuICogTGlzdGVuZXJzIGZvciBzdGF0aW9uYXJ5IGl0ZW1zIGJlaW5nIGRyYWdnZWQgb3ZlcjpcbiAqIC0gZHJhZ2VudGVyOiBhZGQgJ2RyYWctdGFyZ2V0LS4uLicgY2xhc3NlcyB0byBlbGVtZW50XG4gKiAtIGRyYWdsZWF2ZTogcmVtb3ZlICdkcmFnLXRhcmdldC0uLi4nIGNsYXNzZXMgZnJvbSBlbGVtZW50XG4gKiAtIGRyb3A6IHJlbW92ZSAnZHJhZy10YXJnZXQtLi4uJyBjbGFzc2VzIGZyb20gZWxlbWVudCwgbW92ZSBkcm9wcGVkIGFycmF5IGl0ZW1cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW29yZGVyYWJsZV0nLFxufSlcbmV4cG9ydCBjbGFzcyBPcmRlcmFibGVEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQge1xuICBhcnJheUxheW91dEluZGV4OiBzdHJpbmc7XG4gIGVsZW1lbnQ6IGFueTtcbiAgb3ZlclBhcmVudEVsZW1lbnQgPSBmYWxzZTtcbiAgb3ZlckNoaWxkRWxlbWVudCA9IGZhbHNlO1xuICBASW5wdXQoKSBvcmRlcmFibGU6IGJvb2xlYW47XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICBwcml2YXRlIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlLFxuICAgIHByaXZhdGUgbmdab25lOiBOZ1pvbmVcbiAgKSB7IH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICBpZiAodGhpcy5vcmRlcmFibGUgJiYgdGhpcy5sYXlvdXROb2RlICYmIHRoaXMubGF5b3V0SW5kZXggJiYgdGhpcy5kYXRhSW5kZXgpIHtcbiAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgdGhpcy5lbGVtZW50LmRyYWdnYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmFycmF5TGF5b3V0SW5kZXggPSAnbW92ZTonICsgdGhpcy5sYXlvdXRJbmRleC5zbGljZSgwLCAtMSkudG9TdHJpbmcoKTtcblxuICAgICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuXG4gICAgICAgIC8vIExpc3RlbmVycyBmb3IgbW92YWJsZSBlbGVtZW50IGJlaW5nIGRyYWdnZWQ6XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIChldmVudCkgPT4ge1xuICAgICAgICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gJ21vdmUnO1xuICAgICAgICAgIC8vIEhhY2sgdG8gYnlwYXNzIHN0dXBpZCBIVE1MIGRyYWctYW5kLWRyb3AgZGF0YVRyYW5zZmVyIHByb3RlY3Rpb25cbiAgICAgICAgICAvLyBzbyBkcmFnIHNvdXJjZSBpbmZvIHdpbGwgYmUgYXZhaWxhYmxlIG9uIGRyYWdlbnRlclxuICAgICAgICAgIGNvbnN0IHNvdXJjZUFycmF5SW5kZXggPSB0aGlzLmRhdGFJbmRleFt0aGlzLmRhdGFJbmRleC5sZW5ndGggLSAxXTtcbiAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKHRoaXMuYXJyYXlMYXlvdXRJbmRleCwgc291cmNlQXJyYXlJbmRleCArICcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKGV2ZW50LnByZXZlbnREZWZhdWx0KSB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IH1cbiAgICAgICAgICBldmVudC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJztcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIExpc3RlbmVycyBmb3Igc3RhdGlvbmFyeSBpdGVtcyBiZWluZyBkcmFnZ2VkIG92ZXI6XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIChldmVudCkgPT4ge1xuICAgICAgICAgIC8vIFBhcnQgMSBvZiBhIGhhY2ssIGluc3BpcmVkIGJ5IERyYWdzdGVyLCB0byBzaW11bGF0ZSBtb3VzZW92ZXIgYW5kIG1vdXNlb3V0XG4gICAgICAgICAgLy8gYmVoYXZpb3Igd2hpbGUgZHJhZ2dpbmcgaXRlbXMgLSBodHRwOi8vYmVuc21pdGhldHQuZ2l0aHViLmlvL2RyYWdzdGVyL1xuICAgICAgICAgIGlmICh0aGlzLm92ZXJQYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vdmVyQ2hpbGRFbGVtZW50ID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vdmVyUGFyZW50RWxlbWVudCA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgc291cmNlQXJyYXlJbmRleCA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0odGhpcy5hcnJheUxheW91dEluZGV4KTtcbiAgICAgICAgICBpZiAoc291cmNlQXJyYXlJbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YUluZGV4W3RoaXMuZGF0YUluZGV4Lmxlbmd0aCAtIDFdIDwgK3NvdXJjZUFycmF5SW5kZXgpIHtcbiAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2RyYWctdGFyZ2V0LXRvcCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRhdGFJbmRleFt0aGlzLmRhdGFJbmRleC5sZW5ndGggLSAxXSA+ICtzb3VyY2VBcnJheUluZGV4KSB7XG4gICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdkcmFnLXRhcmdldC1ib3R0b20nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnbGVhdmUnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAvLyBQYXJ0IDIgb2YgdGhlIERyYWdzdGVyIGhhY2tcbiAgICAgICAgICBpZiAodGhpcy5vdmVyQ2hpbGRFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLm92ZXJDaGlsZEVsZW1lbnQgPSBmYWxzZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3ZlclBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMub3ZlclBhcmVudEVsZW1lbnQgPSBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBzb3VyY2VBcnJheUluZGV4ID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmFycmF5TGF5b3V0SW5kZXgpO1xuICAgICAgICAgIGlmICghdGhpcy5vdmVyUGFyZW50RWxlbWVudCAmJiAhdGhpcy5vdmVyQ2hpbGRFbGVtZW50ICYmIHNvdXJjZUFycmF5SW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnLXRhcmdldC10b3AnKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnLXRhcmdldC1ib3R0b20nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWctdGFyZ2V0LXRvcCcpO1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnLXRhcmdldC1ib3R0b20nKTtcbiAgICAgICAgICAvLyBDb25maXJtIHRoYXQgZHJvcCB0YXJnZXQgaXMgYW5vdGhlciBpdGVtIGluIHRoZSBzYW1lIGFycmF5IGFzIHNvdXJjZSBpdGVtXG4gICAgICAgICAgY29uc3Qgc291cmNlQXJyYXlJbmRleCA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0odGhpcy5hcnJheUxheW91dEluZGV4KTtcbiAgICAgICAgICBjb25zdCBkZXN0QXJyYXlJbmRleCA9IHRoaXMuZGF0YUluZGV4W3RoaXMuZGF0YUluZGV4Lmxlbmd0aCAtIDFdO1xuICAgICAgICAgIGlmIChzb3VyY2VBcnJheUluZGV4ICE9PSBudWxsICYmICtzb3VyY2VBcnJheUluZGV4ICE9PSBkZXN0QXJyYXlJbmRleCkge1xuICAgICAgICAgICAgLy8gTW92ZSBhcnJheSBpdGVtXG4gICAgICAgICAgICB0aGlzLmpzZi5tb3ZlQXJyYXlJdGVtKHRoaXMsICtzb3VyY2VBcnJheUluZGV4LCBkZXN0QXJyYXlJbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5hcnJheUxheW91dEluZGV4KTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==