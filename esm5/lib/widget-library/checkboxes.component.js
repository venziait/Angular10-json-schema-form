import * as tslib_1 from "tslib";
import { Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
import { buildTitleMap } from '../shared';
var CheckboxesComponent = /** @class */ (function () {
    function CheckboxesComponent(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.checkboxList = [];
    }
    CheckboxesComponent.prototype.ngOnInit = function () {
        this.options = this.layoutNode.options || {};
        this.layoutOrientation = (this.layoutNode.type === 'checkboxes-inline' ||
            this.layoutNode.type === 'checkboxbuttons') ? 'horizontal' : 'vertical';
        this.jsf.initializeControl(this);
        this.checkboxList = buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, true);
        if (this.boundControl) {
            var formArray_1 = this.jsf.getFormControl(this);
            this.checkboxList.forEach(function (checkboxItem) {
                return checkboxItem.checked = formArray_1.value.includes(checkboxItem.value);
            });
        }
    };
    CheckboxesComponent.prototype.updateValue = function (event) {
        try {
            for (var _a = tslib_1.__values(this.checkboxList), _b = _a.next(); !_b.done; _b = _a.next()) {
                var checkboxItem = _b.value;
                if (event.target.value === checkboxItem.value) {
                    checkboxItem.checked = event.target.checked;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (this.boundControl) {
            this.jsf.updateArrayCheckboxList(this, this.checkboxList);
        }
        var e_1, _c;
    };
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], CheckboxesComponent.prototype, "layoutNode", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], CheckboxesComponent.prototype, "layoutIndex", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], CheckboxesComponent.prototype, "dataIndex", void 0);
    CheckboxesComponent = tslib_1.__decorate([
        Component({
            selector: 'checkboxes-widget',
            template: "\n    <label *ngIf=\"options?.title\"\n      [class]=\"options?.labelHtmlClass || ''\"\n      [style.display]=\"options?.notitle ? 'none' : ''\"\n      [innerHTML]=\"options?.title\"></label>\n\n    <!-- 'horizontal' = checkboxes-inline or checkboxbuttons -->\n    <div *ngIf=\"layoutOrientation === 'horizontal'\" [class]=\"options?.htmlClass || ''\">\n      <label *ngFor=\"let checkboxItem of checkboxList\"\n        [attr.for]=\"'control' + layoutNode?._id + '/' + checkboxItem.value\"\n        [class]=\"(options?.itemLabelHtmlClass || '') + (checkboxItem.checked ?\n          (' ' + (options?.activeClass || '') + ' ' + (options?.style?.selected || '')) :\n          (' ' + (options?.style?.unselected || '')))\">\n        <input type=\"checkbox\"\n          [attr.required]=\"options?.required\"\n          [checked]=\"checkboxItem.checked\"\n          [class]=\"options?.fieldHtmlClass || ''\"\n          [disabled]=\"controlDisabled\"\n          [id]=\"'control' + layoutNode?._id + '/' + checkboxItem.value\"\n          [name]=\"checkboxItem?.name\"\n          [readonly]=\"options?.readonly ? 'readonly' : null\"\n          [value]=\"checkboxItem.value\"\n          (change)=\"updateValue($event)\">\n        <span [innerHTML]=\"checkboxItem.name\"></span>\n      </label>\n    </div>\n\n    <!-- 'vertical' = regular checkboxes -->\n    <div *ngIf=\"layoutOrientation === 'vertical'\">\n      <div *ngFor=\"let checkboxItem of checkboxList\" [class]=\"options?.htmlClass || ''\">\n        <label\n          [attr.for]=\"'control' + layoutNode?._id + '/' + checkboxItem.value\"\n          [class]=\"(options?.itemLabelHtmlClass || '') + (checkboxItem.checked ?\n            (' ' + (options?.activeClass || '') + ' ' + (options?.style?.selected || '')) :\n            (' ' + (options?.style?.unselected || '')))\">\n          <input type=\"checkbox\"\n            [attr.required]=\"options?.required\"\n            [checked]=\"checkboxItem.checked\"\n            [class]=\"options?.fieldHtmlClass || ''\"\n            [disabled]=\"controlDisabled\"\n            [id]=\"options?.name + '/' + checkboxItem.value\"\n            [name]=\"checkboxItem?.name\"\n            [readonly]=\"options?.readonly ? 'readonly' : null\"\n            [value]=\"checkboxItem.value\"\n            (change)=\"updateValue($event)\">\n          <span [innerHTML]=\"checkboxItem?.name\"></span>\n        </label>\n      </div>\n    </div>",
        }),
        tslib_1.__metadata("design:paramtypes", [JsonSchemaFormService])
    ], CheckboxesComponent);
    return CheckboxesComponent;
}());
export { CheckboxesComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3hlcy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL3dpZGdldC1saWJyYXJ5L2NoZWNrYm94ZXMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUd6RCxPQUFPLEVBQUUscUJBQXFCLEVBQWdCLE1BQU0sNkJBQTZCLENBQUM7QUFDbEYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQXNEMUM7SUFjRSw2QkFDVSxHQUEwQjtRQUExQixRQUFHLEdBQUgsR0FBRyxDQUF1QjtRQVhwQyxvQkFBZSxHQUFHLEtBQUssQ0FBQztRQUN4QixpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUlyQixpQkFBWSxHQUFtQixFQUFFLENBQUM7SUFPOUIsQ0FBQztJQUVMLHNDQUFRLEdBQVI7UUFDRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxtQkFBbUI7WUFDcEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFDMUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLGFBQWEsQ0FDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUN6RSxDQUFDO1FBQ0YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBTSxXQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxZQUFZO2dCQUNwQyxPQUFBLFlBQVksQ0FBQyxPQUFPLEdBQUcsV0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUFuRSxDQUFtRSxDQUNwRSxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFRCx5Q0FBVyxHQUFYLFVBQVksS0FBSzs7WUFDZixHQUFHLENBQUMsQ0FBcUIsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyxZQUFZLENBQUEsZ0JBQUE7Z0JBQXJDLElBQUksWUFBWSxXQUFBO2dCQUNuQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDOUMsWUFBWSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFDOUMsQ0FBQzthQUNGOzs7Ozs7Ozs7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDNUQsQ0FBQzs7SUFDSCxDQUFDO0lBakNRO1FBQVIsS0FBSyxFQUFFOzsyREFBaUI7SUFDaEI7UUFBUixLQUFLLEVBQUU7OzREQUF1QjtJQUN0QjtRQUFSLEtBQUssRUFBRTs7MERBQXFCO0lBWmxCLG1CQUFtQjtRQXBEL0IsU0FBUyxDQUFDO1lBQ1QsUUFBUSxFQUFFLG1CQUFtQjtZQUM3QixRQUFRLEVBQUUsMjNFQWdERDtTQUNWLENBQUM7aURBZ0JlLHFCQUFxQjtPQWZ6QixtQkFBbUIsQ0E0Qy9CO0lBQUQsMEJBQUM7Q0FBQSxBQTVDRCxJQTRDQztTQTVDWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZvcm1BcnJheSwgQWJzdHJhY3RDb250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UsIFRpdGxlTWFwSXRlbSB9IGZyb20gJy4uL2pzb24tc2NoZW1hLWZvcm0uc2VydmljZSc7XG5pbXBvcnQgeyBidWlsZFRpdGxlTWFwIH0gZnJvbSAnLi4vc2hhcmVkJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnY2hlY2tib3hlcy13aWRnZXQnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxsYWJlbCAqbmdJZj1cIm9wdGlvbnM/LnRpdGxlXCJcbiAgICAgIFtjbGFzc109XCJvcHRpb25zPy5sYWJlbEh0bWxDbGFzcyB8fCAnJ1wiXG4gICAgICBbc3R5bGUuZGlzcGxheV09XCJvcHRpb25zPy5ub3RpdGxlID8gJ25vbmUnIDogJydcIlxuICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy50aXRsZVwiPjwvbGFiZWw+XG5cbiAgICA8IS0tICdob3Jpem9udGFsJyA9IGNoZWNrYm94ZXMtaW5saW5lIG9yIGNoZWNrYm94YnV0dG9ucyAtLT5cbiAgICA8ZGl2ICpuZ0lmPVwibGF5b3V0T3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJ1wiIFtjbGFzc109XCJvcHRpb25zPy5odG1sQ2xhc3MgfHwgJydcIj5cbiAgICAgIDxsYWJlbCAqbmdGb3I9XCJsZXQgY2hlY2tib3hJdGVtIG9mIGNoZWNrYm94TGlzdFwiXG4gICAgICAgIFthdHRyLmZvcl09XCInY29udHJvbCcgKyBsYXlvdXROb2RlPy5faWQgKyAnLycgKyBjaGVja2JveEl0ZW0udmFsdWVcIlxuICAgICAgICBbY2xhc3NdPVwiKG9wdGlvbnM/Lml0ZW1MYWJlbEh0bWxDbGFzcyB8fCAnJykgKyAoY2hlY2tib3hJdGVtLmNoZWNrZWQgP1xuICAgICAgICAgICgnICcgKyAob3B0aW9ucz8uYWN0aXZlQ2xhc3MgfHwgJycpICsgJyAnICsgKG9wdGlvbnM/LnN0eWxlPy5zZWxlY3RlZCB8fCAnJykpIDpcbiAgICAgICAgICAoJyAnICsgKG9wdGlvbnM/LnN0eWxlPy51bnNlbGVjdGVkIHx8ICcnKSkpXCI+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgIFthdHRyLnJlcXVpcmVkXT1cIm9wdGlvbnM/LnJlcXVpcmVkXCJcbiAgICAgICAgICBbY2hlY2tlZF09XCJjaGVja2JveEl0ZW0uY2hlY2tlZFwiXG4gICAgICAgICAgW2NsYXNzXT1cIm9wdGlvbnM/LmZpZWxkSHRtbENsYXNzIHx8ICcnXCJcbiAgICAgICAgICBbZGlzYWJsZWRdPVwiY29udHJvbERpc2FibGVkXCJcbiAgICAgICAgICBbaWRdPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkICsgJy8nICsgY2hlY2tib3hJdGVtLnZhbHVlXCJcbiAgICAgICAgICBbbmFtZV09XCJjaGVja2JveEl0ZW0/Lm5hbWVcIlxuICAgICAgICAgIFtyZWFkb25seV09XCJvcHRpb25zPy5yZWFkb25seSA/ICdyZWFkb25seScgOiBudWxsXCJcbiAgICAgICAgICBbdmFsdWVdPVwiY2hlY2tib3hJdGVtLnZhbHVlXCJcbiAgICAgICAgICAoY2hhbmdlKT1cInVwZGF0ZVZhbHVlKCRldmVudClcIj5cbiAgICAgICAgPHNwYW4gW2lubmVySFRNTF09XCJjaGVja2JveEl0ZW0ubmFtZVwiPjwvc3Bhbj5cbiAgICAgIDwvbGFiZWw+XG4gICAgPC9kaXY+XG5cbiAgICA8IS0tICd2ZXJ0aWNhbCcgPSByZWd1bGFyIGNoZWNrYm94ZXMgLS0+XG4gICAgPGRpdiAqbmdJZj1cImxheW91dE9yaWVudGF0aW9uID09PSAndmVydGljYWwnXCI+XG4gICAgICA8ZGl2ICpuZ0Zvcj1cImxldCBjaGVja2JveEl0ZW0gb2YgY2hlY2tib3hMaXN0XCIgW2NsYXNzXT1cIm9wdGlvbnM/Lmh0bWxDbGFzcyB8fCAnJ1wiPlxuICAgICAgICA8bGFiZWxcbiAgICAgICAgICBbYXR0ci5mb3JdPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkICsgJy8nICsgY2hlY2tib3hJdGVtLnZhbHVlXCJcbiAgICAgICAgICBbY2xhc3NdPVwiKG9wdGlvbnM/Lml0ZW1MYWJlbEh0bWxDbGFzcyB8fCAnJykgKyAoY2hlY2tib3hJdGVtLmNoZWNrZWQgP1xuICAgICAgICAgICAgKCcgJyArIChvcHRpb25zPy5hY3RpdmVDbGFzcyB8fCAnJykgKyAnICcgKyAob3B0aW9ucz8uc3R5bGU/LnNlbGVjdGVkIHx8ICcnKSkgOlxuICAgICAgICAgICAgKCcgJyArIChvcHRpb25zPy5zdHlsZT8udW5zZWxlY3RlZCB8fCAnJykpKVwiPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgW2F0dHIucmVxdWlyZWRdPVwib3B0aW9ucz8ucmVxdWlyZWRcIlxuICAgICAgICAgICAgW2NoZWNrZWRdPVwiY2hlY2tib3hJdGVtLmNoZWNrZWRcIlxuICAgICAgICAgICAgW2NsYXNzXT1cIm9wdGlvbnM/LmZpZWxkSHRtbENsYXNzIHx8ICcnXCJcbiAgICAgICAgICAgIFtkaXNhYmxlZF09XCJjb250cm9sRGlzYWJsZWRcIlxuICAgICAgICAgICAgW2lkXT1cIm9wdGlvbnM/Lm5hbWUgKyAnLycgKyBjaGVja2JveEl0ZW0udmFsdWVcIlxuICAgICAgICAgICAgW25hbWVdPVwiY2hlY2tib3hJdGVtPy5uYW1lXCJcbiAgICAgICAgICAgIFtyZWFkb25seV09XCJvcHRpb25zPy5yZWFkb25seSA/ICdyZWFkb25seScgOiBudWxsXCJcbiAgICAgICAgICAgIFt2YWx1ZV09XCJjaGVja2JveEl0ZW0udmFsdWVcIlxuICAgICAgICAgICAgKGNoYW5nZSk9XCJ1cGRhdGVWYWx1ZSgkZXZlbnQpXCI+XG4gICAgICAgICAgPHNwYW4gW2lubmVySFRNTF09XCJjaGVja2JveEl0ZW0/Lm5hbWVcIj48L3NwYW4+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5gLFxufSlcbmV4cG9ydCBjbGFzcyBDaGVja2JveGVzQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgZm9ybUNvbnRyb2w6IEFic3RyYWN0Q29udHJvbDtcbiAgY29udHJvbE5hbWU6IHN0cmluZztcbiAgY29udHJvbFZhbHVlOiBhbnk7XG4gIGNvbnRyb2xEaXNhYmxlZCA9IGZhbHNlO1xuICBib3VuZENvbnRyb2wgPSBmYWxzZTtcbiAgb3B0aW9uczogYW55O1xuICBsYXlvdXRPcmllbnRhdGlvbjogc3RyaW5nO1xuICBmb3JtQXJyYXk6IEFic3RyYWN0Q29udHJvbDtcbiAgY2hlY2tib3hMaXN0OiBUaXRsZU1hcEl0ZW1bXSA9IFtdO1xuICBASW5wdXQoKSBsYXlvdXROb2RlOiBhbnk7XG4gIEBJbnB1dCgpIGxheW91dEluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgZGF0YUluZGV4OiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlXG4gICkgeyB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5sYXlvdXROb2RlLm9wdGlvbnMgfHwge307XG4gICAgdGhpcy5sYXlvdXRPcmllbnRhdGlvbiA9ICh0aGlzLmxheW91dE5vZGUudHlwZSA9PT0gJ2NoZWNrYm94ZXMtaW5saW5lJyB8fFxuICAgICAgdGhpcy5sYXlvdXROb2RlLnR5cGUgPT09ICdjaGVja2JveGJ1dHRvbnMnKSA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCc7XG4gICAgdGhpcy5qc2YuaW5pdGlhbGl6ZUNvbnRyb2wodGhpcyk7XG4gICAgdGhpcy5jaGVja2JveExpc3QgPSBidWlsZFRpdGxlTWFwKFxuICAgICAgdGhpcy5vcHRpb25zLnRpdGxlTWFwIHx8IHRoaXMub3B0aW9ucy5lbnVtTmFtZXMsIHRoaXMub3B0aW9ucy5lbnVtLCB0cnVlXG4gICAgKTtcbiAgICBpZiAodGhpcy5ib3VuZENvbnRyb2wpIHtcbiAgICAgIGNvbnN0IGZvcm1BcnJheSA9IHRoaXMuanNmLmdldEZvcm1Db250cm9sKHRoaXMpO1xuICAgICAgdGhpcy5jaGVja2JveExpc3QuZm9yRWFjaChjaGVja2JveEl0ZW0gPT5cbiAgICAgICAgY2hlY2tib3hJdGVtLmNoZWNrZWQgPSBmb3JtQXJyYXkudmFsdWUuaW5jbHVkZXMoY2hlY2tib3hJdGVtLnZhbHVlKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVWYWx1ZShldmVudCkge1xuICAgIGZvciAobGV0IGNoZWNrYm94SXRlbSBvZiB0aGlzLmNoZWNrYm94TGlzdCkge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldC52YWx1ZSA9PT0gY2hlY2tib3hJdGVtLnZhbHVlKSB7XG4gICAgICAgIGNoZWNrYm94SXRlbS5jaGVja2VkID0gZXZlbnQudGFyZ2V0LmNoZWNrZWQ7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLmJvdW5kQ29udHJvbCkge1xuICAgICAgdGhpcy5qc2YudXBkYXRlQXJyYXlDaGVja2JveExpc3QodGhpcywgdGhpcy5jaGVja2JveExpc3QpO1xuICAgIH1cbiAgfVxufVxuIl19