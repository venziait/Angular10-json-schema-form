import * as tslib_1 from "tslib";
import * as _ from 'lodash';
;
export function convertSchemaToDraft6(schema, options) {
    if (options === void 0) { options = {}; }
    var draft = options.draft || null;
    var changed = options.changed || false;
    if (typeof schema !== 'object') {
        return schema;
    }
    if (typeof schema.map === 'function') {
        return tslib_1.__spread(schema.map(function (subSchema) { return convertSchemaToDraft6(subSchema, { changed: changed, draft: draft }); }));
    }
    var newSchema = tslib_1.__assign({}, schema);
    var simpleTypes = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];
    if (typeof newSchema.$schema === 'string' &&
        /http\:\/\/json\-schema\.org\/draft\-0\d\/schema\#/.test(newSchema.$schema)) {
        draft = newSchema.$schema[30];
    }
    // Convert v1-v2 'contentEncoding' to 'media.binaryEncoding'
    // Note: This is only used in JSON hyper-schema (not regular JSON schema)
    if (newSchema.contentEncoding) {
        newSchema.media = { binaryEncoding: newSchema.contentEncoding };
        delete newSchema.contentEncoding;
        changed = true;
    }
    // Convert v1-v3 'extends' to 'allOf'
    if (typeof newSchema.extends === 'object') {
        newSchema.allOf = typeof newSchema.extends.map === 'function' ?
            newSchema.extends.map(function (subSchema) { return convertSchemaToDraft6(subSchema, { changed: changed, draft: draft }); }) :
            [convertSchemaToDraft6(newSchema.extends, { changed: changed, draft: draft })];
        delete newSchema.extends;
        changed = true;
    }
    // Convert v1-v3 'disallow' to 'not'
    if (newSchema.disallow) {
        if (typeof newSchema.disallow === 'string') {
            newSchema.not = { type: newSchema.disallow };
        }
        else if (typeof newSchema.disallow.map === 'function') {
            newSchema.not = {
                anyOf: newSchema.disallow
                    .map(function (type) { return typeof type === 'object' ? type : { type: type }; })
            };
        }
        delete newSchema.disallow;
        changed = true;
    }
    // Convert v3 string 'dependencies' properties to arrays
    if (typeof newSchema.dependencies === 'object' &&
        Object.keys(newSchema.dependencies)
            .some(function (key) { return typeof newSchema.dependencies[key] === 'string'; })) {
        newSchema.dependencies = tslib_1.__assign({}, newSchema.dependencies);
        Object.keys(newSchema.dependencies)
            .filter(function (key) { return typeof newSchema.dependencies[key] === 'string'; })
            .forEach(function (key) { return newSchema.dependencies[key] = [newSchema.dependencies[key]]; });
        changed = true;
    }
    // Convert v1 'maxDecimal' to 'multipleOf'
    if (typeof newSchema.maxDecimal === 'number') {
        newSchema.multipleOf = 1 / Math.pow(10, newSchema.maxDecimal);
        delete newSchema.divisibleBy;
        changed = true;
        if (!draft || draft === 2) {
            draft = 1;
        }
    }
    // Convert v2-v3 'divisibleBy' to 'multipleOf'
    if (typeof newSchema.divisibleBy === 'number') {
        newSchema.multipleOf = newSchema.divisibleBy;
        delete newSchema.divisibleBy;
        changed = true;
    }
    // Convert v1-v2 boolean 'minimumCanEqual' to 'exclusiveMinimum'
    if (typeof newSchema.minimum === 'number' && newSchema.minimumCanEqual === false) {
        newSchema.exclusiveMinimum = newSchema.minimum;
        delete newSchema.minimum;
        changed = true;
        if (!draft) {
            draft = 2;
        }
    }
    else if (typeof newSchema.minimumCanEqual === 'boolean') {
        delete newSchema.minimumCanEqual;
        changed = true;
        if (!draft) {
            draft = 2;
        }
    }
    // Convert v3-v4 boolean 'exclusiveMinimum' to numeric
    if (typeof newSchema.minimum === 'number' && newSchema.exclusiveMinimum === true) {
        newSchema.exclusiveMinimum = newSchema.minimum;
        delete newSchema.minimum;
        changed = true;
    }
    else if (typeof newSchema.exclusiveMinimum === 'boolean') {
        delete newSchema.exclusiveMinimum;
        changed = true;
    }
    // Convert v1-v2 boolean 'maximumCanEqual' to 'exclusiveMaximum'
    if (typeof newSchema.maximum === 'number' && newSchema.maximumCanEqual === false) {
        newSchema.exclusiveMaximum = newSchema.maximum;
        delete newSchema.maximum;
        changed = true;
        if (!draft) {
            draft = 2;
        }
    }
    else if (typeof newSchema.maximumCanEqual === 'boolean') {
        delete newSchema.maximumCanEqual;
        changed = true;
        if (!draft) {
            draft = 2;
        }
    }
    // Convert v3-v4 boolean 'exclusiveMaximum' to numeric
    if (typeof newSchema.maximum === 'number' && newSchema.exclusiveMaximum === true) {
        newSchema.exclusiveMaximum = newSchema.maximum;
        delete newSchema.maximum;
        changed = true;
    }
    else if (typeof newSchema.exclusiveMaximum === 'boolean') {
        delete newSchema.exclusiveMaximum;
        changed = true;
    }
    // Search object 'properties' for 'optional', 'required', and 'requires' items,
    // and convert them into object 'required' arrays and 'dependencies' objects
    if (typeof newSchema.properties === 'object') {
        var properties_1 = tslib_1.__assign({}, newSchema.properties);
        var requiredKeys_1 = Array.isArray(newSchema.required) ?
            new Set(newSchema.required) : new Set();
        // Convert v1-v2 boolean 'optional' properties to 'required' array
        if (draft === 1 || draft === 2 ||
            Object.keys(properties_1).some(function (key) { return properties_1[key].optional === true; })) {
            Object.keys(properties_1)
                .filter(function (key) { return properties_1[key].optional !== true; })
                .forEach(function (key) { return requiredKeys_1.add(key); });
            changed = true;
            if (!draft) {
                draft = 2;
            }
        }
        // Convert v3 boolean 'required' properties to 'required' array
        if (Object.keys(properties_1).some(function (key) { return properties_1[key].required === true; })) {
            Object.keys(properties_1)
                .filter(function (key) { return properties_1[key].required === true; })
                .forEach(function (key) { return requiredKeys_1.add(key); });
            changed = true;
        }
        if (requiredKeys_1.size) {
            newSchema.required = Array.from(requiredKeys_1);
        }
        // Convert v1-v2 array or string 'requires' properties to 'dependencies' object
        if (Object.keys(properties_1).some(function (key) { return properties_1[key].requires; })) {
            var dependencies_1 = typeof newSchema.dependencies === 'object' ? tslib_1.__assign({}, newSchema.dependencies) : {};
            Object.keys(properties_1)
                .filter(function (key) { return properties_1[key].requires; })
                .forEach(function (key) { return dependencies_1[key] =
                typeof properties_1[key].requires === 'string' ?
                    [properties_1[key].requires] : properties_1[key].requires; });
            newSchema.dependencies = dependencies_1;
            changed = true;
            if (!draft) {
                draft = 2;
            }
        }
        newSchema.properties = properties_1;
    }
    // Revove v1-v2 boolean 'optional' key
    if (typeof newSchema.optional === 'boolean') {
        delete newSchema.optional;
        changed = true;
        if (!draft) {
            draft = 2;
        }
    }
    // Revove v1-v2 'requires' key
    if (newSchema.requires) {
        delete newSchema.requires;
    }
    // Revove v3 boolean 'required' key
    if (typeof newSchema.required === 'boolean') {
        delete newSchema.required;
    }
    // Convert id to $id
    if (typeof newSchema.id === 'string' && !newSchema.$id) {
        if (newSchema.id.slice(-1) === '#') {
            newSchema.id = newSchema.id.slice(0, -1);
        }
        newSchema.$id = newSchema.id + '-CONVERTED-TO-DRAFT-06#';
        delete newSchema.id;
        changed = true;
    }
    // Check if v1-v3 'any' or object types will be converted
    if (newSchema.type && (typeof newSchema.type.every === 'function' ?
        !newSchema.type.every(function (type) { return simpleTypes.includes(type); }) :
        !simpleTypes.includes(newSchema.type))) {
        changed = true;
    }
    // If schema changed, update or remove $schema identifier
    if (typeof newSchema.$schema === 'string' &&
        /http\:\/\/json\-schema\.org\/draft\-0[1-4]\/schema\#/.test(newSchema.$schema)) {
        newSchema.$schema = 'http://json-schema.org/draft-06/schema#';
        changed = true;
    }
    else if (changed && typeof newSchema.$schema === 'string') {
        var addToDescription = 'Converted to draft 6 from ' + newSchema.$schema;
        if (typeof newSchema.description === 'string' && newSchema.description.length) {
            newSchema.description += '\n' + addToDescription;
        }
        else {
            newSchema.description = addToDescription;
        }
        delete newSchema.$schema;
    }
    // Convert v1-v3 'any' and object types
    if (newSchema.type && (typeof newSchema.type.every === 'function' ?
        !newSchema.type.every(function (type) { return simpleTypes.includes(type); }) :
        !simpleTypes.includes(newSchema.type))) {
        if (newSchema.type.length === 1) {
            newSchema.type = newSchema.type[0];
        }
        if (typeof newSchema.type === 'string') {
            // Convert string 'any' type to array of all standard types
            if (newSchema.type === 'any') {
                newSchema.type = simpleTypes;
                // Delete non-standard string type
            }
            else {
                delete newSchema.type;
            }
        }
        else if (typeof newSchema.type === 'object') {
            if (typeof newSchema.type.every === 'function') {
                // If array of strings, only allow standard types
                if (newSchema.type.every(function (type) { return typeof type === 'string'; })) {
                    newSchema.type = newSchema.type.some(function (type) { return type === 'any'; }) ?
                        newSchema.type = simpleTypes :
                        newSchema.type.filter(function (type) { return simpleTypes.includes(type); });
                    // If type is an array with objects, convert the current schema to an 'anyOf' array
                }
                else if (newSchema.type.length > 1) {
                    var arrayKeys = ['additionalItems', 'items', 'maxItems', 'minItems', 'uniqueItems', 'contains'];
                    var numberKeys = ['multipleOf', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum'];
                    var objectKeys = ['maxProperties', 'minProperties', 'required', 'additionalProperties',
                        'properties', 'patternProperties', 'dependencies', 'propertyNames'];
                    var stringKeys = ['maxLength', 'minLength', 'pattern', 'format'];
                    var filterKeys_1 = {
                        'array': tslib_1.__spread(numberKeys, objectKeys, stringKeys),
                        'integer': tslib_1.__spread(arrayKeys, objectKeys, stringKeys),
                        'number': tslib_1.__spread(arrayKeys, objectKeys, stringKeys),
                        'object': tslib_1.__spread(arrayKeys, numberKeys, stringKeys),
                        'string': tslib_1.__spread(arrayKeys, numberKeys, objectKeys),
                        'all': tslib_1.__spread(arrayKeys, numberKeys, objectKeys, stringKeys),
                    };
                    var anyOf = [];
                    var _loop_1 = function (type) {
                        var newType = typeof type === 'string' ? { type: type } : tslib_1.__assign({}, type);
                        Object.keys(newSchema)
                            .filter(function (key) { return !newType.hasOwnProperty(key) &&
                            !tslib_1.__spread((filterKeys_1[newType.type] || filterKeys_1.all), ['type', 'default']).includes(key); })
                            .forEach(function (key) { return newType[key] = newSchema[key]; });
                        anyOf.push(newType);
                    };
                    try {
                        for (var _a = tslib_1.__values(newSchema.type), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var type = _b.value;
                            _loop_1(type);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    newSchema = newSchema.hasOwnProperty('default') ?
                        { anyOf: anyOf, default: newSchema.default } : { anyOf: anyOf };
                    // If type is an object, merge it with the current schema
                }
                else {
                    var typeSchema = newSchema.type;
                    delete newSchema.type;
                    Object.assign(newSchema, typeSchema);
                }
            }
        }
        else {
            delete newSchema.type;
        }
    }
    // Convert sub schemas
    Object.keys(newSchema)
        .filter(function (key) { return typeof newSchema[key] === 'object'; })
        .forEach(function (key) {
        if (['definitions', 'dependencies', 'properties', 'patternProperties']
            .includes(key) && typeof newSchema[key].map !== 'function') {
            var newKey_1 = {};
            Object.keys(newSchema[key]).forEach(function (subKey) { return newKey_1[subKey] =
                convertSchemaToDraft6(newSchema[key][subKey], { changed: changed, draft: draft }); });
            newSchema[key] = newKey_1;
        }
        else if (['items', 'additionalItems', 'additionalProperties',
            'allOf', 'anyOf', 'oneOf', 'not'].includes(key)) {
            newSchema[key] = convertSchemaToDraft6(newSchema[key], { changed: changed, draft: draft });
        }
        else {
            newSchema[key] = _.cloneDeep(newSchema[key]);
        }
    });
    return newSchema;
    var e_1, _c;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVydC1zY2hlbWEtdG8tZHJhZnQ2LmZ1bmN0aW9uLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjYtanNvbi1zY2hlbWEtZm9ybS8iLCJzb3VyY2VzIjpbImxpYi9zaGFyZWQvY29udmVydC1zY2hlbWEtdG8tZHJhZnQ2LmZ1bmN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssQ0FBQyxNQUFNLFFBQVEsQ0FBQztBQWtCdUMsQ0FBQztBQUNwRSxNQUFNLGdDQUFnQyxNQUFNLEVBQUUsT0FBMEI7SUFBMUIsd0JBQUEsRUFBQSxZQUEwQjtJQUN0RSxJQUFJLEtBQUssR0FBVyxPQUFPLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQztJQUMxQyxJQUFJLE9BQU8sR0FBWSxPQUFPLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQztJQUVoRCxFQUFFLENBQUMsQ0FBQyxPQUFPLE1BQU0sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUFDLENBQUM7SUFDbEQsRUFBRSxDQUFDLENBQUMsT0FBTyxNQUFNLENBQUMsR0FBRyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDckMsTUFBTSxrQkFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUEsU0FBUyxJQUFJLE9BQUEscUJBQXFCLENBQUMsU0FBUyxFQUFFLEVBQUUsT0FBTyxTQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxFQUFwRCxDQUFvRCxDQUFDLEVBQUc7SUFDOUYsQ0FBQztJQUNELElBQUksU0FBUyx3QkFBUSxNQUFNLENBQUUsQ0FBQztJQUM5QixJQUFNLFdBQVcsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRTFGLEVBQUUsQ0FBQyxDQUFDLE9BQU8sU0FBUyxDQUFDLE9BQU8sS0FBSyxRQUFRO1FBQ3ZD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RyxDQUFDLElBQUksT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLFVBQ3BELENBQUMsQ0FBQyxDQUFDO1lBQ0QsSUFBTSxRQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsUUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDMUQscUJBQXFCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxTQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxFQURyQixDQUNxQixDQUNsRSxDQUFDO1lBQ0YsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQU0sQ0FBQztRQUMxQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUNSLENBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLHNCQUFzQjtZQUNsRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNuRCxDQUFDLENBQUMsQ0FBQztZQUNELFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxPQUFPLFNBQUEsRUFBRSxLQUFLLE9BQUEsRUFBRSxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUwsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7QUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcblxuLyoqXG4gKiAnY29udmVydFNjaGVtYVRvRHJhZnQ2JyBmdW5jdGlvblxuICpcbiAqIENvbnZlcnRzIGEgSlNPTiBTY2hlbWEgZnJvbSBkcmFmdCAxIHRocm91Z2ggNCBmb3JtYXQgdG8gZHJhZnQgNiBmb3JtYXRcbiAqXG4gKiBJbnNwaXJlZCBieSBvbiBnZXJhaW50bHVmZidzIEpTT04gU2NoZW1hIDMgdG8gNCBjb21wYXRpYmlsaXR5IGZ1bmN0aW9uOlxuICogICBodHRwczovL2dpdGh1Yi5jb20vZ2VyYWludGx1ZmYvanNvbi1zY2hlbWEtY29tcGF0aWJpbGl0eVxuICogQWxzbyB1c2VzIHN1Z2dlc3Rpb25zIGZyb20gQUpWJ3MgSlNPTiBTY2hlbWEgNCB0byA2IG1pZ3JhdGlvbiBndWlkZTpcbiAqICAgaHR0cHM6Ly9naXRodWIuY29tL2Vwb2JlcmV6a2luL2Fqdi9yZWxlYXNlcy90YWcvNS4wLjBcbiAqIEFuZCBhZGRpdGlvbmFsIGRldGFpbHMgZnJvbSB0aGUgb2ZmaWNpYWwgSlNPTiBTY2hlbWEgZG9jdW1lbnRhdGlvbjpcbiAqICAgaHR0cDovL2pzb24tc2NoZW1hLm9yZ1xuICpcbiAqIC8vICB7IG9iamVjdCB9IG9yaWdpbmFsU2NoZW1hIC0gSlNPTiBzY2hlbWEgKGRyYWZ0IDEsIDIsIDMsIDQsIG9yIDYpXG4gKiAvLyAgeyBPcHRpb25PYmplY3QgPSB7fSB9IG9wdGlvbnMgLSBvcHRpb25zOiBwYXJlbnQgc2NoZW1hIGNoYW5nZWQ/LCBzY2hlbWEgZHJhZnQgbnVtYmVyP1xuICogLy8geyBvYmplY3QgfSAtIEpTT04gc2NoZW1hIChkcmFmdCA2KVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbk9iamVjdCB7IGNoYW5nZWQ/OiBib29sZWFuLCBkcmFmdD86IG51bWJlciB9O1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRTY2hlbWFUb0RyYWZ0NihzY2hlbWEsIG9wdGlvbnM6IE9wdGlvbk9iamVjdCA9IHt9KSB7XG4gIGxldCBkcmFmdDogbnVtYmVyID0gb3B0aW9ucy5kcmFmdCB8fCBudWxsO1xuICBsZXQgY2hhbmdlZDogYm9vbGVhbiA9IG9wdGlvbnMuY2hhbmdlZCB8fCBmYWxzZTtcblxuICBpZiAodHlwZW9mIHNjaGVtYSAhPT0gJ29iamVjdCcpIHsgcmV0dXJuIHNjaGVtYTsgfVxuICBpZiAodHlwZW9mIHNjaGVtYS5tYXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gWyAuLi5zY2hlbWEubWFwKHN1YlNjaGVtYSA9PiBjb252ZXJ0U2NoZW1hVG9EcmFmdDYoc3ViU2NoZW1hLCB7IGNoYW5nZWQsIGRyYWZ0IH0pKSBdO1xuICB9XG4gIGxldCBuZXdTY2hlbWEgPSB7IC4uLnNjaGVtYSB9O1xuICBjb25zdCBzaW1wbGVUeXBlcyA9IFsnYXJyYXknLCAnYm9vbGVhbicsICdpbnRlZ2VyJywgJ251bGwnLCAnbnVtYmVyJywgJ29iamVjdCcsICdzdHJpbmcnXTtcblxuICBpZiAodHlwZW9mIG5ld1NjaGVtYS4kc2NoZW1hID09PSAnc3RyaW5nJyAmJlxuICAgIC9odHRwXFw6XFwvXFwvanNvblxcLXNjaGVtYVxcLm9yZ1xcL2RyYWZ0XFwtMFxcZFxcL3NjaGVtYVxcIy8udGVzdChuZXdTY2hlbWEuJHNjaGVtYSlcbiAgKSB7XG4gICAgZHJhZnQgPSBuZXdTY2hlbWEuJHNjaGVtYVszMF07XG4gIH1cblxuICAvLyBDb252ZXJ0IHYxLXYyICdjb250ZW50RW5jb2RpbmcnIHRvICdtZWRpYS5iaW5hcnlFbmNvZGluZydcbiAgLy8gTm90ZTogVGhpcyBpcyBvbmx5IHVzZWQgaW4gSlNPTiBoeXBlci1zY2hlbWEgKG5vdCByZWd1bGFyIEpTT04gc2NoZW1hKVxuICBpZiAobmV3U2NoZW1hLmNvbnRlbnRFbmNvZGluZykge1xuICAgIG5ld1NjaGVtYS5tZWRpYSA9IHsgYmluYXJ5RW5jb2Rpbmc6IG5ld1NjaGVtYS5jb250ZW50RW5jb2RpbmcgfTtcbiAgICBkZWxldGUgbmV3U2NoZW1hLmNvbnRlbnRFbmNvZGluZztcbiAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIENvbnZlcnQgdjEtdjMgJ2V4dGVuZHMnIHRvICdhbGxPZidcbiAgaWYgKHR5cGVvZiBuZXdTY2hlbWEuZXh0ZW5kcyA9PT0gJ29iamVjdCcpIHtcbiAgICBuZXdTY2hlbWEuYWxsT2YgPSB0eXBlb2YgbmV3U2NoZW1hLmV4dGVuZHMubWFwID09PSAnZnVuY3Rpb24nID9cbiAgICAgIG5ld1NjaGVtYS5leHRlbmRzLm1hcChzdWJTY2hlbWEgPT4gY29udmVydFNjaGVtYVRvRHJhZnQ2KHN1YlNjaGVtYSwgeyBjaGFuZ2VkLCBkcmFmdCB9KSkgOlxuICAgICAgWyBjb252ZXJ0U2NoZW1hVG9EcmFmdDYobmV3U2NoZW1hLmV4dGVuZHMsIHsgY2hhbmdlZCwgZHJhZnQgfSkgXTtcbiAgICBkZWxldGUgbmV3U2NoZW1hLmV4dGVuZHM7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gIH1cblxuICAvLyBDb252ZXJ0IHYxLXYzICdkaXNhbGxvdycgdG8gJ25vdCdcbiAgaWYgKG5ld1NjaGVtYS5kaXNhbGxvdykge1xuICAgIGlmICh0eXBlb2YgbmV3U2NoZW1hLmRpc2FsbG93ID09PSAnc3RyaW5nJykge1xuICAgICAgbmV3U2NoZW1hLm5vdCA9IHsgdHlwZTogbmV3U2NoZW1hLmRpc2FsbG93IH07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmV3U2NoZW1hLmRpc2FsbG93Lm1hcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbmV3U2NoZW1hLm5vdCA9IHtcbiAgICAgICAgYW55T2Y6IG5ld1NjaGVtYS5kaXNhbGxvd1xuICAgICAgICAgIC5tYXAodHlwZSA9PiB0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcgPyB0eXBlIDogeyB0eXBlIH0pXG4gICAgICB9O1xuICAgIH1cbiAgICBkZWxldGUgbmV3U2NoZW1hLmRpc2FsbG93O1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICB9XG5cbiAgLy8gQ29udmVydCB2MyBzdHJpbmcgJ2RlcGVuZGVuY2llcycgcHJvcGVydGllcyB0byBhcnJheXNcbiAgaWYgKHR5cGVvZiBuZXdTY2hlbWEuZGVwZW5kZW5jaWVzID09PSAnb2JqZWN0JyAmJlxuICAgIE9iamVjdC5rZXlzKG5ld1NjaGVtYS5kZXBlbmRlbmNpZXMpXG4gICAgICAuc29tZShrZXkgPT4gdHlwZW9mIG5ld1NjaGVtYS5kZXBlbmRlbmNpZXNba2V5XSA9PT0gJ3N0cmluZycpXG4gICkge1xuICAgIG5ld1NjaGVtYS5kZXBlbmRlbmNpZXMgPSB7IC4uLm5ld1NjaGVtYS5kZXBlbmRlbmNpZXMgfTtcbiAgICBPYmplY3Qua2V5cyhuZXdTY2hlbWEuZGVwZW5kZW5jaWVzKVxuICAgICAgLmZpbHRlcihrZXkgPT4gdHlwZW9mIG5ld1NjaGVtYS5kZXBlbmRlbmNpZXNba2V5XSA9PT0gJ3N0cmluZycpXG4gICAgICAuZm9yRWFjaChrZXkgPT4gbmV3U2NoZW1hLmRlcGVuZGVuY2llc1trZXldID0gWyBuZXdTY2hlbWEuZGVwZW5kZW5jaWVzW2tleV0gXSk7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gIH1cblxuICAvLyBDb252ZXJ0IHYxICdtYXhEZWNpbWFsJyB0byAnbXVsdGlwbGVPZidcbiAgaWYgKHR5cGVvZiBuZXdTY2hlbWEubWF4RGVjaW1hbCA9PT0gJ251bWJlcicpIHtcbiAgICBuZXdTY2hlbWEubXVsdGlwbGVPZiA9IDEgLyBNYXRoLnBvdygxMCwgbmV3U2NoZW1hLm1heERlY2ltYWwpO1xuICAgIGRlbGV0ZSBuZXdTY2hlbWEuZGl2aXNpYmxlQnk7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgaWYgKCFkcmFmdCB8fCBkcmFmdCA9PT0gMikgeyBkcmFmdCA9IDE7IH1cbiAgfVxuXG4gIC8vIENvbnZlcnQgdjItdjMgJ2RpdmlzaWJsZUJ5JyB0byAnbXVsdGlwbGVPZidcbiAgaWYgKHR5cGVvZiBuZXdTY2hlbWEuZGl2aXNpYmxlQnkgPT09ICdudW1iZXInKSB7XG4gICAgbmV3U2NoZW1hLm11bHRpcGxlT2YgPSBuZXdTY2hlbWEuZGl2aXNpYmxlQnk7XG4gICAgZGVsZXRlIG5ld1NjaGVtYS5kaXZpc2libGVCeTtcbiAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIENvbnZlcnQgdjEtdjIgYm9vbGVhbiAnbWluaW11bUNhbkVxdWFsJyB0byAnZXhjbHVzaXZlTWluaW11bSdcbiAgaWYgKHR5cGVvZiBuZXdTY2hlbWEubWluaW11bSA9PT0gJ251bWJlcicgJiYgbmV3U2NoZW1hLm1pbmltdW1DYW5FcXVhbCA9PT0gZmFsc2UpIHtcbiAgICBuZXdTY2hlbWEuZXhjbHVzaXZlTWluaW11bSA9IG5ld1NjaGVtYS5taW5pbXVtO1xuICAgIGRlbGV0ZSBuZXdTY2hlbWEubWluaW11bTtcbiAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICBpZiAoIWRyYWZ0KSB7IGRyYWZ0ID0gMjsgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBuZXdTY2hlbWEubWluaW11bUNhbkVxdWFsID09PSAnYm9vbGVhbicpIHtcbiAgICBkZWxldGUgbmV3U2NoZW1hLm1pbmltdW1DYW5FcXVhbDtcbiAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICBpZiAoIWRyYWZ0KSB7IGRyYWZ0ID0gMjsgfVxuICB9XG5cbiAgLy8gQ29udmVydCB2My12NCBib29sZWFuICdleGNsdXNpdmVNaW5pbXVtJyB0byBudW1lcmljXG4gIGlmICh0eXBlb2YgbmV3U2NoZW1hLm1pbmltdW0gPT09ICdudW1iZXInICYmIG5ld1NjaGVtYS5leGNsdXNpdmVNaW5pbXVtID09PSB0cnVlKSB7XG4gICAgbmV3U2NoZW1hLmV4Y2x1c2l2ZU1pbmltdW0gPSBuZXdTY2hlbWEubWluaW11bTtcbiAgICBkZWxldGUgbmV3U2NoZW1hLm1pbmltdW07XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG5ld1NjaGVtYS5leGNsdXNpdmVNaW5pbXVtID09PSAnYm9vbGVhbicpIHtcbiAgICBkZWxldGUgbmV3U2NoZW1hLmV4Y2x1c2l2ZU1pbmltdW07XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gIH1cblxuICAvLyBDb252ZXJ0IHYxLXYyIGJvb2xlYW4gJ21heGltdW1DYW5FcXVhbCcgdG8gJ2V4Y2x1c2l2ZU1heGltdW0nXG4gIGlmICh0eXBlb2YgbmV3U2NoZW1hLm1heGltdW0gPT09ICdudW1iZXInICYmIG5ld1NjaGVtYS5tYXhpbXVtQ2FuRXF1YWwgPT09IGZhbHNlKSB7XG4gICAgbmV3U2NoZW1hLmV4Y2x1c2l2ZU1heGltdW0gPSBuZXdTY2hlbWEubWF4aW11bTtcbiAgICBkZWxldGUgbmV3U2NoZW1hLm1heGltdW07XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgaWYgKCFkcmFmdCkgeyBkcmFmdCA9IDI7IH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgbmV3U2NoZW1hLm1heGltdW1DYW5FcXVhbCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgZGVsZXRlIG5ld1NjaGVtYS5tYXhpbXVtQ2FuRXF1YWw7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgaWYgKCFkcmFmdCkgeyBkcmFmdCA9IDI7IH1cbiAgfVxuXG4gIC8vIENvbnZlcnQgdjMtdjQgYm9vbGVhbiAnZXhjbHVzaXZlTWF4aW11bScgdG8gbnVtZXJpY1xuICBpZiAodHlwZW9mIG5ld1NjaGVtYS5tYXhpbXVtID09PSAnbnVtYmVyJyAmJiBuZXdTY2hlbWEuZXhjbHVzaXZlTWF4aW11bSA9PT0gdHJ1ZSkge1xuICAgIG5ld1NjaGVtYS5leGNsdXNpdmVNYXhpbXVtID0gbmV3U2NoZW1hLm1heGltdW07XG4gICAgZGVsZXRlIG5ld1NjaGVtYS5tYXhpbXVtO1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBuZXdTY2hlbWEuZXhjbHVzaXZlTWF4aW11bSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgZGVsZXRlIG5ld1NjaGVtYS5leGNsdXNpdmVNYXhpbXVtO1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICB9XG5cbiAgLy8gU2VhcmNoIG9iamVjdCAncHJvcGVydGllcycgZm9yICdvcHRpb25hbCcsICdyZXF1aXJlZCcsIGFuZCAncmVxdWlyZXMnIGl0ZW1zLFxuICAvLyBhbmQgY29udmVydCB0aGVtIGludG8gb2JqZWN0ICdyZXF1aXJlZCcgYXJyYXlzIGFuZCAnZGVwZW5kZW5jaWVzJyBvYmplY3RzXG4gIGlmICh0eXBlb2YgbmV3U2NoZW1hLnByb3BlcnRpZXMgPT09ICdvYmplY3QnKSB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHsgLi4ubmV3U2NoZW1hLnByb3BlcnRpZXMgfTtcbiAgICBjb25zdCByZXF1aXJlZEtleXMgPSBBcnJheS5pc0FycmF5KG5ld1NjaGVtYS5yZXF1aXJlZCkgP1xuICAgICAgbmV3IFNldChuZXdTY2hlbWEucmVxdWlyZWQpIDogbmV3IFNldCgpO1xuXG4gICAgLy8gQ29udmVydCB2MS12MiBib29sZWFuICdvcHRpb25hbCcgcHJvcGVydGllcyB0byAncmVxdWlyZWQnIGFycmF5XG4gICAgaWYgKGRyYWZ0ID09PSAxIHx8IGRyYWZ0ID09PSAyIHx8XG4gICAgICBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5zb21lKGtleSA9PiBwcm9wZXJ0aWVzW2tleV0ub3B0aW9uYWwgPT09IHRydWUpXG4gICAgKSB7XG4gICAgICBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKVxuICAgICAgICAuZmlsdGVyKGtleSA9PiBwcm9wZXJ0aWVzW2tleV0ub3B0aW9uYWwgIT09IHRydWUpXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiByZXF1aXJlZEtleXMuYWRkKGtleSkpO1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICBpZiAoIWRyYWZ0KSB7IGRyYWZ0ID0gMjsgfVxuICAgIH1cblxuICAgIC8vIENvbnZlcnQgdjMgYm9vbGVhbiAncmVxdWlyZWQnIHByb3BlcnRpZXMgdG8gJ3JlcXVpcmVkJyBhcnJheVxuICAgIGlmIChPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5zb21lKGtleSA9PiBwcm9wZXJ0aWVzW2tleV0ucmVxdWlyZWQgPT09IHRydWUpKSB7XG4gICAgICBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKVxuICAgICAgICAuZmlsdGVyKGtleSA9PiBwcm9wZXJ0aWVzW2tleV0ucmVxdWlyZWQgPT09IHRydWUpXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiByZXF1aXJlZEtleXMuYWRkKGtleSkpO1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHJlcXVpcmVkS2V5cy5zaXplKSB7IG5ld1NjaGVtYS5yZXF1aXJlZCA9IEFycmF5LmZyb20ocmVxdWlyZWRLZXlzKTsgfVxuXG4gICAgLy8gQ29udmVydCB2MS12MiBhcnJheSBvciBzdHJpbmcgJ3JlcXVpcmVzJyBwcm9wZXJ0aWVzIHRvICdkZXBlbmRlbmNpZXMnIG9iamVjdFxuICAgIGlmIChPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5zb21lKGtleSA9PiBwcm9wZXJ0aWVzW2tleV0ucmVxdWlyZXMpKSB7XG4gICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSB0eXBlb2YgbmV3U2NoZW1hLmRlcGVuZGVuY2llcyA9PT0gJ29iamVjdCcgP1xuICAgICAgICB7IC4uLm5ld1NjaGVtYS5kZXBlbmRlbmNpZXMgfSA6IHt9O1xuICAgICAgT2JqZWN0LmtleXMocHJvcGVydGllcylcbiAgICAgICAgLmZpbHRlcihrZXkgPT4gcHJvcGVydGllc1trZXldLnJlcXVpcmVzKVxuICAgICAgICAuZm9yRWFjaChrZXkgPT4gZGVwZW5kZW5jaWVzW2tleV0gPVxuICAgICAgICAgIHR5cGVvZiBwcm9wZXJ0aWVzW2tleV0ucmVxdWlyZXMgPT09ICdzdHJpbmcnID9cbiAgICAgICAgICAgIFsgcHJvcGVydGllc1trZXldLnJlcXVpcmVzIF0gOiBwcm9wZXJ0aWVzW2tleV0ucmVxdWlyZXNcbiAgICAgICAgKTtcbiAgICAgIG5ld1NjaGVtYS5kZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXM7XG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIGlmICghZHJhZnQpIHsgZHJhZnQgPSAyOyB9XG4gICAgfVxuXG4gICAgbmV3U2NoZW1hLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuICB9XG5cbiAgLy8gUmV2b3ZlIHYxLXYyIGJvb2xlYW4gJ29wdGlvbmFsJyBrZXlcbiAgaWYgKHR5cGVvZiBuZXdTY2hlbWEub3B0aW9uYWwgPT09ICdib29sZWFuJykge1xuICAgIGRlbGV0ZSBuZXdTY2hlbWEub3B0aW9uYWw7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgaWYgKCFkcmFmdCkgeyBkcmFmdCA9IDI7IH1cbiAgfVxuXG4gIC8vIFJldm92ZSB2MS12MiAncmVxdWlyZXMnIGtleVxuICBpZiAobmV3U2NoZW1hLnJlcXVpcmVzKSB7XG4gICAgZGVsZXRlIG5ld1NjaGVtYS5yZXF1aXJlcztcbiAgfVxuXG4gIC8vIFJldm92ZSB2MyBib29sZWFuICdyZXF1aXJlZCcga2V5XG4gIGlmICh0eXBlb2YgbmV3U2NoZW1hLnJlcXVpcmVkID09PSAnYm9vbGVhbicpIHtcbiAgICBkZWxldGUgbmV3U2NoZW1hLnJlcXVpcmVkO1xuICB9XG5cbiAgLy8gQ29udmVydCBpZCB0byAkaWRcbiAgaWYgKHR5cGVvZiBuZXdTY2hlbWEuaWQgPT09ICdzdHJpbmcnICYmICFuZXdTY2hlbWEuJGlkKSB7XG4gICAgaWYgKG5ld1NjaGVtYS5pZC5zbGljZSgtMSkgPT09ICcjJykge1xuICAgICAgbmV3U2NoZW1hLmlkID0gbmV3U2NoZW1hLmlkLnNsaWNlKDAsIC0xKTtcbiAgICB9XG4gICAgbmV3U2NoZW1hLiRpZCA9IG5ld1NjaGVtYS5pZCArICctQ09OVkVSVEVELVRPLURSQUZULTA2Iyc7XG4gICAgZGVsZXRlIG5ld1NjaGVtYS5pZDtcbiAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIHYxLXYzICdhbnknIG9yIG9iamVjdCB0eXBlcyB3aWxsIGJlIGNvbnZlcnRlZFxuICBpZiAobmV3U2NoZW1hLnR5cGUgJiYgKHR5cGVvZiBuZXdTY2hlbWEudHlwZS5ldmVyeSA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgIW5ld1NjaGVtYS50eXBlLmV2ZXJ5KHR5cGUgPT4gc2ltcGxlVHlwZXMuaW5jbHVkZXModHlwZSkpIDpcbiAgICAhc2ltcGxlVHlwZXMuaW5jbHVkZXMobmV3U2NoZW1hLnR5cGUpXG4gICkpIHtcbiAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIElmIHNjaGVtYSBjaGFuZ2VkLCB1cGRhdGUgb3IgcmVtb3ZlICRzY2hlbWEgaWRlbnRpZmllclxuICBpZiAodHlwZW9mIG5ld1NjaGVtYS4kc2NoZW1hID09PSAnc3RyaW5nJyAmJlxuICAgIC9odHRwXFw6XFwvXFwvanNvblxcLXNjaGVtYVxcLm9yZ1xcL2RyYWZ0XFwtMFsxLTRdXFwvc2NoZW1hXFwjLy50ZXN0KG5ld1NjaGVtYS4kc2NoZW1hKVxuICApIHtcbiAgICBuZXdTY2hlbWEuJHNjaGVtYSA9ICdodHRwOi8vanNvbi1zY2hlbWEub3JnL2RyYWZ0LTA2L3NjaGVtYSMnO1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICB9IGVsc2UgaWYgKGNoYW5nZWQgJiYgdHlwZW9mIG5ld1NjaGVtYS4kc2NoZW1hID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IGFkZFRvRGVzY3JpcHRpb24gPSAnQ29udmVydGVkIHRvIGRyYWZ0IDYgZnJvbSAnICsgbmV3U2NoZW1hLiRzY2hlbWE7XG4gICAgaWYgKHR5cGVvZiBuZXdTY2hlbWEuZGVzY3JpcHRpb24gPT09ICdzdHJpbmcnICYmIG5ld1NjaGVtYS5kZXNjcmlwdGlvbi5sZW5ndGgpIHtcbiAgICAgIG5ld1NjaGVtYS5kZXNjcmlwdGlvbiArPSAnXFxuJyArIGFkZFRvRGVzY3JpcHRpb247XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1NjaGVtYS5kZXNjcmlwdGlvbiA9IGFkZFRvRGVzY3JpcHRpb25cbiAgICB9XG4gICAgZGVsZXRlIG5ld1NjaGVtYS4kc2NoZW1hO1xuICB9XG5cbiAgLy8gQ29udmVydCB2MS12MyAnYW55JyBhbmQgb2JqZWN0IHR5cGVzXG4gIGlmIChuZXdTY2hlbWEudHlwZSAmJiAodHlwZW9mIG5ld1NjaGVtYS50eXBlLmV2ZXJ5ID09PSAnZnVuY3Rpb24nID9cbiAgICAhbmV3U2NoZW1hLnR5cGUuZXZlcnkodHlwZSA9PiBzaW1wbGVUeXBlcy5pbmNsdWRlcyh0eXBlKSkgOlxuICAgICFzaW1wbGVUeXBlcy5pbmNsdWRlcyhuZXdTY2hlbWEudHlwZSlcbiAgKSkge1xuICAgIGlmIChuZXdTY2hlbWEudHlwZS5sZW5ndGggPT09IDEpIHsgbmV3U2NoZW1hLnR5cGUgPSBuZXdTY2hlbWEudHlwZVswXTsgfVxuICAgIGlmICh0eXBlb2YgbmV3U2NoZW1hLnR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBDb252ZXJ0IHN0cmluZyAnYW55JyB0eXBlIHRvIGFycmF5IG9mIGFsbCBzdGFuZGFyZCB0eXBlc1xuICAgICAgaWYgKG5ld1NjaGVtYS50eXBlID09PSAnYW55Jykge1xuICAgICAgICBuZXdTY2hlbWEudHlwZSA9IHNpbXBsZVR5cGVzO1xuICAgICAgLy8gRGVsZXRlIG5vbi1zdGFuZGFyZCBzdHJpbmcgdHlwZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIG5ld1NjaGVtYS50eXBlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG5ld1NjaGVtYS50eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHR5cGVvZiBuZXdTY2hlbWEudHlwZS5ldmVyeSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBJZiBhcnJheSBvZiBzdHJpbmdzLCBvbmx5IGFsbG93IHN0YW5kYXJkIHR5cGVzXG4gICAgICAgIGlmIChuZXdTY2hlbWEudHlwZS5ldmVyeSh0eXBlID0+IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJykpIHtcbiAgICAgICAgICBuZXdTY2hlbWEudHlwZSA9IG5ld1NjaGVtYS50eXBlLnNvbWUodHlwZSA9PiB0eXBlID09PSAnYW55JykgP1xuICAgICAgICAgICAgbmV3U2NoZW1hLnR5cGUgPSBzaW1wbGVUeXBlcyA6XG4gICAgICAgICAgICBuZXdTY2hlbWEudHlwZS5maWx0ZXIodHlwZSA9PiBzaW1wbGVUeXBlcy5pbmNsdWRlcyh0eXBlKSk7XG4gICAgICAgIC8vIElmIHR5cGUgaXMgYW4gYXJyYXkgd2l0aCBvYmplY3RzLCBjb252ZXJ0IHRoZSBjdXJyZW50IHNjaGVtYSB0byBhbiAnYW55T2YnIGFycmF5XG4gICAgICAgIH0gZWxzZSBpZiAobmV3U2NoZW1hLnR5cGUubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGNvbnN0IGFycmF5S2V5cyA9IFsgJ2FkZGl0aW9uYWxJdGVtcycsICdpdGVtcycsICdtYXhJdGVtcycsICdtaW5JdGVtcycsICd1bmlxdWVJdGVtcycsICdjb250YWlucyddO1xuICAgICAgICAgIGNvbnN0IG51bWJlcktleXMgPSBbICdtdWx0aXBsZU9mJywgJ21heGltdW0nLCAnZXhjbHVzaXZlTWF4aW11bScsICdtaW5pbXVtJywgJ2V4Y2x1c2l2ZU1pbmltdW0nXTtcbiAgICAgICAgICBjb25zdCBvYmplY3RLZXlzID0gWyAnbWF4UHJvcGVydGllcycsICdtaW5Qcm9wZXJ0aWVzJywgJ3JlcXVpcmVkJywgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJyxcbiAgICAgICAgICAgICdwcm9wZXJ0aWVzJywgJ3BhdHRlcm5Qcm9wZXJ0aWVzJywgJ2RlcGVuZGVuY2llcycsICdwcm9wZXJ0eU5hbWVzJ107XG4gICAgICAgICAgY29uc3Qgc3RyaW5nS2V5cyA9IFsgJ21heExlbmd0aCcsICdtaW5MZW5ndGgnLCAncGF0dGVybicsICdmb3JtYXQnXTtcbiAgICAgICAgICBjb25zdCBmaWx0ZXJLZXlzID0ge1xuICAgICAgICAgICAgJ2FycmF5JzogICBbIC4uLm51bWJlcktleXMsIC4uLm9iamVjdEtleXMsIC4uLnN0cmluZ0tleXMgXSxcbiAgICAgICAgICAgICdpbnRlZ2VyJzogWyAgLi4uYXJyYXlLZXlzLCAuLi5vYmplY3RLZXlzLCAuLi5zdHJpbmdLZXlzIF0sXG4gICAgICAgICAgICAnbnVtYmVyJzogIFsgIC4uLmFycmF5S2V5cywgLi4ub2JqZWN0S2V5cywgLi4uc3RyaW5nS2V5cyBdLFxuICAgICAgICAgICAgJ29iamVjdCc6ICBbICAuLi5hcnJheUtleXMsIC4uLm51bWJlcktleXMsIC4uLnN0cmluZ0tleXMgXSxcbiAgICAgICAgICAgICdzdHJpbmcnOiAgWyAgLi4uYXJyYXlLZXlzLCAuLi5udW1iZXJLZXlzLCAuLi5vYmplY3RLZXlzIF0sXG4gICAgICAgICAgICAnYWxsJzogICAgIFsgIC4uLmFycmF5S2V5cywgLi4ubnVtYmVyS2V5cywgLi4ub2JqZWN0S2V5cywgLi4uc3RyaW5nS2V5cyBdLFxuICAgICAgICAgIH07XG4gICAgICAgICAgY29uc3QgYW55T2YgPSBbXTtcbiAgICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgbmV3U2NoZW1hLnR5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1R5cGUgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB7IHR5cGUgfSA6IHsgLi4udHlwZSB9O1xuICAgICAgICAgICAgT2JqZWN0LmtleXMobmV3U2NoZW1hKVxuICAgICAgICAgICAgICAuZmlsdGVyKGtleSA9PiAhbmV3VHlwZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmXG4gICAgICAgICAgICAgICAgIVsgLi4uKGZpbHRlcktleXNbbmV3VHlwZS50eXBlXSB8fCBmaWx0ZXJLZXlzLmFsbCksICd0eXBlJywgJ2RlZmF1bHQnIF1cbiAgICAgICAgICAgICAgICAgIC5pbmNsdWRlcyhrZXkpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgLmZvckVhY2goa2V5ID0+IG5ld1R5cGVba2V5XSA9IG5ld1NjaGVtYVtrZXldKTtcbiAgICAgICAgICAgIGFueU9mLnB1c2gobmV3VHlwZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld1NjaGVtYSA9IG5ld1NjaGVtYS5oYXNPd25Qcm9wZXJ0eSgnZGVmYXVsdCcpID9cbiAgICAgICAgICAgIHsgYW55T2YsIGRlZmF1bHQ6IG5ld1NjaGVtYS5kZWZhdWx0IH0gOiB7IGFueU9mIH07XG4gICAgICAgIC8vIElmIHR5cGUgaXMgYW4gb2JqZWN0LCBtZXJnZSBpdCB3aXRoIHRoZSBjdXJyZW50IHNjaGVtYVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHR5cGVTY2hlbWEgPSBuZXdTY2hlbWEudHlwZTtcbiAgICAgICAgICBkZWxldGUgbmV3U2NoZW1hLnR5cGU7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihuZXdTY2hlbWEsIHR5cGVTY2hlbWEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBuZXdTY2hlbWEudHlwZTtcbiAgICB9XG4gIH1cblxuICAvLyBDb252ZXJ0IHN1YiBzY2hlbWFzXG4gIE9iamVjdC5rZXlzKG5ld1NjaGVtYSlcbiAgICAuZmlsdGVyKGtleSA9PiB0eXBlb2YgbmV3U2NoZW1hW2tleV0gPT09ICdvYmplY3QnKVxuICAgIC5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIFsgJ2RlZmluaXRpb25zJywgJ2RlcGVuZGVuY2llcycsICdwcm9wZXJ0aWVzJywgJ3BhdHRlcm5Qcm9wZXJ0aWVzJyBdXG4gICAgICAgICAgLmluY2x1ZGVzKGtleSkgJiYgdHlwZW9mIG5ld1NjaGVtYVtrZXldLm1hcCAhPT0gJ2Z1bmN0aW9uJ1xuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IG5ld0tleSA9IHt9O1xuICAgICAgICBPYmplY3Qua2V5cyhuZXdTY2hlbWFba2V5XSkuZm9yRWFjaChzdWJLZXkgPT4gbmV3S2V5W3N1YktleV0gPVxuICAgICAgICAgIGNvbnZlcnRTY2hlbWFUb0RyYWZ0NihuZXdTY2hlbWFba2V5XVtzdWJLZXldLCB7IGNoYW5nZWQsIGRyYWZ0IH0pXG4gICAgICAgICk7XG4gICAgICAgIG5ld1NjaGVtYVtrZXldID0gbmV3S2V5O1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgWyAnaXRlbXMnLCAnYWRkaXRpb25hbEl0ZW1zJywgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJyxcbiAgICAgICAgICAnYWxsT2YnLCAnYW55T2YnLCAnb25lT2YnLCAnbm90JyBdLmluY2x1ZGVzKGtleSlcbiAgICAgICkge1xuICAgICAgICBuZXdTY2hlbWFba2V5XSA9IGNvbnZlcnRTY2hlbWFUb0RyYWZ0NihuZXdTY2hlbWFba2V5XSwgeyBjaGFuZ2VkLCBkcmFmdCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1NjaGVtYVtrZXldID0gXy5jbG9uZURlZXAobmV3U2NoZW1hW2tleV0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIHJldHVybiBuZXdTY2hlbWE7XG59XG4iXX0=