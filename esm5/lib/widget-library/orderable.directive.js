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
var OrderableDirective = /** @class */ (function () {
    function OrderableDirective(elementRef, jsf, ngZone) {
        this.elementRef = elementRef;
        this.jsf = jsf;
        this.ngZone = ngZone;
        this.overParentElement = false;
        this.overChildElement = false;
    }
    OrderableDirective.prototype.ngOnInit = function () {
        var _this = this;
        if (this.orderable && this.layoutNode && this.layoutIndex && this.dataIndex) {
            this.element = this.elementRef.nativeElement;
            this.element.draggable = true;
            this.arrayLayoutIndex = 'move:' + this.layoutIndex.slice(0, -1).toString();
            this.ngZone.runOutsideAngular(function () {
                // Listeners for movable element being dragged:
                _this.element.addEventListener('dragstart', function (event) {
                    event.dataTransfer.effectAllowed = 'move';
                    // Hack to bypass stupid HTML drag-and-drop dataTransfer protection
                    // so drag source info will be available on dragenter
                    var sourceArrayIndex = _this.dataIndex[_this.dataIndex.length - 1];
                    sessionStorage.setItem(_this.arrayLayoutIndex, sourceArrayIndex + '');
                });
                _this.element.addEventListener('dragover', function (event) {
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                    event.dataTransfer.dropEffect = 'move';
                    return false;
                });
                // Listeners for stationary items being dragged over:
                _this.element.addEventListener('dragenter', function (event) {
                    // Part 1 of a hack, inspired by Dragster, to simulate mouseover and mouseout
                    // behavior while dragging items - http://bensmithett.github.io/dragster/
                    if (_this.overParentElement) {
                        return _this.overChildElement = true;
                    }
                    else {
                        _this.overParentElement = true;
                    }
                    var sourceArrayIndex = sessionStorage.getItem(_this.arrayLayoutIndex);
                    if (sourceArrayIndex !== null) {
                        if (_this.dataIndex[_this.dataIndex.length - 1] < +sourceArrayIndex) {
                            _this.element.classList.add('drag-target-top');
                        }
                        else if (_this.dataIndex[_this.dataIndex.length - 1] > +sourceArrayIndex) {
                            _this.element.classList.add('drag-target-bottom');
                        }
                    }
                });
                _this.element.addEventListener('dragleave', function (event) {
                    // Part 2 of the Dragster hack
                    if (_this.overChildElement) {
                        _this.overChildElement = false;
                    }
                    else if (_this.overParentElement) {
                        _this.overParentElement = false;
                    }
                    var sourceArrayIndex = sessionStorage.getItem(_this.arrayLayoutIndex);
                    if (!_this.overParentElement && !_this.overChildElement && sourceArrayIndex !== null) {
                        _this.element.classList.remove('drag-target-top');
                        _this.element.classList.remove('drag-target-bottom');
                    }
                });
                _this.element.addEventListener('drop', function (event) {
                    _this.element.classList.remove('drag-target-top');
                    _this.element.classList.remove('drag-target-bottom');
                    // Confirm that drop target is another item in the same array as source item
                    var sourceArrayIndex = sessionStorage.getItem(_this.arrayLayoutIndex);
                    var destArrayIndex = _this.dataIndex[_this.dataIndex.length - 1];
                    if (sourceArrayIndex !== null && +sourceArrayIndex !== destArrayIndex) {
                        // Move array item
                        _this.jsf.moveArrayItem(_this, +sourceArrayIndex, destArrayIndex);
                    }
                    sessionStorage.removeItem(_this.arrayLayoutIndex);
                    return false;
                });
            });
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
    return OrderableDirective;
}());
export { OrderableDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXJhYmxlLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvd2lkZ2V0LWxpYnJhcnkvb3JkZXJhYmxlLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUM3RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUdwRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFJSDtJQVVFLDRCQUNVLFVBQXNCLEVBQ3RCLEdBQTBCLEVBQzFCLE1BQWM7UUFGZCxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBQzFCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFWeEIsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQzFCLHFCQUFnQixHQUFHLEtBQUssQ0FBQztJQVVyQixDQUFDO0lBRUwscUNBQVEsR0FBUjtRQUFBLGlCQTRFQztRQTNFQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO1lBQzdDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUM5QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTNFLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7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QUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBdkZRO1FBQVIsS0FBSyxFQUFFOzt5REFBb0I7SUFDbkI7UUFBUixLQUFLLEVBQUU7OzBEQUFpQjtJQUNoQjtRQUFSLEtBQUssRUFBRTs7MkRBQXVCO0lBQ3RCO1FBQVIsS0FBSyxFQUFFOzt5REFBcUI7SUFSbEIsa0JBQWtCO1FBSDlCLFNBQVMsQ0FBQztZQUNULFFBQVEsRUFBRSxhQUFhO1NBQ3hCLENBQUM7aURBWXNCLFVBQVU7WUFDakIscUJBQXFCO1lBQ2xCLE1BQU07T0FiYixrQkFBa0IsQ0E2RjlCO0lBQUQseUJBQUM7Q0FBQSxBQTdGRCxJQTZGQztTQTdGWSxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIElucHV0LCBOZ1pvbmUsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnLi4vanNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlJztcblxuXG4vKipcbiAqIE9yZGVyYWJsZURpcmVjdGl2ZVxuICpcbiAqIEVuYWJsZXMgYXJyYXkgZWxlbWVudHMgdG8gYmUgcmVvcmRlcmVkIGJ5IGRyYWdnaW5nIGFuZCBkcm9wcGluZy5cbiAqXG4gKiBPbmx5IHdvcmtzIGZvciBhcnJheXMgdGhhdCBoYXZlIGF0IGxlYXN0IHR3byBlbGVtZW50cy5cbiAqXG4gKiBBbHNvIGRldGVjdHMgYXJyYXlzLXdpdGhpbi1hcnJheXMsIGFuZCBjb3JyZWN0bHkgbW92ZXMgZWl0aGVyXG4gKiB0aGUgY2hpbGQgYXJyYXkgZWxlbWVudCBvciB0aGUgcGFyZW50IGFycmF5IGVsZW1lbnQsXG4gKiBkZXBlbmRpbmcgb24gdGhlIGRyb3AgdGFyZ2VydC5cbiAqXG4gKiBMaXN0ZW5lcnMgZm9yIG1vdmFibGUgZWxlbWVudCBiZWluZyBkcmFnZ2VkOlxuICogLSBkcmFnc3RhcnQ6IGFkZCAnZHJhZ2dpbmcnIGNsYXNzIHRvIGVsZW1lbnQsIHNldCBlZmZlY3RBbGxvd2VkID0gJ21vdmUnXG4gKiAtIGRyYWdvdmVyOiBzZXQgZHJvcEVmZmVjdCA9ICdtb3ZlJ1xuICogLSBkcmFnZW5kOiByZW1vdmUgJ2RyYWdnaW5nJyBjbGFzcyBmcm9tIGVsZW1lbnRcbiAqXG4gKiBMaXN0ZW5lcnMgZm9yIHN0YXRpb25hcnkgaXRlbXMgYmVpbmcgZHJhZ2dlZCBvdmVyOlxuICogLSBkcmFnZW50ZXI6IGFkZCAnZHJhZy10YXJnZXQtLi4uJyBjbGFzc2VzIHRvIGVsZW1lbnRcbiAqIC0gZHJhZ2xlYXZlOiByZW1vdmUgJ2RyYWctdGFyZ2V0LS4uLicgY2xhc3NlcyBmcm9tIGVsZW1lbnRcbiAqIC0gZHJvcDogcmVtb3ZlICdkcmFnLXRhcmdldC0uLi4nIGNsYXNzZXMgZnJvbSBlbGVtZW50LCBtb3ZlIGRyb3BwZWQgYXJyYXkgaXRlbVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbb3JkZXJhYmxlXScsXG59KVxuZXhwb3J0IGNsYXNzIE9yZGVyYWJsZURpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIGFycmF5TGF5b3V0SW5kZXg6IHN0cmluZztcbiAgZWxlbWVudDogYW55O1xuICBvdmVyUGFyZW50RWxlbWVudCA9IGZhbHNlO1xuICBvdmVyQ2hpbGRFbGVtZW50ID0gZmFsc2U7XG4gIEBJbnB1dCgpIG9yZGVyYWJsZTogYm9vbGVhbjtcbiAgQElucHV0KCkgbGF5b3V0Tm9kZTogYW55O1xuICBASW5wdXQoKSBsYXlvdXRJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGRhdGFJbmRleDogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHByaXZhdGUganNmOiBKc29uU2NoZW1hRm9ybVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZVxuICApIHsgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmICh0aGlzLm9yZGVyYWJsZSAmJiB0aGlzLmxheW91dE5vZGUgJiYgdGhpcy5sYXlvdXRJbmRleCAmJiB0aGlzLmRhdGFJbmRleCkge1xuICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICB0aGlzLmVsZW1lbnQuZHJhZ2dhYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuYXJyYXlMYXlvdXRJbmRleCA9ICdtb3ZlOicgKyB0aGlzLmxheW91dEluZGV4LnNsaWNlKDAsIC0xKS50b1N0cmluZygpO1xuXG4gICAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG5cbiAgICAgICAgLy8gTGlzdGVuZXJzIGZvciBtb3ZhYmxlIGVsZW1lbnQgYmVpbmcgZHJhZ2dlZDpcblxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSAnbW92ZSc7XG4gICAgICAgICAgLy8gSGFjayB0byBieXBhc3Mgc3R1cGlkIEhUTUwgZHJhZy1hbmQtZHJvcCBkYXRhVHJhbnNmZXIgcHJvdGVjdGlvblxuICAgICAgICAgIC8vIHNvIGRyYWcgc291cmNlIGluZm8gd2lsbCBiZSBhdmFpbGFibGUgb24gZHJhZ2VudGVyXG4gICAgICAgICAgY29uc3Qgc291cmNlQXJyYXlJbmRleCA9IHRoaXMuZGF0YUluZGV4W3RoaXMuZGF0YUluZGV4Lmxlbmd0aCAtIDFdO1xuICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0odGhpcy5hcnJheUxheW91dEluZGV4LCBzb3VyY2VBcnJheUluZGV4ICsgJycpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgfVxuICAgICAgICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTGlzdGVuZXJzIGZvciBzdGF0aW9uYXJ5IGl0ZW1zIGJlaW5nIGRyYWdnZWQgb3ZlcjpcblxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VudGVyJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgLy8gUGFydCAxIG9mIGEgaGFjaywgaW5zcGlyZWQgYnkgRHJhZ3N0ZXIsIHRvIHNpbXVsYXRlIG1vdXNlb3ZlciBhbmQgbW91c2VvdXRcbiAgICAgICAgICAvLyBiZWhhdmlvciB3aGlsZSBkcmFnZ2luZyBpdGVtcyAtIGh0dHA6Ly9iZW5zbWl0aGV0dC5naXRodWIuaW8vZHJhZ3N0ZXIvXG4gICAgICAgICAgaWYgKHRoaXMub3ZlclBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm92ZXJDaGlsZEVsZW1lbnQgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm92ZXJQYXJlbnRFbGVtZW50ID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBzb3VyY2VBcnJheUluZGV4ID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmFycmF5TGF5b3V0SW5kZXgpO1xuICAgICAgICAgIGlmIChzb3VyY2VBcnJheUluZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhSW5kZXhbdGhpcy5kYXRhSW5kZXgubGVuZ3RoIC0gMV0gPCArc291cmNlQXJyYXlJbmRleCkge1xuICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZHJhZy10YXJnZXQtdG9wJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZGF0YUluZGV4W3RoaXMuZGF0YUluZGV4Lmxlbmd0aCAtIDFdID4gK3NvdXJjZUFycmF5SW5kZXgpIHtcbiAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2RyYWctdGFyZ2V0LWJvdHRvbScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIChldmVudCkgPT4ge1xuICAgICAgICAgIC8vIFBhcnQgMiBvZiB0aGUgRHJhZ3N0ZXIgaGFja1xuICAgICAgICAgIGlmICh0aGlzLm92ZXJDaGlsZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMub3ZlckNoaWxkRWxlbWVudCA9IGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5vdmVyUGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5vdmVyUGFyZW50RWxlbWVudCA9IGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHNvdXJjZUFycmF5SW5kZXggPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKHRoaXMuYXJyYXlMYXlvdXRJbmRleCk7XG4gICAgICAgICAgaWYgKCF0aGlzLm92ZXJQYXJlbnRFbGVtZW50ICYmICF0aGlzLm92ZXJDaGlsZEVsZW1lbnQgJiYgc291cmNlQXJyYXlJbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWctdGFyZ2V0LXRvcCcpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWctdGFyZ2V0LWJvdHRvbScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZy10YXJnZXQtdG9wJyk7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWctdGFyZ2V0LWJvdHRvbScpO1xuICAgICAgICAgIC8vIENvbmZpcm0gdGhhdCBkcm9wIHRhcmdldCBpcyBhbm90aGVyIGl0ZW0gaW4gdGhlIHNhbWUgYXJyYXkgYXMgc291cmNlIGl0ZW1cbiAgICAgICAgICBjb25zdCBzb3VyY2VBcnJheUluZGV4ID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmFycmF5TGF5b3V0SW5kZXgpO1xuICAgICAgICAgIGNvbnN0IGRlc3RBcnJheUluZGV4ID0gdGhpcy5kYXRhSW5kZXhbdGhpcy5kYXRhSW5kZXgubGVuZ3RoIC0gMV07XG4gICAgICAgICAgaWYgKHNvdXJjZUFycmF5SW5kZXggIT09IG51bGwgJiYgK3NvdXJjZUFycmF5SW5kZXggIT09IGRlc3RBcnJheUluZGV4KSB7XG4gICAgICAgICAgICAvLyBNb3ZlIGFycmF5IGl0ZW1cbiAgICAgICAgICAgIHRoaXMuanNmLm1vdmVBcnJheUl0ZW0odGhpcywgK3NvdXJjZUFycmF5SW5kZXgsIGRlc3RBcnJheUluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLmFycmF5TGF5b3V0SW5kZXgpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuIl19