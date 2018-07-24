import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { Framework } from '../framework';
// Bootstrap 3 Framework
// https://github.com/valor-software/ng2-bootstrap
import { Bootstrap3FrameworkComponent } from './bootstrap-3-framework.component';
let Bootstrap3Framework = class Bootstrap3Framework extends Framework {
    constructor() {
        super(...arguments);
        this.name = 'bootstrap-3';
        this.framework = Bootstrap3FrameworkComponent;
        this.stylesheets = [
            '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
            '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css',
        ];
        this.scripts = [
            '//ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js',
            '//ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
            '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
        ];
    }
};
Bootstrap3Framework = tslib_1.__decorate([
    Injectable()
], Bootstrap3Framework);
export { Bootstrap3Framework };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLTMuZnJhbWV3b3JrLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjYtanNvbi1zY2hlbWEtZm9ybS8iLCJzb3VyY2VzIjpbImxpYi9mcmFtZXdvcmstbGlicmFyeS9ib290c3RyYXAtMy1mcmFtZXdvcmsvYm9vdHN0cmFwLTMuZnJhbWV3b3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFekMsd0JBQXdCO0FBQ3hCLGtEQUFrRDtBQUNsRCxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUdqRixJQUFhLG1CQUFtQixHQUFoQyx5QkFBaUMsU0FBUSxTQUFTO0lBRGxEOztRQUVFLFNBQUksR0FBRyxhQUFhLENBQUM7UUFFckIsY0FBUyxHQUFHLDRCQUE0QixDQUFDO1FBRXpDLGdCQUFXLEdBQUc7WUFDWixpRUFBaUU7WUFDakUsdUVBQXVFO1NBQ3hFLENBQUM7UUFFRixZQUFPLEdBQUc7WUFDUiw0REFBNEQ7WUFDNUQsa0VBQWtFO1lBQ2xFLCtEQUErRDtTQUNoRSxDQUFDO0lBQ0osQ0FBQztDQUFBLENBQUE7QUFmWSxtQkFBbUI7SUFEL0IsVUFBVSxFQUFFO0dBQ0EsbUJBQW1CLENBZS9CO1NBZlksbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBGcmFtZXdvcmsgfSBmcm9tICcuLi9mcmFtZXdvcmsnO1xuXG4vLyBCb290c3RyYXAgMyBGcmFtZXdvcmtcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS92YWxvci1zb2Z0d2FyZS9uZzItYm9vdHN0cmFwXG5pbXBvcnQgeyBCb290c3RyYXAzRnJhbWV3b3JrQ29tcG9uZW50IH0gZnJvbSAnLi9ib290c3RyYXAtMy1mcmFtZXdvcmsuY29tcG9uZW50JztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJvb3RzdHJhcDNGcmFtZXdvcmsgZXh0ZW5kcyBGcmFtZXdvcmsge1xuICBuYW1lID0gJ2Jvb3RzdHJhcC0zJztcblxuICBmcmFtZXdvcmsgPSBCb290c3RyYXAzRnJhbWV3b3JrQ29tcG9uZW50O1xuXG4gIHN0eWxlc2hlZXRzID0gW1xuICAgICcvL21heGNkbi5ib290c3RyYXBjZG4uY29tL2Jvb3RzdHJhcC8zLjMuNy9jc3MvYm9vdHN0cmFwLm1pbi5jc3MnLFxuICAgICcvL21heGNkbi5ib290c3RyYXBjZG4uY29tL2Jvb3RzdHJhcC8zLjMuNy9jc3MvYm9vdHN0cmFwLXRoZW1lLm1pbi5jc3MnLFxuICBdO1xuXG4gIHNjcmlwdHMgPSBbXG4gICAgJy8vYWpheC5nb29nbGVhcGlzLmNvbS9hamF4L2xpYnMvanF1ZXJ5LzIuMi40L2pxdWVyeS5taW4uanMnLFxuICAgICcvL2FqYXguZ29vZ2xlYXBpcy5jb20vYWpheC9saWJzL2pxdWVyeXVpLzEuMTIuMS9qcXVlcnktdWkubWluLmpzJyxcbiAgICAnLy9tYXhjZG4uYm9vdHN0cmFwY2RuLmNvbS9ib290c3RyYXAvMy4zLjcvanMvYm9vdHN0cmFwLm1pbi5qcycsXG4gIF07XG59XG4iXX0=