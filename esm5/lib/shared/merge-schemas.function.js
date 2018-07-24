import * as tslib_1 from "tslib";
import * as _ from 'lodash';
import { isArray, isEmpty, isNumber, isObject, isString } from './validator.functions';
import { hasOwn, uniqueItems, commonItems } from './utility.functions';
/**
 * 'mergeSchemas' function
 *
 * Merges multiple JSON schemas into a single schema with combined rules.
 *
 * If able to logically merge properties from all schemas,
 * returns a single schema object containing all merged properties.
 *
 * Example: ({ a: b, max: 1 }, { c: d, max: 2 }) => { a: b, c: d, max: 1 }
 *
 * If unable to logically merge, returns an allOf schema object containing
 * an array of the original schemas;
 *
 * Example: ({ a: b }, { a: d }) => { allOf: [ { a: b }, { a: d } ] }
 *
 * //   schemas - one or more input schemas
 * //  - merged schema
 */
export function mergeSchemas() {
    var schemas = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        schemas[_i] = arguments[_i];
    }
    schemas = schemas.filter(function (schema) { return !isEmpty(schema); });
    if (schemas.some(function (schema) { return !isObject(schema); })) {
        return null;
    }
    var combinedSchema = {};
    try {
        for (var schemas_1 = tslib_1.__values(schemas), schemas_1_1 = schemas_1.next(); !schemas_1_1.done; schemas_1_1 = schemas_1.next()) {
            var schema = schemas_1_1.value;
            var _loop_1 = function (key) {
                var combinedValue = combinedSchema[key];
                var schemaValue = schema[key];
                if (!hasOwn(combinedSchema, key) || _.isEqual(combinedValue, schemaValue)) {
                    combinedSchema[key] = schemaValue;
                }
                else {
                    switch (key) {
                        case 'allOf':
                            // Combine all items from both arrays
                            if (isArray(combinedValue) && isArray(schemaValue)) {
                                combinedSchema.allOf = mergeSchemas.apply(void 0, tslib_1.__spread(combinedValue, schemaValue));
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'additionalItems':
                        case 'additionalProperties':
                        case 'contains':
                        case 'propertyNames':
                            // Merge schema objects
                            if (isObject(combinedValue) && isObject(schemaValue)) {
                                combinedSchema[key] = mergeSchemas(combinedValue, schemaValue);
                                // additionalProperties == false in any schema overrides all other values
                            }
                            else if (key === 'additionalProperties' &&
                                (combinedValue === false || schemaValue === false)) {
                                combinedSchema.combinedSchema = false;
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'anyOf':
                        case 'oneOf':
                        case 'enum':
                            // Keep only items that appear in both arrays
                            if (isArray(combinedValue) && isArray(schemaValue)) {
                                combinedSchema[key] = combinedValue.filter(function (item1) {
                                    return schemaValue.findIndex(function (item2) { return _.isEqual(item1, item2); }) > -1;
                                });
                                if (!combinedSchema[key].length) {
                                    return { value: { allOf: tslib_1.__spread(schemas) } };
                                }
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'definitions':
                            // Combine keys from both objects
                            if (isObject(combinedValue) && isObject(schemaValue)) {
                                var combinedObject = tslib_1.__assign({}, combinedValue);
                                try {
                                    for (var _a = tslib_1.__values(Object.keys(schemaValue)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                        var subKey = _b.value;
                                        if (!hasOwn(combinedObject, subKey) ||
                                            _.isEqual(combinedObject[subKey], schemaValue[subKey])) {
                                            combinedObject[subKey] = schemaValue[subKey];
                                            // Don't combine matching keys with different values
                                        }
                                        else {
                                            return { value: { allOf: tslib_1.__spread(schemas) } };
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
                                combinedSchema.definitions = combinedObject;
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'dependencies':
                            // Combine all keys from both objects
                            // and merge schemas on matching keys,
                            // converting from arrays to objects if necessary
                            if (isObject(combinedValue) && isObject(schemaValue)) {
                                var combinedObject = tslib_1.__assign({}, combinedValue);
                                try {
                                    for (var _d = tslib_1.__values(Object.keys(schemaValue)), _e = _d.next(); !_e.done; _e = _d.next()) {
                                        var subKey = _e.value;
                                        if (!hasOwn(combinedObject, subKey) ||
                                            _.isEqual(combinedObject[subKey], schemaValue[subKey])) {
                                            combinedObject[subKey] = schemaValue[subKey];
                                            // If both keys are arrays, include all items from both arrays,
                                            // excluding duplicates
                                        }
                                        else if (isArray(schemaValue[subKey]) && isArray(combinedObject[subKey])) {
                                            combinedObject[subKey] = uniqueItems.apply(void 0, tslib_1.__spread(combinedObject[subKey], schemaValue[subKey]));
                                            // If either key is an object, merge the schemas
                                        }
                                        else if ((isArray(schemaValue[subKey]) || isObject(schemaValue[subKey])) &&
                                            (isArray(combinedObject[subKey]) || isObject(combinedObject[subKey]))) {
                                            // If either key is an array, convert it to an object first
                                            var required = isArray(combinedSchema.required) ?
                                                combinedSchema.required : [];
                                            var combinedDependency = isArray(combinedObject[subKey]) ?
                                                { required: uniqueItems.apply(void 0, tslib_1.__spread(required, [combinedObject[subKey]])) } :
                                                combinedObject[subKey];
                                            var schemaDependency = isArray(schemaValue[subKey]) ?
                                                { required: uniqueItems.apply(void 0, tslib_1.__spread(required, [schemaValue[subKey]])) } :
                                                schemaValue[subKey];
                                            combinedObject[subKey] =
                                                mergeSchemas(combinedDependency, schemaDependency);
                                        }
                                        else {
                                            return { value: { allOf: tslib_1.__spread(schemas) } };
                                        }
                                    }
                                }
                                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                finally {
                                    try {
                                        if (_e && !_e.done && (_f = _d.return)) _f.call(_d);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                }
                                combinedSchema.dependencies = combinedObject;
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'items':
                            // If arrays, keep only items that appear in both arrays
                            if (isArray(combinedValue) && isArray(schemaValue)) {
                                combinedSchema.items = combinedValue.filter(function (item1) {
                                    return schemaValue.findIndex(function (item2) { return _.isEqual(item1, item2); }) > -1;
                                });
                                if (!combinedSchema.items.length) {
                                    return { value: { allOf: tslib_1.__spread(schemas) } };
                                }
                                // If both keys are objects, merge them
                            }
                            else if (isObject(combinedValue) && isObject(schemaValue)) {
                                combinedSchema.items = mergeSchemas(combinedValue, schemaValue);
                                // If object + array, combine object with each array item
                            }
                            else if (isArray(combinedValue) && isObject(schemaValue)) {
                                combinedSchema.items =
                                    combinedValue.map(function (item) { return mergeSchemas(item, schemaValue); });
                            }
                            else if (isObject(combinedValue) && isArray(schemaValue)) {
                                combinedSchema.items =
                                    schemaValue.map(function (item) { return mergeSchemas(item, combinedValue); });
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'multipleOf':
                            // TODO: Adjust to correctly handle decimal values
                            // If numbers, set to least common multiple
                            if (isNumber(combinedValue) && isNumber(schemaValue)) {
                                var gcd_1 = function (x, y) { return !y ? x : gcd_1(y, x % y); };
                                var lcm = function (x, y) { return (x * y) / gcd_1(x, y); };
                                combinedSchema.multipleOf = lcm(combinedValue, schemaValue);
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'maximum':
                        case 'exclusiveMaximum':
                        case 'maxLength':
                        case 'maxItems':
                        case 'maxProperties':
                            // If numbers, set to lowest value
                            if (isNumber(combinedValue) && isNumber(schemaValue)) {
                                combinedSchema[key] = Math.min(combinedValue, schemaValue);
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'minimum':
                        case 'exclusiveMinimum':
                        case 'minLength':
                        case 'minItems':
                        case 'minProperties':
                            // If numbers, set to highest value
                            if (isNumber(combinedValue) && isNumber(schemaValue)) {
                                combinedSchema[key] = Math.max(combinedValue, schemaValue);
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'not':
                            // Combine not values into anyOf array
                            if (isObject(combinedValue) && isObject(schemaValue)) {
                                var notAnyOf = [combinedValue, schemaValue]
                                    .reduce(function (notAnyOfArray, notSchema) {
                                    return isArray(notSchema.anyOf) &&
                                        Object.keys(notSchema).length === 1 ? tslib_1.__spread(notAnyOfArray, notSchema.anyOf) : tslib_1.__spread(notAnyOfArray, [notSchema]);
                                }, []);
                                // TODO: Remove duplicate items from array
                                combinedSchema.not = { anyOf: notAnyOf };
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'patternProperties':
                            // Combine all keys from both objects
                            // and merge schemas on matching keys
                            if (isObject(combinedValue) && isObject(schemaValue)) {
                                var combinedObject = tslib_1.__assign({}, combinedValue);
                                try {
                                    for (var _g = tslib_1.__values(Object.keys(schemaValue)), _h = _g.next(); !_h.done; _h = _g.next()) {
                                        var subKey = _h.value;
                                        if (!hasOwn(combinedObject, subKey) ||
                                            _.isEqual(combinedObject[subKey], schemaValue[subKey])) {
                                            combinedObject[subKey] = schemaValue[subKey];
                                            // If both keys are objects, merge them
                                        }
                                        else if (isObject(schemaValue[subKey]) && isObject(combinedObject[subKey])) {
                                            combinedObject[subKey] =
                                                mergeSchemas(combinedObject[subKey], schemaValue[subKey]);
                                        }
                                        else {
                                            return { value: { allOf: tslib_1.__spread(schemas) } };
                                        }
                                    }
                                }
                                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                finally {
                                    try {
                                        if (_h && !_h.done && (_j = _g.return)) _j.call(_g);
                                    }
                                    finally { if (e_3) throw e_3.error; }
                                }
                                combinedSchema.patternProperties = combinedObject;
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'properties':
                            // Combine all keys from both objects
                            // unless additionalProperties === false
                            // and merge schemas on matching keys
                            if (isObject(combinedValue) && isObject(schemaValue)) {
                                var combinedObject_1 = tslib_1.__assign({}, combinedValue);
                                // If new schema has additionalProperties,
                                // merge or remove non-matching property keys in combined schema
                                if (hasOwn(schemaValue, 'additionalProperties')) {
                                    Object.keys(combinedValue)
                                        .filter(function (combinedKey) { return !Object.keys(schemaValue).includes(combinedKey); })
                                        .forEach(function (nonMatchingKey) {
                                        if (schemaValue.additionalProperties === false) {
                                            delete combinedObject_1[nonMatchingKey];
                                        }
                                        else if (isObject(schemaValue.additionalProperties)) {
                                            combinedObject_1[nonMatchingKey] = mergeSchemas(combinedObject_1[nonMatchingKey], schemaValue.additionalProperties);
                                        }
                                    });
                                }
                                try {
                                    for (var _k = tslib_1.__values(Object.keys(schemaValue)), _l = _k.next(); !_l.done; _l = _k.next()) {
                                        var subKey = _l.value;
                                        if (_.isEqual(combinedObject_1[subKey], schemaValue[subKey]) || (!hasOwn(combinedObject_1, subKey) &&
                                            !hasOwn(combinedObject_1, 'additionalProperties'))) {
                                            combinedObject_1[subKey] = schemaValue[subKey];
                                            // If combined schema has additionalProperties,
                                            // merge or ignore non-matching property keys in new schema
                                        }
                                        else if (!hasOwn(combinedObject_1, subKey) &&
                                            hasOwn(combinedObject_1, 'additionalProperties')) {
                                            // If combinedObject.additionalProperties === false,
                                            // do nothing (don't set key)
                                            // If additionalProperties is object, merge with new key
                                            if (isObject(combinedObject_1.additionalProperties)) {
                                                combinedObject_1[subKey] = mergeSchemas(combinedObject_1.additionalProperties, schemaValue[subKey]);
                                            }
                                            // If both keys are objects, merge them
                                        }
                                        else if (isObject(schemaValue[subKey]) &&
                                            isObject(combinedObject_1[subKey])) {
                                            combinedObject_1[subKey] =
                                                mergeSchemas(combinedObject_1[subKey], schemaValue[subKey]);
                                        }
                                        else {
                                            return { value: { allOf: tslib_1.__spread(schemas) } };
                                        }
                                    }
                                }
                                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                                finally {
                                    try {
                                        if (_l && !_l.done && (_m = _k.return)) _m.call(_k);
                                    }
                                    finally { if (e_4) throw e_4.error; }
                                }
                                combinedSchema.properties = combinedObject_1;
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'required':
                            // If arrays, include all items from both arrays, excluding duplicates
                            if (isArray(combinedValue) && isArray(schemaValue)) {
                                combinedSchema.required = uniqueItems.apply(void 0, tslib_1.__spread(combinedValue, schemaValue));
                                // If booleans, aet true if either true
                            }
                            else if (typeof schemaValue === 'boolean' &&
                                typeof combinedValue === 'boolean') {
                                combinedSchema.required = !!combinedValue || !!schemaValue;
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case '$schema':
                        case '$id':
                        case 'id':
                            // Don't combine these keys
                            break;
                        case 'title':
                        case 'description':
                            // Return the last value, overwriting any previous one
                            // These properties are not used for validation, so conflicts don't matter
                            combinedSchema[key] = schemaValue;
                            break;
                        case 'type':
                            if ((isArray(schemaValue) || isString(schemaValue)) &&
                                (isArray(combinedValue) || isString(combinedValue))) {
                                var combinedTypes = commonItems(combinedValue, schemaValue);
                                if (!combinedTypes.length) {
                                    return { value: { allOf: tslib_1.__spread(schemas) } };
                                }
                                combinedSchema.type = combinedTypes.length > 1 ? combinedTypes : combinedTypes[0];
                            }
                            else {
                                return { value: { allOf: tslib_1.__spread(schemas) } };
                            }
                            break;
                        case 'uniqueItems':
                            // Set true if either true
                            combinedSchema.uniqueItems = !!combinedValue || !!schemaValue;
                            break;
                        default: return { value: { allOf: tslib_1.__spread(schemas) } };
                    }
                }
                var e_1, _c, e_2, _f, e_3, _j, e_4, _m;
            };
            try {
                for (var _a = tslib_1.__values(Object.keys(schema)), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var key = _b.value;
                    var state_1 = _loop_1(key);
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_5) throw e_5.error; }
            }
        }
    }
    catch (e_6_1) { e_6 = { error: e_6_1 }; }
    finally {
        try {
            if (schemas_1_1 && !schemas_1_1.done && (_d = schemas_1.return)) _d.call(schemas_1);
        }
        finally { if (e_6) throw e_6.error; }
    }
    return combinedSchema;
    var e_6, _d, e_5, _c;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2Utc2NoZW1hcy5mdW5jdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvc2hhcmVkL21lcmdlLXNjaGVtYXMuZnVuY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxDQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTVCLE9BQU8sRUFDTCxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUMvQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBR3ZFOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNILE1BQU07SUFBdUIsaUJBQVU7U0FBVixVQUFVLEVBQVYscUJBQVUsRUFBVixJQUFVO1FBQVYsNEJBQVU7O0lBQ3JDLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQztJQUNyRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQWpCLENBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQUMsQ0FBQztJQUMvRCxJQUFNLGNBQWMsR0FBUSxFQUFFLENBQUM7O1FBQy9CLEdBQUcsQ0FBQyxDQUFpQixJQUFBLFlBQUEsaUJBQUEsT0FBTyxDQUFBLGdDQUFBO1lBQXZCLElBQU0sTUFBTSxvQkFBQTtvQ0FDSixHQUFHO2dCQUNaLElBQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDMUMsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLEdB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YyxDQUFDOztBQUN4QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQge1xuICBpc0FycmF5LCBpc0VtcHR5LCBpc051bWJlciwgaXNPYmplY3QsIGlzU3RyaW5nXG59IGZyb20gJy4vdmFsaWRhdG9yLmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBoYXNPd24sIHVuaXF1ZUl0ZW1zLCBjb21tb25JdGVtcyB9IGZyb20gJy4vdXRpbGl0eS5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgSnNvblBvaW50ZXIsIFBvaW50ZXIgfSBmcm9tICcuL2pzb25wb2ludGVyLmZ1bmN0aW9ucyc7XG5cbi8qKlxuICogJ21lcmdlU2NoZW1hcycgZnVuY3Rpb25cbiAqXG4gKiBNZXJnZXMgbXVsdGlwbGUgSlNPTiBzY2hlbWFzIGludG8gYSBzaW5nbGUgc2NoZW1hIHdpdGggY29tYmluZWQgcnVsZXMuXG4gKlxuICogSWYgYWJsZSB0byBsb2dpY2FsbHkgbWVyZ2UgcHJvcGVydGllcyBmcm9tIGFsbCBzY2hlbWFzLFxuICogcmV0dXJucyBhIHNpbmdsZSBzY2hlbWEgb2JqZWN0IGNvbnRhaW5pbmcgYWxsIG1lcmdlZCBwcm9wZXJ0aWVzLlxuICpcbiAqIEV4YW1wbGU6ICh7IGE6IGIsIG1heDogMSB9LCB7IGM6IGQsIG1heDogMiB9KSA9PiB7IGE6IGIsIGM6IGQsIG1heDogMSB9XG4gKlxuICogSWYgdW5hYmxlIHRvIGxvZ2ljYWxseSBtZXJnZSwgcmV0dXJucyBhbiBhbGxPZiBzY2hlbWEgb2JqZWN0IGNvbnRhaW5pbmdcbiAqIGFuIGFycmF5IG9mIHRoZSBvcmlnaW5hbCBzY2hlbWFzO1xuICpcbiAqIEV4YW1wbGU6ICh7IGE6IGIgfSwgeyBhOiBkIH0pID0+IHsgYWxsT2Y6IFsgeyBhOiBiIH0sIHsgYTogZCB9IF0gfVxuICpcbiAqIC8vICAgc2NoZW1hcyAtIG9uZSBvciBtb3JlIGlucHV0IHNjaGVtYXNcbiAqIC8vICAtIG1lcmdlZCBzY2hlbWFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlU2NoZW1hcyguLi5zY2hlbWFzKSB7XG4gIHNjaGVtYXMgPSBzY2hlbWFzLmZpbHRlcihzY2hlbWEgPT4gIWlzRW1wdHkoc2NoZW1hKSk7XG4gIGlmIChzY2hlbWFzLnNvbWUoc2NoZW1hID0+ICFpc09iamVjdChzY2hlbWEpKSkgeyByZXR1cm4gbnVsbDsgfVxuICBjb25zdCBjb21iaW5lZFNjaGVtYTogYW55ID0ge307XG4gIGZvciAoY29uc3Qgc2NoZW1hIG9mIHNjaGVtYXMpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhzY2hlbWEpKSB7XG4gICAgICBjb25zdCBjb21iaW5lZFZhbHVlID0gY29tYmluZWRTY2hlbWFba2V5XTtcbiAgICAgIGNvbnN0IHNjaGVtYVZhbHVlID0gc2NoZW1hW2tleV07XG4gICAgICBpZiAoIWhhc093bihjb21iaW5lZFNjaGVtYSwga2V5KSB8fCBfLmlzRXF1YWwoY29tYmluZWRWYWx1ZSwgc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgIGNvbWJpbmVkU2NoZW1hW2tleV0gPSBzY2hlbWFWYWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgY2FzZSAnYWxsT2YnOlxuICAgICAgICAgICAgLy8gQ29tYmluZSBhbGwgaXRlbXMgZnJvbSBib3RoIGFycmF5c1xuICAgICAgICAgICAgaWYgKGlzQXJyYXkoY29tYmluZWRWYWx1ZSkgJiYgaXNBcnJheShzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWEuYWxsT2YgPSBtZXJnZVNjaGVtYXMoLi4uY29tYmluZWRWYWx1ZSwgLi4uc2NoZW1hVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnYWRkaXRpb25hbEl0ZW1zJzogY2FzZSAnYWRkaXRpb25hbFByb3BlcnRpZXMnOlxuICAgICAgICAgIGNhc2UgJ2NvbnRhaW5zJzogY2FzZSAncHJvcGVydHlOYW1lcyc6XG4gICAgICAgICAgICAvLyBNZXJnZSBzY2hlbWEgb2JqZWN0c1xuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KGNvbWJpbmVkVmFsdWUpICYmIGlzT2JqZWN0KHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYVtrZXldID0gbWVyZ2VTY2hlbWFzKGNvbWJpbmVkVmFsdWUsIHNjaGVtYVZhbHVlKTtcbiAgICAgICAgICAgIC8vIGFkZGl0aW9uYWxQcm9wZXJ0aWVzID09IGZhbHNlIGluIGFueSBzY2hlbWEgb3ZlcnJpZGVzIGFsbCBvdGhlciB2YWx1ZXNcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgIGtleSA9PT0gJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJyAmJlxuICAgICAgICAgICAgICAoY29tYmluZWRWYWx1ZSA9PT0gZmFsc2UgfHwgc2NoZW1hVmFsdWUgPT09IGZhbHNlKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLmNvbWJpbmVkU2NoZW1hID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdhbnlPZic6IGNhc2UgJ29uZU9mJzogY2FzZSAnZW51bSc6XG4gICAgICAgICAgICAvLyBLZWVwIG9ubHkgaXRlbXMgdGhhdCBhcHBlYXIgaW4gYm90aCBhcnJheXNcbiAgICAgICAgICAgIGlmIChpc0FycmF5KGNvbWJpbmVkVmFsdWUpICYmIGlzQXJyYXkoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hW2tleV0gPSBjb21iaW5lZFZhbHVlLmZpbHRlcihpdGVtMSA9PlxuICAgICAgICAgICAgICAgIHNjaGVtYVZhbHVlLmZpbmRJbmRleChpdGVtMiA9PiBfLmlzRXF1YWwoaXRlbTEsIGl0ZW0yKSkgPiAtMVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpZiAoIWNvbWJpbmVkU2NoZW1hW2tleV0ubGVuZ3RoKSB7IHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9OyB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkZWZpbml0aW9ucyc6XG4gICAgICAgICAgICAvLyBDb21iaW5lIGtleXMgZnJvbSBib3RoIG9iamVjdHNcbiAgICAgICAgICAgIGlmIChpc09iamVjdChjb21iaW5lZFZhbHVlKSAmJiBpc09iamVjdChzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29tYmluZWRPYmplY3QgPSB7IC4uLmNvbWJpbmVkVmFsdWUgfTtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJLZXkgb2YgT2JqZWN0LmtleXMoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNPd24oY29tYmluZWRPYmplY3QsIHN1YktleSkgfHxcbiAgICAgICAgICAgICAgICAgIF8uaXNFcXVhbChjb21iaW5lZE9iamVjdFtzdWJLZXldLCBzY2hlbWFWYWx1ZVtzdWJLZXldKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgY29tYmluZWRPYmplY3Rbc3ViS2V5XSA9IHNjaGVtYVZhbHVlW3N1YktleV07XG4gICAgICAgICAgICAgICAgLy8gRG9uJ3QgY29tYmluZSBtYXRjaGluZyBrZXlzIHdpdGggZGlmZmVyZW50IHZhbHVlc1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWEuZGVmaW5pdGlvbnMgPSBjb21iaW5lZE9iamVjdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2RlcGVuZGVuY2llcyc6XG4gICAgICAgICAgICAvLyBDb21iaW5lIGFsbCBrZXlzIGZyb20gYm90aCBvYmplY3RzXG4gICAgICAgICAgICAvLyBhbmQgbWVyZ2Ugc2NoZW1hcyBvbiBtYXRjaGluZyBrZXlzLFxuICAgICAgICAgICAgLy8gY29udmVydGluZyBmcm9tIGFycmF5cyB0byBvYmplY3RzIGlmIG5lY2Vzc2FyeVxuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KGNvbWJpbmVkVmFsdWUpICYmIGlzT2JqZWN0KHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICBjb25zdCBjb21iaW5lZE9iamVjdCA9IHsgLi4uY29tYmluZWRWYWx1ZSB9O1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YktleSBvZiBPYmplY3Qua2V5cyhzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc093bihjb21iaW5lZE9iamVjdCwgc3ViS2V5KSB8fFxuICAgICAgICAgICAgICAgICAgXy5pc0VxdWFsKGNvbWJpbmVkT2JqZWN0W3N1YktleV0sIHNjaGVtYVZhbHVlW3N1YktleV0pXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICBjb21iaW5lZE9iamVjdFtzdWJLZXldID0gc2NoZW1hVmFsdWVbc3ViS2V5XTtcbiAgICAgICAgICAgICAgICAvLyBJZiBib3RoIGtleXMgYXJlIGFycmF5cywgaW5jbHVkZSBhbGwgaXRlbXMgZnJvbSBib3RoIGFycmF5cyxcbiAgICAgICAgICAgICAgICAvLyBleGNsdWRpbmcgZHVwbGljYXRlc1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICBpc0FycmF5KHNjaGVtYVZhbHVlW3N1YktleV0pICYmIGlzQXJyYXkoY29tYmluZWRPYmplY3Rbc3ViS2V5XSlcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIGNvbWJpbmVkT2JqZWN0W3N1YktleV0gPVxuICAgICAgICAgICAgICAgICAgICB1bmlxdWVJdGVtcyguLi5jb21iaW5lZE9iamVjdFtzdWJLZXldLCAuLi5zY2hlbWFWYWx1ZVtzdWJLZXldKTtcbiAgICAgICAgICAgICAgICAvLyBJZiBlaXRoZXIga2V5IGlzIGFuIG9iamVjdCwgbWVyZ2UgdGhlIHNjaGVtYXNcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgKGlzQXJyYXkoc2NoZW1hVmFsdWVbc3ViS2V5XSkgfHwgaXNPYmplY3Qoc2NoZW1hVmFsdWVbc3ViS2V5XSkpICYmXG4gICAgICAgICAgICAgICAgICAoaXNBcnJheShjb21iaW5lZE9iamVjdFtzdWJLZXldKSB8fCBpc09iamVjdChjb21iaW5lZE9iamVjdFtzdWJLZXldKSlcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIC8vIElmIGVpdGhlciBrZXkgaXMgYW4gYXJyYXksIGNvbnZlcnQgaXQgdG8gYW4gb2JqZWN0IGZpcnN0XG4gICAgICAgICAgICAgICAgICBjb25zdCByZXF1aXJlZCA9IGlzQXJyYXkoY29tYmluZWRTY2hlbWEucmVxdWlyZWQpID9cbiAgICAgICAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWEucmVxdWlyZWQgOiBbXTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkRGVwZW5kZW5jeSA9IGlzQXJyYXkoY29tYmluZWRPYmplY3Rbc3ViS2V5XSkgP1xuICAgICAgICAgICAgICAgICAgICB7IHJlcXVpcmVkOiB1bmlxdWVJdGVtcyguLi5yZXF1aXJlZCwgY29tYmluZWRPYmplY3Rbc3ViS2V5XSkgfSA6XG4gICAgICAgICAgICAgICAgICAgIGNvbWJpbmVkT2JqZWN0W3N1YktleV07XG4gICAgICAgICAgICAgICAgICBjb25zdCBzY2hlbWFEZXBlbmRlbmN5ID0gaXNBcnJheShzY2hlbWFWYWx1ZVtzdWJLZXldKSA/XG4gICAgICAgICAgICAgICAgICAgIHsgcmVxdWlyZWQ6IHVuaXF1ZUl0ZW1zKC4uLnJlcXVpcmVkLCBzY2hlbWFWYWx1ZVtzdWJLZXldKSB9IDpcbiAgICAgICAgICAgICAgICAgICAgc2NoZW1hVmFsdWVbc3ViS2V5XTtcbiAgICAgICAgICAgICAgICAgIGNvbWJpbmVkT2JqZWN0W3N1YktleV0gPVxuICAgICAgICAgICAgICAgICAgICBtZXJnZVNjaGVtYXMoY29tYmluZWREZXBlbmRlbmN5LCBzY2hlbWFEZXBlbmRlbmN5KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLmRlcGVuZGVuY2llcyA9IGNvbWJpbmVkT2JqZWN0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnaXRlbXMnOlxuICAgICAgICAgICAgLy8gSWYgYXJyYXlzLCBrZWVwIG9ubHkgaXRlbXMgdGhhdCBhcHBlYXIgaW4gYm90aCBhcnJheXNcbiAgICAgICAgICAgIGlmIChpc0FycmF5KGNvbWJpbmVkVmFsdWUpICYmIGlzQXJyYXkoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLml0ZW1zID0gY29tYmluZWRWYWx1ZS5maWx0ZXIoaXRlbTEgPT5cbiAgICAgICAgICAgICAgICBzY2hlbWFWYWx1ZS5maW5kSW5kZXgoaXRlbTIgPT4gXy5pc0VxdWFsKGl0ZW0xLCBpdGVtMikpID4gLTFcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgaWYgKCFjb21iaW5lZFNjaGVtYS5pdGVtcy5sZW5ndGgpIHsgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07IH1cbiAgICAgICAgICAgIC8vIElmIGJvdGgga2V5cyBhcmUgb2JqZWN0cywgbWVyZ2UgdGhlbVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdChjb21iaW5lZFZhbHVlKSAmJiBpc09iamVjdChzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWEuaXRlbXMgPSBtZXJnZVNjaGVtYXMoY29tYmluZWRWYWx1ZSwgc2NoZW1hVmFsdWUpO1xuICAgICAgICAgICAgLy8gSWYgb2JqZWN0ICsgYXJyYXksIGNvbWJpbmUgb2JqZWN0IHdpdGggZWFjaCBhcnJheSBpdGVtXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoY29tYmluZWRWYWx1ZSkgJiYgaXNPYmplY3Qoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLml0ZW1zID1cbiAgICAgICAgICAgICAgICBjb21iaW5lZFZhbHVlLm1hcChpdGVtID0+IG1lcmdlU2NoZW1hcyhpdGVtLCBzY2hlbWFWYWx1ZSkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdChjb21iaW5lZFZhbHVlKSAmJiBpc0FycmF5KHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYS5pdGVtcyA9XG4gICAgICAgICAgICAgICAgc2NoZW1hVmFsdWUubWFwKGl0ZW0gPT4gbWVyZ2VTY2hlbWFzKGl0ZW0sIGNvbWJpbmVkVmFsdWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ211bHRpcGxlT2YnOlxuICAgICAgICAgICAgLy8gVE9ETzogQWRqdXN0IHRvIGNvcnJlY3RseSBoYW5kbGUgZGVjaW1hbCB2YWx1ZXNcbiAgICAgICAgICAgIC8vIElmIG51bWJlcnMsIHNldCB0byBsZWFzdCBjb21tb24gbXVsdGlwbGVcbiAgICAgICAgICAgIGlmIChpc051bWJlcihjb21iaW5lZFZhbHVlKSAmJiBpc051bWJlcihzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgZ2NkID0gKHgsIHkpID0+ICF5ID8geCA6IGdjZCh5LCB4ICUgeSk7XG4gICAgICAgICAgICAgIGNvbnN0IGxjbSA9ICh4LCB5KSA9PiAoeCAqIHkpIC8gZ2NkKHgsIHkpO1xuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYS5tdWx0aXBsZU9mID0gbGNtKGNvbWJpbmVkVmFsdWUsIHNjaGVtYVZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ21heGltdW0nOiBjYXNlICdleGNsdXNpdmVNYXhpbXVtJzogY2FzZSAnbWF4TGVuZ3RoJzpcbiAgICAgICAgICBjYXNlICdtYXhJdGVtcyc6IGNhc2UgJ21heFByb3BlcnRpZXMnOlxuICAgICAgICAgICAgLy8gSWYgbnVtYmVycywgc2V0IHRvIGxvd2VzdCB2YWx1ZVxuICAgICAgICAgICAgaWYgKGlzTnVtYmVyKGNvbWJpbmVkVmFsdWUpICYmIGlzTnVtYmVyKHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYVtrZXldID0gTWF0aC5taW4oY29tYmluZWRWYWx1ZSwgc2NoZW1hVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbWluaW11bSc6IGNhc2UgJ2V4Y2x1c2l2ZU1pbmltdW0nOiBjYXNlICdtaW5MZW5ndGgnOlxuICAgICAgICAgIGNhc2UgJ21pbkl0ZW1zJzogY2FzZSAnbWluUHJvcGVydGllcyc6XG4gICAgICAgICAgICAvLyBJZiBudW1iZXJzLCBzZXQgdG8gaGlnaGVzdCB2YWx1ZVxuICAgICAgICAgICAgaWYgKGlzTnVtYmVyKGNvbWJpbmVkVmFsdWUpICYmIGlzTnVtYmVyKHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYVtrZXldID0gTWF0aC5tYXgoY29tYmluZWRWYWx1ZSwgc2NoZW1hVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbm90JzpcbiAgICAgICAgICAgIC8vIENvbWJpbmUgbm90IHZhbHVlcyBpbnRvIGFueU9mIGFycmF5XG4gICAgICAgICAgICBpZiAoaXNPYmplY3QoY29tYmluZWRWYWx1ZSkgJiYgaXNPYmplY3Qoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5vdEFueU9mID0gW2NvbWJpbmVkVmFsdWUsIHNjaGVtYVZhbHVlXVxuICAgICAgICAgICAgICAgIC5yZWR1Y2UoKG5vdEFueU9mQXJyYXksIG5vdFNjaGVtYSkgPT5cbiAgICAgICAgICAgICAgICAgIGlzQXJyYXkobm90U2NoZW1hLmFueU9mKSAmJlxuICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMobm90U2NoZW1hKS5sZW5ndGggPT09IDEgP1xuICAgICAgICAgICAgICAgICAgICBbIC4uLm5vdEFueU9mQXJyYXksIC4uLm5vdFNjaGVtYS5hbnlPZiBdIDpcbiAgICAgICAgICAgICAgICAgICAgWyAuLi5ub3RBbnlPZkFycmF5LCBub3RTY2hlbWEgXVxuICAgICAgICAgICAgICAgICwgW10pO1xuICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZHVwbGljYXRlIGl0ZW1zIGZyb20gYXJyYXlcbiAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWEubm90ID0geyBhbnlPZjogbm90QW55T2YgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3BhdHRlcm5Qcm9wZXJ0aWVzJzpcbiAgICAgICAgICAgIC8vIENvbWJpbmUgYWxsIGtleXMgZnJvbSBib3RoIG9iamVjdHNcbiAgICAgICAgICAgIC8vIGFuZCBtZXJnZSBzY2hlbWFzIG9uIG1hdGNoaW5nIGtleXNcbiAgICAgICAgICAgIGlmIChpc09iamVjdChjb21iaW5lZFZhbHVlKSAmJiBpc09iamVjdChzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29tYmluZWRPYmplY3QgPSB7IC4uLmNvbWJpbmVkVmFsdWUgfTtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJLZXkgb2YgT2JqZWN0LmtleXMoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNPd24oY29tYmluZWRPYmplY3QsIHN1YktleSkgfHxcbiAgICAgICAgICAgICAgICAgIF8uaXNFcXVhbChjb21iaW5lZE9iamVjdFtzdWJLZXldLCBzY2hlbWFWYWx1ZVtzdWJLZXldKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgY29tYmluZWRPYmplY3Rbc3ViS2V5XSA9IHNjaGVtYVZhbHVlW3N1YktleV07XG4gICAgICAgICAgICAgICAgLy8gSWYgYm90aCBrZXlzIGFyZSBvYmplY3RzLCBtZXJnZSB0aGVtXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgIGlzT2JqZWN0KHNjaGVtYVZhbHVlW3N1YktleV0pICYmIGlzT2JqZWN0KGNvbWJpbmVkT2JqZWN0W3N1YktleV0pXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICBjb21iaW5lZE9iamVjdFtzdWJLZXldID1cbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VTY2hlbWFzKGNvbWJpbmVkT2JqZWN0W3N1YktleV0sIHNjaGVtYVZhbHVlW3N1YktleV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWEucGF0dGVyblByb3BlcnRpZXMgPSBjb21iaW5lZE9iamVjdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3Byb3BlcnRpZXMnOlxuICAgICAgICAgICAgLy8gQ29tYmluZSBhbGwga2V5cyBmcm9tIGJvdGggb2JqZWN0c1xuICAgICAgICAgICAgLy8gdW5sZXNzIGFkZGl0aW9uYWxQcm9wZXJ0aWVzID09PSBmYWxzZVxuICAgICAgICAgICAgLy8gYW5kIG1lcmdlIHNjaGVtYXMgb24gbWF0Y2hpbmcga2V5c1xuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KGNvbWJpbmVkVmFsdWUpICYmIGlzT2JqZWN0KHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICBjb25zdCBjb21iaW5lZE9iamVjdCA9IHsgLi4uY29tYmluZWRWYWx1ZSB9O1xuICAgICAgICAgICAgICAvLyBJZiBuZXcgc2NoZW1hIGhhcyBhZGRpdGlvbmFsUHJvcGVydGllcyxcbiAgICAgICAgICAgICAgLy8gbWVyZ2Ugb3IgcmVtb3ZlIG5vbi1tYXRjaGluZyBwcm9wZXJ0eSBrZXlzIGluIGNvbWJpbmVkIHNjaGVtYVxuICAgICAgICAgICAgICBpZiAoaGFzT3duKHNjaGVtYVZhbHVlLCAnYWRkaXRpb25hbFByb3BlcnRpZXMnKSkge1xuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbWJpbmVkVmFsdWUpXG4gICAgICAgICAgICAgICAgICAuZmlsdGVyKGNvbWJpbmVkS2V5ID0+ICFPYmplY3Qua2V5cyhzY2hlbWFWYWx1ZSkuaW5jbHVkZXMoY29tYmluZWRLZXkpKVxuICAgICAgICAgICAgICAgICAgLmZvckVhY2gobm9uTWF0Y2hpbmdLZXkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2NoZW1hVmFsdWUuYWRkaXRpb25hbFByb3BlcnRpZXMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNvbWJpbmVkT2JqZWN0W25vbk1hdGNoaW5nS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdChzY2hlbWFWYWx1ZS5hZGRpdGlvbmFsUHJvcGVydGllcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb21iaW5lZE9iamVjdFtub25NYXRjaGluZ0tleV0gPSBtZXJnZVNjaGVtYXMoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21iaW5lZE9iamVjdFtub25NYXRjaGluZ0tleV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2hlbWFWYWx1ZS5hZGRpdGlvbmFsUHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViS2V5IG9mIE9iamVjdC5rZXlzKHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmIChfLmlzRXF1YWwoY29tYmluZWRPYmplY3Rbc3ViS2V5XSwgc2NoZW1hVmFsdWVbc3ViS2V5XSkgfHwgKFxuICAgICAgICAgICAgICAgICAgIWhhc093bihjb21iaW5lZE9iamVjdCwgc3ViS2V5KSAmJlxuICAgICAgICAgICAgICAgICAgIWhhc093bihjb21iaW5lZE9iamVjdCwgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJylcbiAgICAgICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgICBjb21iaW5lZE9iamVjdFtzdWJLZXldID0gc2NoZW1hVmFsdWVbc3ViS2V5XTtcbiAgICAgICAgICAgICAgICAvLyBJZiBjb21iaW5lZCBzY2hlbWEgaGFzIGFkZGl0aW9uYWxQcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIC8vIG1lcmdlIG9yIGlnbm9yZSBub24tbWF0Y2hpbmcgcHJvcGVydHkga2V5cyBpbiBuZXcgc2NoZW1hXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICFoYXNPd24oY29tYmluZWRPYmplY3QsIHN1YktleSkgJiZcbiAgICAgICAgICAgICAgICAgIGhhc093bihjb21iaW5lZE9iamVjdCwgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJylcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIC8vIElmIGNvbWJpbmVkT2JqZWN0LmFkZGl0aW9uYWxQcm9wZXJ0aWVzID09PSBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIC8vIGRvIG5vdGhpbmcgKGRvbid0IHNldCBrZXkpXG4gICAgICAgICAgICAgICAgICAvLyBJZiBhZGRpdGlvbmFsUHJvcGVydGllcyBpcyBvYmplY3QsIG1lcmdlIHdpdGggbmV3IGtleVxuICAgICAgICAgICAgICAgICAgaWYgKGlzT2JqZWN0KGNvbWJpbmVkT2JqZWN0LmFkZGl0aW9uYWxQcm9wZXJ0aWVzKSkge1xuICAgICAgICAgICAgICAgICAgICBjb21iaW5lZE9iamVjdFtzdWJLZXldID0gbWVyZ2VTY2hlbWFzKFxuICAgICAgICAgICAgICAgICAgICAgIGNvbWJpbmVkT2JqZWN0LmFkZGl0aW9uYWxQcm9wZXJ0aWVzLCBzY2hlbWFWYWx1ZVtzdWJLZXldXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSWYgYm90aCBrZXlzIGFyZSBvYmplY3RzLCBtZXJnZSB0aGVtXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgIGlzT2JqZWN0KHNjaGVtYVZhbHVlW3N1YktleV0pICYmXG4gICAgICAgICAgICAgICAgICBpc09iamVjdChjb21iaW5lZE9iamVjdFtzdWJLZXldKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgY29tYmluZWRPYmplY3Rbc3ViS2V5XSA9XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlU2NoZW1hcyhjb21iaW5lZE9iamVjdFtzdWJLZXldLCBzY2hlbWFWYWx1ZVtzdWJLZXldKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLnByb3BlcnRpZXMgPSBjb21iaW5lZE9iamVjdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3JlcXVpcmVkJzpcbiAgICAgICAgICAgIC8vIElmIGFycmF5cywgaW5jbHVkZSBhbGwgaXRlbXMgZnJvbSBib3RoIGFycmF5cywgZXhjbHVkaW5nIGR1cGxpY2F0ZXNcbiAgICAgICAgICAgIGlmIChpc0FycmF5KGNvbWJpbmVkVmFsdWUpICYmIGlzQXJyYXkoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLnJlcXVpcmVkID0gdW5pcXVlSXRlbXMoLi4uY29tYmluZWRWYWx1ZSwgLi4uc2NoZW1hVmFsdWUpO1xuICAgICAgICAgICAgLy8gSWYgYm9vbGVhbnMsIGFldCB0cnVlIGlmIGVpdGhlciB0cnVlXG4gICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICB0eXBlb2Ygc2NoZW1hVmFsdWUgPT09ICdib29sZWFuJyAmJlxuICAgICAgICAgICAgICB0eXBlb2YgY29tYmluZWRWYWx1ZSA9PT0gJ2Jvb2xlYW4nXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWEucmVxdWlyZWQgPSAhIWNvbWJpbmVkVmFsdWUgfHwgISFzY2hlbWFWYWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJyRzY2hlbWEnOiBjYXNlICckaWQnOiBjYXNlICdpZCc6XG4gICAgICAgICAgICAvLyBEb24ndCBjb21iaW5lIHRoZXNlIGtleXNcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd0aXRsZSc6IGNhc2UgJ2Rlc2NyaXB0aW9uJzpcbiAgICAgICAgICAgIC8vIFJldHVybiB0aGUgbGFzdCB2YWx1ZSwgb3ZlcndyaXRpbmcgYW55IHByZXZpb3VzIG9uZVxuICAgICAgICAgICAgLy8gVGhlc2UgcHJvcGVydGllcyBhcmUgbm90IHVzZWQgZm9yIHZhbGlkYXRpb24sIHNvIGNvbmZsaWN0cyBkb24ndCBtYXR0ZXJcbiAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hW2tleV0gPSBzY2hlbWFWYWx1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd0eXBlJzpcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgKGlzQXJyYXkoc2NoZW1hVmFsdWUpIHx8IGlzU3RyaW5nKHNjaGVtYVZhbHVlKSkgJiZcbiAgICAgICAgICAgICAgKGlzQXJyYXkoY29tYmluZWRWYWx1ZSkgfHwgaXNTdHJpbmcoY29tYmluZWRWYWx1ZSkpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgY29uc3QgY29tYmluZWRUeXBlcyA9IGNvbW1vbkl0ZW1zKGNvbWJpbmVkVmFsdWUsIHNjaGVtYVZhbHVlKTtcbiAgICAgICAgICAgICAgaWYgKCFjb21iaW5lZFR5cGVzLmxlbmd0aCkgeyByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTsgfVxuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYS50eXBlID0gY29tYmluZWRUeXBlcy5sZW5ndGggPiAxID8gY29tYmluZWRUeXBlcyA6IGNvbWJpbmVkVHlwZXNbMF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd1bmlxdWVJdGVtcyc6XG4gICAgICAgICAgICAvLyBTZXQgdHJ1ZSBpZiBlaXRoZXIgdHJ1ZVxuICAgICAgICAgICAgY29tYmluZWRTY2hlbWEudW5pcXVlSXRlbXMgPSAhIWNvbWJpbmVkVmFsdWUgfHwgISFzY2hlbWFWYWx1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvbWJpbmVkU2NoZW1hO1xufVxuIl19