import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { Framework } from '../framework';
// Bootstrap 4 Framework
// https://github.com/ng-bootstrap/ng-bootstrap
import { Bootstrap4FrameworkComponent } from './bootstrap-4-framework.component';
let Bootstrap4Framework = class Bootstrap4Framework extends Framework {
    constructor() {
        super(...arguments);
        this.name = 'bootstrap-4';
        this.framework = Bootstrap4FrameworkComponent;
        this.stylesheets = [
            '//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css'
        ];
        this.scripts = [
            '//code.jquery.com/jquery-3.2.1.slim.min.js',
            '//cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js',
            '//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js',
        ];
    }
};
Bootstrap4Framework = tslib_1.__decorate([
    Injectable()
], Bootstrap4Framework);
export { Bootstrap4Framework };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLTQuZnJhbWV3b3JrLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjYtanNvbi1zY2hlbWEtZm9ybS8iLCJzb3VyY2VzIjpbImxpYi9mcmFtZXdvcmstbGlicmFyeS9ib290c3RyYXAtNC1mcmFtZXdvcmsvYm9vdHN0cmFwLTQuZnJhbWV3b3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFekMsd0JBQXdCO0FBQ3hCLCtDQUErQztBQUMvQyxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUlqRixJQUFhLG1CQUFtQixHQUFoQyx5QkFBaUMsU0FBUSxTQUFTO0lBRGxEOztRQUVFLFNBQUksR0FBRyxhQUFhLENBQUM7UUFFckIsY0FBUyxHQUFHLDRCQUE0QixDQUFDO1FBRXpDLGdCQUFXLEdBQUc7WUFDWix3RUFBd0U7U0FDekUsQ0FBQztRQUVGLFlBQU8sR0FBRztZQUNSLDRDQUE0QztZQUM1QyxxRUFBcUU7WUFDckUsc0VBQXNFO1NBQ3ZFLENBQUM7SUFDSixDQUFDO0NBQUEsQ0FBQTtBQWRZLG1CQUFtQjtJQUQvQixVQUFVLEVBQUU7R0FDQSxtQkFBbUIsQ0FjL0I7U0FkWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEZyYW1ld29yayB9IGZyb20gJy4uL2ZyYW1ld29yayc7XG5cbi8vIEJvb3RzdHJhcCA0IEZyYW1ld29ya1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbmltcG9ydCB7IEJvb3RzdHJhcDRGcmFtZXdvcmtDb21wb25lbnQgfSBmcm9tICcuL2Jvb3RzdHJhcC00LWZyYW1ld29yay5jb21wb25lbnQnO1xuXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCb290c3RyYXA0RnJhbWV3b3JrIGV4dGVuZHMgRnJhbWV3b3JrIHtcbiAgbmFtZSA9ICdib290c3RyYXAtNCc7XG5cbiAgZnJhbWV3b3JrID0gQm9vdHN0cmFwNEZyYW1ld29ya0NvbXBvbmVudDtcblxuICBzdHlsZXNoZWV0cyA9IFtcbiAgICAnLy9tYXhjZG4uYm9vdHN0cmFwY2RuLmNvbS9ib290c3RyYXAvNC4wLjAtYmV0YS4yL2Nzcy9ib290c3RyYXAubWluLmNzcydcbiAgXTtcblxuICBzY3JpcHRzID0gW1xuICAgICcvL2NvZGUuanF1ZXJ5LmNvbS9qcXVlcnktMy4yLjEuc2xpbS5taW4uanMnLFxuICAgICcvL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9wb3BwZXIuanMvMS4xMi4zL3VtZC9wb3BwZXIubWluLmpzJyxcbiAgICAnLy9tYXhjZG4uYm9vdHN0cmFwY2RuLmNvbS9ib290c3RyYXAvNC4wLjAtYmV0YS4yL2pzL2Jvb3RzdHJhcC5taW4uanMnLFxuICBdO1xufVxuIl19