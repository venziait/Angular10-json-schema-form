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
export function mergeSchemas(...schemas) {
    schemas = schemas.filter(schema => !isEmpty(schema));
    if (schemas.some(schema => !isObject(schema))) {
        return null;
    }
    const combinedSchema = {};
    for (const schema of schemas) {
        for (const key of Object.keys(schema)) {
            const combinedValue = combinedSchema[key];
            const schemaValue = schema[key];
            if (!hasOwn(combinedSchema, key) || _.isEqual(combinedValue, schemaValue)) {
                combinedSchema[key] = schemaValue;
            }
            else {
                switch (key) {
                    case 'allOf':
                        // Combine all items from both arrays
                        if (isArray(combinedValue) && isArray(schemaValue)) {
                            combinedSchema.allOf = mergeSchemas(...combinedValue, ...schemaValue);
                        }
                        else {
                            return { allOf: [...schemas] };
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
                            return { allOf: [...schemas] };
                        }
                        break;
                    case 'anyOf':
                    case 'oneOf':
                    case 'enum':
                        // Keep only items that appear in both arrays
                        if (isArray(combinedValue) && isArray(schemaValue)) {
                            combinedSchema[key] = combinedValue.filter(item1 => schemaValue.findIndex(item2 => _.isEqual(item1, item2)) > -1);
                            if (!combinedSchema[key].length) {
                                return { allOf: [...schemas] };
                            }
                        }
                        else {
                            return { allOf: [...schemas] };
                        }
                        break;
                    case 'definitions':
                        // Combine keys from both objects
                        if (isObject(combinedValue) && isObject(schemaValue)) {
                            const combinedObject = Object.assign({}, combinedValue);
                            for (const subKey of Object.keys(schemaValue)) {
                                if (!hasOwn(combinedObject, subKey) ||
                                    _.isEqual(combinedObject[subKey], schemaValue[subKey])) {
                                    combinedObject[subKey] = schemaValue[subKey];
                                    // Don't combine matching keys with different values
                                }
                                else {
                                    return { allOf: [...schemas] };
                                }
                            }
                            combinedSchema.definitions = combinedObject;
                        }
                        else {
                            return { allOf: [...schemas] };
                        }
                        break;
                    case 'dependencies':
                        // Combine all keys from both objects
                        // and merge schemas on matching keys,
                        // converting from arrays to objects if necessary
                        if (isObject(combinedValue) && isObject(schemaValue)) {
                            const combinedObject = Object.assign({}, combinedValue);
                            for (const subKey of Object.keys(schemaValue)) {
                                if (!hasOwn(combinedObject, subKey) ||
                                    _.isEqual(combinedObject[subKey], schemaValue[subKey])) {
                                    combinedObject[subKey] = schemaValue[subKey];
                                    // If both keys are arrays, include all items from both arrays,
                                    // excluding duplicates
                                }
                                else if (isArray(schemaValue[subKey]) && isArray(combinedObject[subKey])) {
                                    combinedObject[subKey] =
                                        uniqueItems(...combinedObject[subKey], ...schemaValue[subKey]);
                                    // If either key is an object, merge the schemas
                                }
                                else if ((isArray(schemaValue[subKey]) || isObject(schemaValue[subKey])) &&
                                    (isArray(combinedObject[subKey]) || isObject(combinedObject[subKey]))) {
                                    // If either key is an array, convert it to an object first
                                    const required = isArray(combinedSchema.required) ?
                                        combinedSchema.required : [];
                                    const combinedDependency = isArray(combinedObject[subKey]) ?
                                        { required: uniqueItems(...required, combinedObject[subKey]) } :
                                        combinedObject[subKey];
                                    const schemaDependency = isArray(schemaValue[subKey]) ?
                                        { required: uniqueItems(...required, schemaValue[subKey]) } :
                                        schemaValue[subKey];
                                    combinedObject[subKey] =
                                        mergeSchemas(combinedDependency, schemaDependency);
                                }
                                else {
                                    return { allOf: [...schemas] };
                                }
                            }
                            combinedSchema.dependencies = combinedObject;
                        }
                        else {
                            return { allOf: [...schemas] };
                        }
                        break;
                    case 'items':
                        // If arrays, keep only items that appear in both arrays
                        if (isArray(combinedValue) && isArray(schemaValue)) {
                            combinedSchema.items = combinedValue.filter(item1 => schemaValue.findIndex(item2 => _.isEqual(item1, item2)) > -1);
                            if (!combinedSchema.items.length) {
                                return { allOf: [...schemas] };
                            }
                            // If both keys are objects, merge them
                        }
                        else if (isObject(combinedValue) && isObject(schemaValue)) {
                            combinedSchema.items = mergeSchemas(combinedValue, schemaValue);
                            // If object + array, combine object with each array item
                        }
                        else if (isArray(combinedValue) && isObject(schemaValue)) {
                            combinedSchema.items =
                                combinedValue.map(item => mergeSchemas(item, schemaValue));
                        }
                        else if (isObject(combinedValue) && isArray(schemaValue)) {
                            combinedSchema.items =
                                schemaValue.map(item => mergeSchemas(item, combinedValue));
                        }
                        else {
                            return { allOf: [...schemas] };
                        }
                        break;
                    case 'multipleOf':
                        // TODO: Adjust to correctly handle decimal values
                        // If numbers, set to least common multiple
                        if (isNumber(combinedValue) && isNumber(schemaValue)) {
                            const gcd = (x, y) => !y ? x : gcd(y, x % y);
                            const lcm = (x, y) => (x * y) / gcd(x, y);
                            combinedSchema.multipleOf = lcm(combinedValue, schemaValue);
                        }
                        else {
                            return { allOf: [...schemas] };
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
                            return { allOf: [...schemas] };
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
                            return { allOf: [...schemas] };
                        }
                        break;
                    case 'not':
                        // Combine not values into anyOf array
                        if (isObject(combinedValue) && isObject(schemaValue)) {
                            const notAnyOf = [combinedValue, schemaValue]
                                .reduce((notAnyOfArray, notSchema) => isArray(notSchema.anyOf) &&
                                Object.keys(notSchema).length === 1 ?
                                [...notAnyOfArray, ...notSchema.anyOf] :
                                [...notAnyOfArray, notSchema], []);
                            // TODO: Remove duplicate items from array
                            combinedSchema.not = { anyOf: notAnyOf };
                        }
                        else {
                            return { allOf: [...schemas] };
                        }
                        break;
                    case 'patternProperties':
                        // Combine all keys from both objects
                        // and merge schemas on matching keys
                        if (isObject(combinedValue) && isObject(schemaValue)) {
                            const combinedObject = Object.assign({}, combinedValue);
                            for (const subKey of Object.keys(schemaValue)) {
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
                                    return { allOf: [...schemas] };
                                }
                            }
                            combinedSchema.patternProperties = combinedObject;
                        }
                        else {
                            return { allOf: [...schemas] };
                        }
                        break;
                    case 'properties':
                        // Combine all keys from both objects
                        // unless additionalProperties === false
                        // and merge schemas on matching keys
                        if (isObject(combinedValue) && isObject(schemaValue)) {
                            const combinedObject = Object.assign({}, combinedValue);
                            // If new schema has additionalProperties,
                            // merge or remove non-matching property keys in combined schema
                            if (hasOwn(schemaValue, 'additionalProperties')) {
                                Object.keys(combinedValue)
                                    .filter(combinedKey => !Object.keys(schemaValue).includes(combinedKey))
                                    .forEach(nonMatchingKey => {
                                    if (schemaValue.additionalProperties === false) {
                                        delete combinedObject[nonMatchingKey];
                                    }
                                    else if (isObject(schemaValue.additionalProperties)) {
                                        combinedObject[nonMatchingKey] = mergeSchemas(combinedObject[nonMatchingKey], schemaValue.additionalProperties);
                                    }
                                });
                            }
                            for (const subKey of Object.keys(schemaValue)) {
                                if (_.isEqual(combinedObject[subKey], schemaValue[subKey]) || (!hasOwn(combinedObject, subKey) &&
                                    !hasOwn(combinedObject, 'additionalProperties'))) {
                                    combinedObject[subKey] = schemaValue[subKey];
                                    // If combined schema has additionalProperties,
                                    // merge or ignore non-matching property keys in new schema
                                }
                                else if (!hasOwn(combinedObject, subKey) &&
                                    hasOwn(combinedObject, 'additionalProperties')) {
                                    // If combinedObject.additionalProperties === false,
                                    // do nothing (don't set key)
                                    // If additionalProperties is object, merge with new key
                                    if (isObject(combinedObject.additionalProperties)) {
                                        combinedObject[subKey] = mergeSchemas(combinedObject.additionalProperties, schemaValue[subKey]);
                                    }
                                    // If both keys are objects, merge them
                                }
                                else if (isObject(schemaValue[subKey]) &&
                                    isObject(combinedObject[subKey])) {
                                    combinedObject[subKey] =
                                        mergeSchemas(combinedObject[subKey], schemaValue[subKey]);
                                }
                                else {
                                    return { allOf: [...schemas] };
                                }
                            }
                            combinedSchema.properties = combinedObject;
                        }
                        else {
                            return { allOf: [...schemas] };
                        }
                        break;
                    case 'required':
                        // If arrays, include all items from both arrays, excluding duplicates
                        if (isArray(combinedValue) && isArray(schemaValue)) {
                            combinedSchema.required = uniqueItems(...combinedValue, ...schemaValue);
                            // If booleans, aet true if either true
                        }
                        else if (typeof schemaValue === 'boolean' &&
                            typeof combinedValue === 'boolean') {
                            combinedSchema.required = !!combinedValue || !!schemaValue;
                        }
                        else {
                            return { allOf: [...schemas] };
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
                            const combinedTypes = commonItems(combinedValue, schemaValue);
                            if (!combinedTypes.length) {
                                return { allOf: [...schemas] };
                            }
                            combinedSchema.type = combinedTypes.length > 1 ? combinedTypes : combinedTypes[0];
                        }
                        else {
                            return { allOf: [...schemas] };
                        }
                        break;
                    case 'uniqueItems':
                        // Set true if either true
                        combinedSchema.uniqueItems = !!combinedValue || !!schemaValue;
                        break;
                    default:
                        return { allOf: [...schemas] };
                }
            }
        }
    }
    return combinedSchema;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2Utc2NoZW1hcy5mdW5jdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvc2hhcmVkL21lcmdlLXNjaGVtYXMuZnVuY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUM7QUFFNUIsT0FBTyxFQUNMLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQy9DLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFHdkU7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBQ0gsTUFBTSx1QkFBdUIsR0FBRyxPQUFPO0lBQ3JDLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNyRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQUMsQ0FBQztJQUMvRCxNQUFNLGNBQWMsR0FBUSxFQUFFLENBQUM7SUFDL0IsR0FBRyxDQUFDLENBQUMsTUFBTSxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM3QixHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lB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YUFBYTt3QkFDaEIsMEJBQTBCO3dCQUMxQixjQUFjLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQzt3QkFDaEUsS0FBSyxDQUFDO29CQUNOO3dCQUNFLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFFLEdBQUcsT0FBTyxDQUFFLEVBQUUsQ0FBQztnQkFDckMsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUNELE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFDeEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcblxuaW1wb3J0IHtcbiAgaXNBcnJheSwgaXNFbXB0eSwgaXNOdW1iZXIsIGlzT2JqZWN0LCBpc1N0cmluZ1xufSBmcm9tICcuL3ZhbGlkYXRvci5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgaGFzT3duLCB1bmlxdWVJdGVtcywgY29tbW9uSXRlbXMgfSBmcm9tICcuL3V0aWxpdHkuZnVuY3Rpb25zJztcbmltcG9ydCB7IEpzb25Qb2ludGVyLCBQb2ludGVyIH0gZnJvbSAnLi9qc29ucG9pbnRlci5mdW5jdGlvbnMnO1xuXG4vKipcbiAqICdtZXJnZVNjaGVtYXMnIGZ1bmN0aW9uXG4gKlxuICogTWVyZ2VzIG11bHRpcGxlIEpTT04gc2NoZW1hcyBpbnRvIGEgc2luZ2xlIHNjaGVtYSB3aXRoIGNvbWJpbmVkIHJ1bGVzLlxuICpcbiAqIElmIGFibGUgdG8gbG9naWNhbGx5IG1lcmdlIHByb3BlcnRpZXMgZnJvbSBhbGwgc2NoZW1hcyxcbiAqIHJldHVybnMgYSBzaW5nbGUgc2NoZW1hIG9iamVjdCBjb250YWluaW5nIGFsbCBtZXJnZWQgcHJvcGVydGllcy5cbiAqXG4gKiBFeGFtcGxlOiAoeyBhOiBiLCBtYXg6IDEgfSwgeyBjOiBkLCBtYXg6IDIgfSkgPT4geyBhOiBiLCBjOiBkLCBtYXg6IDEgfVxuICpcbiAqIElmIHVuYWJsZSB0byBsb2dpY2FsbHkgbWVyZ2UsIHJldHVybnMgYW4gYWxsT2Ygc2NoZW1hIG9iamVjdCBjb250YWluaW5nXG4gKiBhbiBhcnJheSBvZiB0aGUgb3JpZ2luYWwgc2NoZW1hcztcbiAqXG4gKiBFeGFtcGxlOiAoeyBhOiBiIH0sIHsgYTogZCB9KSA9PiB7IGFsbE9mOiBbIHsgYTogYiB9LCB7IGE6IGQgfSBdIH1cbiAqXG4gKiAvLyAgIHNjaGVtYXMgLSBvbmUgb3IgbW9yZSBpbnB1dCBzY2hlbWFzXG4gKiAvLyAgLSBtZXJnZWQgc2NoZW1hXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVNjaGVtYXMoLi4uc2NoZW1hcykge1xuICBzY2hlbWFzID0gc2NoZW1hcy5maWx0ZXIoc2NoZW1hID0+ICFpc0VtcHR5KHNjaGVtYSkpO1xuICBpZiAoc2NoZW1hcy5zb21lKHNjaGVtYSA9PiAhaXNPYmplY3Qoc2NoZW1hKSkpIHsgcmV0dXJuIG51bGw7IH1cbiAgY29uc3QgY29tYmluZWRTY2hlbWE6IGFueSA9IHt9O1xuICBmb3IgKGNvbnN0IHNjaGVtYSBvZiBzY2hlbWFzKSB7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc2NoZW1hKSkge1xuICAgICAgY29uc3QgY29tYmluZWRWYWx1ZSA9IGNvbWJpbmVkU2NoZW1hW2tleV07XG4gICAgICBjb25zdCBzY2hlbWFWYWx1ZSA9IHNjaGVtYVtrZXldO1xuICAgICAgaWYgKCFoYXNPd24oY29tYmluZWRTY2hlbWEsIGtleSkgfHwgXy5pc0VxdWFsKGNvbWJpbmVkVmFsdWUsIHNjaGVtYVZhbHVlKSkge1xuICAgICAgICBjb21iaW5lZFNjaGVtYVtrZXldID0gc2NoZW1hVmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgIGNhc2UgJ2FsbE9mJzpcbiAgICAgICAgICAgIC8vIENvbWJpbmUgYWxsIGl0ZW1zIGZyb20gYm90aCBhcnJheXNcbiAgICAgICAgICAgIGlmIChpc0FycmF5KGNvbWJpbmVkVmFsdWUpICYmIGlzQXJyYXkoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLmFsbE9mID0gbWVyZ2VTY2hlbWFzKC4uLmNvbWJpbmVkVmFsdWUsIC4uLnNjaGVtYVZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2FkZGl0aW9uYWxJdGVtcyc6IGNhc2UgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJzpcbiAgICAgICAgICBjYXNlICdjb250YWlucyc6IGNhc2UgJ3Byb3BlcnR5TmFtZXMnOlxuICAgICAgICAgICAgLy8gTWVyZ2Ugc2NoZW1hIG9iamVjdHNcbiAgICAgICAgICAgIGlmIChpc09iamVjdChjb21iaW5lZFZhbHVlKSAmJiBpc09iamVjdChzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWFba2V5XSA9IG1lcmdlU2NoZW1hcyhjb21iaW5lZFZhbHVlLCBzY2hlbWFWYWx1ZSk7XG4gICAgICAgICAgICAvLyBhZGRpdGlvbmFsUHJvcGVydGllcyA9PSBmYWxzZSBpbiBhbnkgc2NoZW1hIG92ZXJyaWRlcyBhbGwgb3RoZXIgdmFsdWVzXG4gICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICBrZXkgPT09ICdhZGRpdGlvbmFsUHJvcGVydGllcycgJiZcbiAgICAgICAgICAgICAgKGNvbWJpbmVkVmFsdWUgPT09IGZhbHNlIHx8IHNjaGVtYVZhbHVlID09PSBmYWxzZSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYS5jb21iaW5lZFNjaGVtYSA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnYW55T2YnOiBjYXNlICdvbmVPZic6IGNhc2UgJ2VudW0nOlxuICAgICAgICAgICAgLy8gS2VlcCBvbmx5IGl0ZW1zIHRoYXQgYXBwZWFyIGluIGJvdGggYXJyYXlzXG4gICAgICAgICAgICBpZiAoaXNBcnJheShjb21iaW5lZFZhbHVlKSAmJiBpc0FycmF5KHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYVtrZXldID0gY29tYmluZWRWYWx1ZS5maWx0ZXIoaXRlbTEgPT5cbiAgICAgICAgICAgICAgICBzY2hlbWFWYWx1ZS5maW5kSW5kZXgoaXRlbTIgPT4gXy5pc0VxdWFsKGl0ZW0xLCBpdGVtMikpID4gLTFcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgaWYgKCFjb21iaW5lZFNjaGVtYVtrZXldLmxlbmd0aCkgeyByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTsgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZGVmaW5pdGlvbnMnOlxuICAgICAgICAgICAgLy8gQ29tYmluZSBrZXlzIGZyb20gYm90aCBvYmplY3RzXG4gICAgICAgICAgICBpZiAoaXNPYmplY3QoY29tYmluZWRWYWx1ZSkgJiYgaXNPYmplY3Qoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkT2JqZWN0ID0geyAuLi5jb21iaW5lZFZhbHVlIH07XG4gICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViS2V5IG9mIE9iamVjdC5rZXlzKHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmICghaGFzT3duKGNvbWJpbmVkT2JqZWN0LCBzdWJLZXkpIHx8XG4gICAgICAgICAgICAgICAgICBfLmlzRXF1YWwoY29tYmluZWRPYmplY3Rbc3ViS2V5XSwgc2NoZW1hVmFsdWVbc3ViS2V5XSlcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIGNvbWJpbmVkT2JqZWN0W3N1YktleV0gPSBzY2hlbWFWYWx1ZVtzdWJLZXldO1xuICAgICAgICAgICAgICAgIC8vIERvbid0IGNvbWJpbmUgbWF0Y2hpbmcga2V5cyB3aXRoIGRpZmZlcmVudCB2YWx1ZXNcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLmRlZmluaXRpb25zID0gY29tYmluZWRPYmplY3Q7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkZXBlbmRlbmNpZXMnOlxuICAgICAgICAgICAgLy8gQ29tYmluZSBhbGwga2V5cyBmcm9tIGJvdGggb2JqZWN0c1xuICAgICAgICAgICAgLy8gYW5kIG1lcmdlIHNjaGVtYXMgb24gbWF0Y2hpbmcga2V5cyxcbiAgICAgICAgICAgIC8vIGNvbnZlcnRpbmcgZnJvbSBhcnJheXMgdG8gb2JqZWN0cyBpZiBuZWNlc3NhcnlcbiAgICAgICAgICAgIGlmIChpc09iamVjdChjb21iaW5lZFZhbHVlKSAmJiBpc09iamVjdChzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29tYmluZWRPYmplY3QgPSB7IC4uLmNvbWJpbmVkVmFsdWUgfTtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJLZXkgb2YgT2JqZWN0LmtleXMoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNPd24oY29tYmluZWRPYmplY3QsIHN1YktleSkgfHxcbiAgICAgICAgICAgICAgICAgIF8uaXNFcXVhbChjb21iaW5lZE9iamVjdFtzdWJLZXldLCBzY2hlbWFWYWx1ZVtzdWJLZXldKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgY29tYmluZWRPYmplY3Rbc3ViS2V5XSA9IHNjaGVtYVZhbHVlW3N1YktleV07XG4gICAgICAgICAgICAgICAgLy8gSWYgYm90aCBrZXlzIGFyZSBhcnJheXMsIGluY2x1ZGUgYWxsIGl0ZW1zIGZyb20gYm90aCBhcnJheXMsXG4gICAgICAgICAgICAgICAgLy8gZXhjbHVkaW5nIGR1cGxpY2F0ZXNcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgaXNBcnJheShzY2hlbWFWYWx1ZVtzdWJLZXldKSAmJiBpc0FycmF5KGNvbWJpbmVkT2JqZWN0W3N1YktleV0pXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICBjb21iaW5lZE9iamVjdFtzdWJLZXldID1cbiAgICAgICAgICAgICAgICAgICAgdW5pcXVlSXRlbXMoLi4uY29tYmluZWRPYmplY3Rbc3ViS2V5XSwgLi4uc2NoZW1hVmFsdWVbc3ViS2V5XSk7XG4gICAgICAgICAgICAgICAgLy8gSWYgZWl0aGVyIGtleSBpcyBhbiBvYmplY3QsIG1lcmdlIHRoZSBzY2hlbWFzXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgIChpc0FycmF5KHNjaGVtYVZhbHVlW3N1YktleV0pIHx8IGlzT2JqZWN0KHNjaGVtYVZhbHVlW3N1YktleV0pKSAmJlxuICAgICAgICAgICAgICAgICAgKGlzQXJyYXkoY29tYmluZWRPYmplY3Rbc3ViS2V5XSkgfHwgaXNPYmplY3QoY29tYmluZWRPYmplY3Rbc3ViS2V5XSkpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAvLyBJZiBlaXRoZXIga2V5IGlzIGFuIGFycmF5LCBjb252ZXJ0IGl0IHRvIGFuIG9iamVjdCBmaXJzdFxuICAgICAgICAgICAgICAgICAgY29uc3QgcmVxdWlyZWQgPSBpc0FycmF5KGNvbWJpbmVkU2NoZW1hLnJlcXVpcmVkKSA/XG4gICAgICAgICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLnJlcXVpcmVkIDogW107XG4gICAgICAgICAgICAgICAgICBjb25zdCBjb21iaW5lZERlcGVuZGVuY3kgPSBpc0FycmF5KGNvbWJpbmVkT2JqZWN0W3N1YktleV0pID9cbiAgICAgICAgICAgICAgICAgICAgeyByZXF1aXJlZDogdW5pcXVlSXRlbXMoLi4ucmVxdWlyZWQsIGNvbWJpbmVkT2JqZWN0W3N1YktleV0pIH0gOlxuICAgICAgICAgICAgICAgICAgICBjb21iaW5lZE9iamVjdFtzdWJLZXldO1xuICAgICAgICAgICAgICAgICAgY29uc3Qgc2NoZW1hRGVwZW5kZW5jeSA9IGlzQXJyYXkoc2NoZW1hVmFsdWVbc3ViS2V5XSkgP1xuICAgICAgICAgICAgICAgICAgICB7IHJlcXVpcmVkOiB1bmlxdWVJdGVtcyguLi5yZXF1aXJlZCwgc2NoZW1hVmFsdWVbc3ViS2V5XSkgfSA6XG4gICAgICAgICAgICAgICAgICAgIHNjaGVtYVZhbHVlW3N1YktleV07XG4gICAgICAgICAgICAgICAgICBjb21iaW5lZE9iamVjdFtzdWJLZXldID1cbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VTY2hlbWFzKGNvbWJpbmVkRGVwZW5kZW5jeSwgc2NoZW1hRGVwZW5kZW5jeSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYS5kZXBlbmRlbmNpZXMgPSBjb21iaW5lZE9iamVjdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2l0ZW1zJzpcbiAgICAgICAgICAgIC8vIElmIGFycmF5cywga2VlcCBvbmx5IGl0ZW1zIHRoYXQgYXBwZWFyIGluIGJvdGggYXJyYXlzXG4gICAgICAgICAgICBpZiAoaXNBcnJheShjb21iaW5lZFZhbHVlKSAmJiBpc0FycmF5KHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYS5pdGVtcyA9IGNvbWJpbmVkVmFsdWUuZmlsdGVyKGl0ZW0xID0+XG4gICAgICAgICAgICAgICAgc2NoZW1hVmFsdWUuZmluZEluZGV4KGl0ZW0yID0+IF8uaXNFcXVhbChpdGVtMSwgaXRlbTIpKSA+IC0xXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIGlmICghY29tYmluZWRTY2hlbWEuaXRlbXMubGVuZ3RoKSB7IHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9OyB9XG4gICAgICAgICAgICAvLyBJZiBib3RoIGtleXMgYXJlIG9iamVjdHMsIG1lcmdlIHRoZW1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QoY29tYmluZWRWYWx1ZSkgJiYgaXNPYmplY3Qoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLml0ZW1zID0gbWVyZ2VTY2hlbWFzKGNvbWJpbmVkVmFsdWUsIHNjaGVtYVZhbHVlKTtcbiAgICAgICAgICAgIC8vIElmIG9iamVjdCArIGFycmF5LCBjb21iaW5lIG9iamVjdCB3aXRoIGVhY2ggYXJyYXkgaXRlbVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGNvbWJpbmVkVmFsdWUpICYmIGlzT2JqZWN0KHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYS5pdGVtcyA9XG4gICAgICAgICAgICAgICAgY29tYmluZWRWYWx1ZS5tYXAoaXRlbSA9PiBtZXJnZVNjaGVtYXMoaXRlbSwgc2NoZW1hVmFsdWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QoY29tYmluZWRWYWx1ZSkgJiYgaXNBcnJheShzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWEuaXRlbXMgPVxuICAgICAgICAgICAgICAgIHNjaGVtYVZhbHVlLm1hcChpdGVtID0+IG1lcmdlU2NoZW1hcyhpdGVtLCBjb21iaW5lZFZhbHVlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdtdWx0aXBsZU9mJzpcbiAgICAgICAgICAgIC8vIFRPRE86IEFkanVzdCB0byBjb3JyZWN0bHkgaGFuZGxlIGRlY2ltYWwgdmFsdWVzXG4gICAgICAgICAgICAvLyBJZiBudW1iZXJzLCBzZXQgdG8gbGVhc3QgY29tbW9uIG11bHRpcGxlXG4gICAgICAgICAgICBpZiAoaXNOdW1iZXIoY29tYmluZWRWYWx1ZSkgJiYgaXNOdW1iZXIoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGdjZCA9ICh4LCB5KSA9PiAheSA/IHggOiBnY2QoeSwgeCAlIHkpO1xuICAgICAgICAgICAgICBjb25zdCBsY20gPSAoeCwgeSkgPT4gKHggKiB5KSAvIGdjZCh4LCB5KTtcbiAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWEubXVsdGlwbGVPZiA9IGxjbShjb21iaW5lZFZhbHVlLCBzY2hlbWFWYWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdtYXhpbXVtJzogY2FzZSAnZXhjbHVzaXZlTWF4aW11bSc6IGNhc2UgJ21heExlbmd0aCc6XG4gICAgICAgICAgY2FzZSAnbWF4SXRlbXMnOiBjYXNlICdtYXhQcm9wZXJ0aWVzJzpcbiAgICAgICAgICAgIC8vIElmIG51bWJlcnMsIHNldCB0byBsb3dlc3QgdmFsdWVcbiAgICAgICAgICAgIGlmIChpc051bWJlcihjb21iaW5lZFZhbHVlKSAmJiBpc051bWJlcihzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWFba2V5XSA9IE1hdGgubWluKGNvbWJpbmVkVmFsdWUsIHNjaGVtYVZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ21pbmltdW0nOiBjYXNlICdleGNsdXNpdmVNaW5pbXVtJzogY2FzZSAnbWluTGVuZ3RoJzpcbiAgICAgICAgICBjYXNlICdtaW5JdGVtcyc6IGNhc2UgJ21pblByb3BlcnRpZXMnOlxuICAgICAgICAgICAgLy8gSWYgbnVtYmVycywgc2V0IHRvIGhpZ2hlc3QgdmFsdWVcbiAgICAgICAgICAgIGlmIChpc051bWJlcihjb21iaW5lZFZhbHVlKSAmJiBpc051bWJlcihzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWFba2V5XSA9IE1hdGgubWF4KGNvbWJpbmVkVmFsdWUsIHNjaGVtYVZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ25vdCc6XG4gICAgICAgICAgICAvLyBDb21iaW5lIG5vdCB2YWx1ZXMgaW50byBhbnlPZiBhcnJheVxuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KGNvbWJpbmVkVmFsdWUpICYmIGlzT2JqZWN0KHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICBjb25zdCBub3RBbnlPZiA9IFtjb21iaW5lZFZhbHVlLCBzY2hlbWFWYWx1ZV1cbiAgICAgICAgICAgICAgICAucmVkdWNlKChub3RBbnlPZkFycmF5LCBub3RTY2hlbWEpID0+XG4gICAgICAgICAgICAgICAgICBpc0FycmF5KG5vdFNjaGVtYS5hbnlPZikgJiZcbiAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKG5vdFNjaGVtYSkubGVuZ3RoID09PSAxID9cbiAgICAgICAgICAgICAgICAgICAgWyAuLi5ub3RBbnlPZkFycmF5LCAuLi5ub3RTY2hlbWEuYW55T2YgXSA6XG4gICAgICAgICAgICAgICAgICAgIFsgLi4ubm90QW55T2ZBcnJheSwgbm90U2NoZW1hIF1cbiAgICAgICAgICAgICAgICAsIFtdKTtcbiAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGR1cGxpY2F0ZSBpdGVtcyBmcm9tIGFycmF5XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLm5vdCA9IHsgYW55T2Y6IG5vdEFueU9mIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdwYXR0ZXJuUHJvcGVydGllcyc6XG4gICAgICAgICAgICAvLyBDb21iaW5lIGFsbCBrZXlzIGZyb20gYm90aCBvYmplY3RzXG4gICAgICAgICAgICAvLyBhbmQgbWVyZ2Ugc2NoZW1hcyBvbiBtYXRjaGluZyBrZXlzXG4gICAgICAgICAgICBpZiAoaXNPYmplY3QoY29tYmluZWRWYWx1ZSkgJiYgaXNPYmplY3Qoc2NoZW1hVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkT2JqZWN0ID0geyAuLi5jb21iaW5lZFZhbHVlIH07XG4gICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViS2V5IG9mIE9iamVjdC5rZXlzKHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmICghaGFzT3duKGNvbWJpbmVkT2JqZWN0LCBzdWJLZXkpIHx8XG4gICAgICAgICAgICAgICAgICBfLmlzRXF1YWwoY29tYmluZWRPYmplY3Rbc3ViS2V5XSwgc2NoZW1hVmFsdWVbc3ViS2V5XSlcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIGNvbWJpbmVkT2JqZWN0W3N1YktleV0gPSBzY2hlbWFWYWx1ZVtzdWJLZXldO1xuICAgICAgICAgICAgICAgIC8vIElmIGJvdGgga2V5cyBhcmUgb2JqZWN0cywgbWVyZ2UgdGhlbVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICBpc09iamVjdChzY2hlbWFWYWx1ZVtzdWJLZXldKSAmJiBpc09iamVjdChjb21iaW5lZE9iamVjdFtzdWJLZXldKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgY29tYmluZWRPYmplY3Rbc3ViS2V5XSA9XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlU2NoZW1hcyhjb21iaW5lZE9iamVjdFtzdWJLZXldLCBzY2hlbWFWYWx1ZVtzdWJLZXldKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLnBhdHRlcm5Qcm9wZXJ0aWVzID0gY29tYmluZWRPYmplY3Q7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdwcm9wZXJ0aWVzJzpcbiAgICAgICAgICAgIC8vIENvbWJpbmUgYWxsIGtleXMgZnJvbSBib3RoIG9iamVjdHNcbiAgICAgICAgICAgIC8vIHVubGVzcyBhZGRpdGlvbmFsUHJvcGVydGllcyA9PT0gZmFsc2VcbiAgICAgICAgICAgIC8vIGFuZCBtZXJnZSBzY2hlbWFzIG9uIG1hdGNoaW5nIGtleXNcbiAgICAgICAgICAgIGlmIChpc09iamVjdChjb21iaW5lZFZhbHVlKSAmJiBpc09iamVjdChzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29tYmluZWRPYmplY3QgPSB7IC4uLmNvbWJpbmVkVmFsdWUgfTtcbiAgICAgICAgICAgICAgLy8gSWYgbmV3IHNjaGVtYSBoYXMgYWRkaXRpb25hbFByb3BlcnRpZXMsXG4gICAgICAgICAgICAgIC8vIG1lcmdlIG9yIHJlbW92ZSBub24tbWF0Y2hpbmcgcHJvcGVydHkga2V5cyBpbiBjb21iaW5lZCBzY2hlbWFcbiAgICAgICAgICAgICAgaWYgKGhhc093bihzY2hlbWFWYWx1ZSwgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJykpIHtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhjb21iaW5lZFZhbHVlKVxuICAgICAgICAgICAgICAgICAgLmZpbHRlcihjb21iaW5lZEtleSA9PiAhT2JqZWN0LmtleXMoc2NoZW1hVmFsdWUpLmluY2x1ZGVzKGNvbWJpbmVkS2V5KSlcbiAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKG5vbk1hdGNoaW5nS2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjaGVtYVZhbHVlLmFkZGl0aW9uYWxQcm9wZXJ0aWVzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjb21iaW5lZE9iamVjdFtub25NYXRjaGluZ0tleV07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qoc2NoZW1hVmFsdWUuYWRkaXRpb25hbFByb3BlcnRpZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29tYmluZWRPYmplY3Rbbm9uTWF0Y2hpbmdLZXldID0gbWVyZ2VTY2hlbWFzKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tYmluZWRPYmplY3Rbbm9uTWF0Y2hpbmdLZXldLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hVmFsdWUuYWRkaXRpb25hbFByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YktleSBvZiBPYmplY3Qua2V5cyhzY2hlbWFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5pc0VxdWFsKGNvbWJpbmVkT2JqZWN0W3N1YktleV0sIHNjaGVtYVZhbHVlW3N1YktleV0pIHx8IChcbiAgICAgICAgICAgICAgICAgICFoYXNPd24oY29tYmluZWRPYmplY3QsIHN1YktleSkgJiZcbiAgICAgICAgICAgICAgICAgICFoYXNPd24oY29tYmluZWRPYmplY3QsICdhZGRpdGlvbmFsUHJvcGVydGllcycpXG4gICAgICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgICAgY29tYmluZWRPYmplY3Rbc3ViS2V5XSA9IHNjaGVtYVZhbHVlW3N1YktleV07XG4gICAgICAgICAgICAgICAgLy8gSWYgY29tYmluZWQgc2NoZW1hIGhhcyBhZGRpdGlvbmFsUHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAvLyBtZXJnZSBvciBpZ25vcmUgbm9uLW1hdGNoaW5nIHByb3BlcnR5IGtleXMgaW4gbmV3IHNjaGVtYVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAhaGFzT3duKGNvbWJpbmVkT2JqZWN0LCBzdWJLZXkpICYmXG4gICAgICAgICAgICAgICAgICBoYXNPd24oY29tYmluZWRPYmplY3QsICdhZGRpdGlvbmFsUHJvcGVydGllcycpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAvLyBJZiBjb21iaW5lZE9iamVjdC5hZGRpdGlvbmFsUHJvcGVydGllcyA9PT0gZmFsc2UsXG4gICAgICAgICAgICAgICAgICAvLyBkbyBub3RoaW5nIChkb24ndCBzZXQga2V5KVxuICAgICAgICAgICAgICAgICAgLy8gSWYgYWRkaXRpb25hbFByb3BlcnRpZXMgaXMgb2JqZWN0LCBtZXJnZSB3aXRoIG5ldyBrZXlcbiAgICAgICAgICAgICAgICAgIGlmIChpc09iamVjdChjb21iaW5lZE9iamVjdC5hZGRpdGlvbmFsUHJvcGVydGllcykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tYmluZWRPYmplY3Rbc3ViS2V5XSA9IG1lcmdlU2NoZW1hcyhcbiAgICAgICAgICAgICAgICAgICAgICBjb21iaW5lZE9iamVjdC5hZGRpdGlvbmFsUHJvcGVydGllcywgc2NoZW1hVmFsdWVbc3ViS2V5XVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIElmIGJvdGgga2V5cyBhcmUgb2JqZWN0cywgbWVyZ2UgdGhlbVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICBpc09iamVjdChzY2hlbWFWYWx1ZVtzdWJLZXldKSAmJlxuICAgICAgICAgICAgICAgICAgaXNPYmplY3QoY29tYmluZWRPYmplY3Rbc3ViS2V5XSlcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIGNvbWJpbmVkT2JqZWN0W3N1YktleV0gPVxuICAgICAgICAgICAgICAgICAgICBtZXJnZVNjaGVtYXMoY29tYmluZWRPYmplY3Rbc3ViS2V5XSwgc2NoZW1hVmFsdWVbc3ViS2V5XSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYS5wcm9wZXJ0aWVzID0gY29tYmluZWRPYmplY3Q7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdyZXF1aXJlZCc6XG4gICAgICAgICAgICAvLyBJZiBhcnJheXMsIGluY2x1ZGUgYWxsIGl0ZW1zIGZyb20gYm90aCBhcnJheXMsIGV4Y2x1ZGluZyBkdXBsaWNhdGVzXG4gICAgICAgICAgICBpZiAoaXNBcnJheShjb21iaW5lZFZhbHVlKSAmJiBpc0FycmF5KHNjaGVtYVZhbHVlKSkge1xuICAgICAgICAgICAgICBjb21iaW5lZFNjaGVtYS5yZXF1aXJlZCA9IHVuaXF1ZUl0ZW1zKC4uLmNvbWJpbmVkVmFsdWUsIC4uLnNjaGVtYVZhbHVlKTtcbiAgICAgICAgICAgIC8vIElmIGJvb2xlYW5zLCBhZXQgdHJ1ZSBpZiBlaXRoZXIgdHJ1ZVxuICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgdHlwZW9mIHNjaGVtYVZhbHVlID09PSAnYm9vbGVhbicgJiZcbiAgICAgICAgICAgICAgdHlwZW9mIGNvbWJpbmVkVmFsdWUgPT09ICdib29sZWFuJ1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLnJlcXVpcmVkID0gISFjb21iaW5lZFZhbHVlIHx8ICEhc2NoZW1hVmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4geyBhbGxPZjogWyAuLi5zY2hlbWFzIF0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICckc2NoZW1hJzogY2FzZSAnJGlkJzogY2FzZSAnaWQnOlxuICAgICAgICAgICAgLy8gRG9uJ3QgY29tYmluZSB0aGVzZSBrZXlzXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndGl0bGUnOiBjYXNlICdkZXNjcmlwdGlvbic6XG4gICAgICAgICAgICAvLyBSZXR1cm4gdGhlIGxhc3QgdmFsdWUsIG92ZXJ3cml0aW5nIGFueSBwcmV2aW91cyBvbmVcbiAgICAgICAgICAgIC8vIFRoZXNlIHByb3BlcnRpZXMgYXJlIG5vdCB1c2VkIGZvciB2YWxpZGF0aW9uLCBzbyBjb25mbGljdHMgZG9uJ3QgbWF0dGVyXG4gICAgICAgICAgICBjb21iaW5lZFNjaGVtYVtrZXldID0gc2NoZW1hVmFsdWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndHlwZSc6XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIChpc0FycmF5KHNjaGVtYVZhbHVlKSB8fCBpc1N0cmluZyhzY2hlbWFWYWx1ZSkpICYmXG4gICAgICAgICAgICAgIChpc0FycmF5KGNvbWJpbmVkVmFsdWUpIHx8IGlzU3RyaW5nKGNvbWJpbmVkVmFsdWUpKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkVHlwZXMgPSBjb21tb25JdGVtcyhjb21iaW5lZFZhbHVlLCBzY2hlbWFWYWx1ZSk7XG4gICAgICAgICAgICAgIGlmICghY29tYmluZWRUeXBlcy5sZW5ndGgpIHsgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07IH1cbiAgICAgICAgICAgICAgY29tYmluZWRTY2hlbWEudHlwZSA9IGNvbWJpbmVkVHlwZXMubGVuZ3RoID4gMSA/IGNvbWJpbmVkVHlwZXMgOiBjb21iaW5lZFR5cGVzWzBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgYWxsT2Y6IFsgLi4uc2NoZW1hcyBdIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndW5pcXVlSXRlbXMnOlxuICAgICAgICAgICAgLy8gU2V0IHRydWUgaWYgZWl0aGVyIHRydWVcbiAgICAgICAgICAgIGNvbWJpbmVkU2NoZW1hLnVuaXF1ZUl0ZW1zID0gISFjb21iaW5lZFZhbHVlIHx8ICEhc2NoZW1hVmFsdWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB7IGFsbE9mOiBbIC4uLnNjaGVtYXMgXSB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjb21iaW5lZFNjaGVtYTtcbn1cbiJdfQ==