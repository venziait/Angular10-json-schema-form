import * as tslib_1 from "tslib";
import { Observable, from } from 'rxjs';
/**
 * '_executeValidators' utility function
 *
 * Validates a control against an array of validators, and returns
 * an array of the same length containing a combination of error messages
 * (from invalid validators) and null values (from valid validators)
 *
 * //  { AbstractControl } control - control to validate
 * //  { IValidatorFn[] } validators - array of validators
 * //  { boolean } invert - invert?
 * // { PlainObject[] } - array of nulls and error message
 */
export function _executeValidators(control, validators, invert) {
    if (invert === void 0) { invert = false; }
    return validators.map(function (validator) { return validator(control, invert); });
}
/**
 * '_executeAsyncValidators' utility function
 *
 * Validates a control against an array of async validators, and returns
 * an array of observabe results of the same length containing a combination of
 * error messages (from invalid validators) and null values (from valid ones)
 *
 * //  { AbstractControl } control - control to validate
 * //  { AsyncIValidatorFn[] } validators - array of async validators
 * //  { boolean } invert - invert?
 * //  - array of observable nulls and error message
 */
export function _executeAsyncValidators(control, validators, invert) {
    if (invert === void 0) { invert = false; }
    return validators.map(function (validator) { return validator(control, invert); });
}
/**
 * '_mergeObjects' utility function
 *
 * Recursively Merges one or more objects into a single object with combined keys.
 * Automatically detects and ignores null and undefined inputs.
 * Also detects duplicated boolean 'not' keys and XORs their values.
 *
 * //  { PlainObject[] } objects - one or more objects to merge
 * // { PlainObject } - merged object
 */
export function _mergeObjects() {
    var objects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objects[_i] = arguments[_i];
    }
    var mergedObject = {};
    try {
        for (var objects_1 = tslib_1.__values(objects), objects_1_1 = objects_1.next(); !objects_1_1.done; objects_1_1 = objects_1.next()) {
            var currentObject = objects_1_1.value;
            if (isObject(currentObject)) {
                try {
                    for (var _a = tslib_1.__values(Object.keys(currentObject)), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var key = _b.value;
                        var currentValue = currentObject[key];
                        var mergedValue = mergedObject[key];
                        mergedObject[key] = !isDefined(mergedValue) ? currentValue :
                            key === 'not' && isBoolean(mergedValue, 'strict') &&
                                isBoolean(currentValue, 'strict') ? xor(mergedValue, currentValue) :
                                getType(mergedValue) === 'object' && getType(currentValue) === 'object' ?
                                    _mergeObjects(mergedValue, currentValue) :
                                    currentValue;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (objects_1_1 && !objects_1_1.done && (_d = objects_1.return)) _d.call(objects_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return mergedObject;
    var e_2, _d, e_1, _c;
}
/**
 * '_mergeErrors' utility function
 *
 * Merges an array of objects.
 * Used for combining the validator errors returned from 'executeValidators'
 *
 * //  { PlainObject[] } arrayOfErrors - array of objects
 * // { PlainObject } - merged object, or null if no usable input objectcs
 */
export function _mergeErrors(arrayOfErrors) {
    var mergedErrors = _mergeObjects.apply(void 0, tslib_1.__spread(arrayOfErrors));
    return isEmpty(mergedErrors) ? null : mergedErrors;
}
/**
 * 'isDefined' utility function
 *
 * Checks if a variable contains a value of any type.
 * Returns true even for otherwise 'falsey' values of 0, '', and false.
 *
 * //   value - the value to check
 * // { boolean } - false if undefined or null, otherwise true
 */
export function isDefined(value) {
    return value !== undefined && value !== null;
}
/**
 * 'hasValue' utility function
 *
 * Checks if a variable contains a value.
 * Returs false for null, undefined, or a zero-length strng, '',
 * otherwise returns true.
 * (Stricter than 'isDefined' because it also returns false for '',
 * though it stil returns true for otherwise 'falsey' values 0 and false.)
 *
 * //   value - the value to check
 * // { boolean } - false if undefined, null, or '', otherwise true
 */
export function hasValue(value) {
    return value !== undefined && value !== null && value !== '';
}
/**
 * 'isEmpty' utility function
 *
 * Similar to !hasValue, but also returns true for empty arrays and objects.
 *
 * //   value - the value to check
 * // { boolean } - false if undefined, null, or '', otherwise true
 */
export function isEmpty(value) {
    if (isArray(value)) {
        return !value.length;
    }
    if (isObject(value)) {
        return !Object.keys(value).length;
    }
    return value === undefined || value === null || value === '';
}
/**
 * 'isString' utility function
 *
 * Checks if a value is a string.
 *
 * //   value - the value to check
 * // { boolean } - true if string, false if not
 */
export function isString(value) {
    return typeof value === 'string';
}
/**
 * 'isNumber' utility function
 *
 * Checks if a value is a regular number, numeric string, or JavaScript Date.
 *
 * //   value - the value to check
 * //  { any = false } strict - if truthy, also checks JavaScript tyoe
 * // { boolean } - true if number, false if not
 */
export function isNumber(value, strict) {
    if (strict === void 0) { strict = false; }
    if (strict && typeof value !== 'number') {
        return false;
    }
    return !isNaN(value) && value !== value / 0;
}
/**
 * 'isInteger' utility function
 *
 * Checks if a value is an integer.
 *
 * //   value - the value to check
 * //  { any = false } strict - if truthy, also checks JavaScript tyoe
 * // {boolean } - true if number, false if not
 */
export function isInteger(value, strict) {
    if (strict === void 0) { strict = false; }
    if (strict && typeof value !== 'number') {
        return false;
    }
    return !isNaN(value) && value !== value / 0 && value % 1 === 0;
}
/**
 * 'isBoolean' utility function
 *
 * Checks if a value is a boolean.
 *
 * //   value - the value to check
 * //  { any = null } option - if 'strict', also checks JavaScript type
 *                              if TRUE or FALSE, checks only for that value
 * // { boolean } - true if boolean, false if not
 */
export function isBoolean(value, option) {
    if (option === void 0) { option = null; }
    if (option === 'strict') {
        return value === true || value === false;
    }
    if (option === true) {
        return value === true || value === 1 || value === 'true' || value === '1';
    }
    if (option === false) {
        return value === false || value === 0 || value === 'false' || value === '0';
    }
    return value === true || value === 1 || value === 'true' || value === '1' ||
        value === false || value === 0 || value === 'false' || value === '0';
}
export function isFunction(item) {
    return typeof item === 'function';
}
export function isObject(item) {
    return item !== null && typeof item === 'object' &&
        Object.prototype.toString.call(item) === '[object Object]';
}
export function isArray(item) {
    return Array.isArray(item) ||
        Object.prototype.toString.call(item) === '[object Array]';
}
export function isDate(item) {
    return typeof item === 'object' &&
        Object.prototype.toString.call(item) === '[object Date]';
}
export function isMap(item) {
    return typeof item === 'object' &&
        Object.prototype.toString.call(item) === '[object Map]';
}
export function isSet(item) {
    return typeof item === 'object' &&
        Object.prototype.toString.call(item) === '[object Set]';
}
export function isSymbol(item) {
    return typeof item === 'symbol';
}
/**
 * 'getType' function
 *
 * Detects the JSON Schema Type of a value.
 * By default, detects numbers and integers even if formatted as strings.
 * (So all integers are also numbers, and any number may also be a string.)
 * However, it only detects true boolean values (to detect boolean values
 * in non-boolean formats, use isBoolean() instead).
 *
 * If passed a second optional parameter of 'strict', it will only detect
 * numbers and integers if they are formatted as JavaScript numbers.
 *
 * Examples:
 * getType('10.5') = 'number'
 * getType(10.5) = 'number'
 * getType('10') = 'integer'
 * getType(10) = 'integer'
 * getType('true') = 'string'
 * getType(true) = 'boolean'
 * getType(null) = 'null'
 * getType({ }) = 'object'
 * getType([]) = 'array'
 *
 * getType('10.5', 'strict') = 'string'
 * getType(10.5, 'strict') = 'number'
 * getType('10', 'strict') = 'string'
 * getType(10, 'strict') = 'integer'
 * getType('true', 'strict') = 'string'
 * getType(true, 'strict') = 'boolean'
 *
 * //   value - value to check
 * //  { any = false } strict - if truthy, also checks JavaScript tyoe
 * // { SchemaType }
 */
export function getType(value, strict) {
    if (strict === void 0) { strict = false; }
    if (!isDefined(value)) {
        return 'null';
    }
    if (isArray(value)) {
        return 'array';
    }
    if (isObject(value)) {
        return 'object';
    }
    if (isBoolean(value, 'strict')) {
        return 'boolean';
    }
    if (isInteger(value, strict)) {
        return 'integer';
    }
    if (isNumber(value, strict)) {
        return 'number';
    }
    if (isString(value) || (!strict && isDate(value))) {
        return 'string';
    }
    return null;
}
/**
 * 'isType' function
 *
 * Checks wether an input (probably string) value contains data of
 * a specified JSON Schema type
 *
 * //  { PrimitiveValue } value - value to check
 * //  { SchemaPrimitiveType } type - type to check
 * // { boolean }
 */
export function isType(value, type) {
    switch (type) {
        case 'string':
            return isString(value) || isDate(value);
        case 'number':
            return isNumber(value);
        case 'integer':
            return isInteger(value);
        case 'boolean':
            return isBoolean(value);
        case 'null':
            return !hasValue(value);
        default:
            console.error("isType error: \"" + type + "\" is not a recognized type.");
            return null;
    }
}
/**
 * 'isPrimitive' function
 *
 * Checks wether an input value is a JavaScript primitive type:
 * string, number, boolean, or null.
 *
 * //   value - value to check
 * // { boolean }
 */
export function isPrimitive(value) {
    return (isString(value) || isNumber(value) ||
        isBoolean(value, 'strict') || value === null);
}
/**
 * 'toJavaScriptType' function
 *
 * Converts an input (probably string) value to a JavaScript primitive type -
 * 'string', 'number', 'boolean', or 'null' - before storing in a JSON object.
 *
 * Does not coerce values (other than null), and only converts the types
 * of values that would otherwise be valid.
 *
 * If the optional third parameter 'strictIntegers' is TRUE, and the
 * JSON Schema type 'integer' is specified, it also verifies the input value
 * is an integer and, if it is, returns it as a JaveScript number.
 * If 'strictIntegers' is FALSE (or not set) the type 'integer' is treated
 * exactly the same as 'number', and allows decimals.
 *
 * Valid Examples:
 * toJavaScriptType('10',   'number' ) = 10   // '10'   is a number
 * toJavaScriptType('10',   'integer') = 10   // '10'   is also an integer
 * toJavaScriptType( 10,    'integer') = 10   //  10    is still an integer
 * toJavaScriptType( 10,    'string' ) = '10' //  10    can be made into a string
 * toJavaScriptType('10.5', 'number' ) = 10.5 // '10.5' is a number
 *
 * Invalid Examples:
 * toJavaScriptType('10.5', 'integer') = null // '10.5' is not an integer
 * toJavaScriptType( 10.5,  'integer') = null //  10.5  is still not an integer
 *
 * //  { PrimitiveValue } value - value to convert
 * //  { SchemaPrimitiveType | SchemaPrimitiveType[] } types - types to convert to
 * //  { boolean = false } strictIntegers - if FALSE, treat integers as numbers
 * // { PrimitiveValue }
 */
export function toJavaScriptType(value, types, strictIntegers) {
    if (strictIntegers === void 0) { strictIntegers = true; }
    if (!isDefined(value)) {
        return null;
    }
    if (isString(types)) {
        types = [types];
    }
    if (strictIntegers && inArray('integer', types)) {
        if (isInteger(value, 'strict')) {
            return value;
        }
        if (isInteger(value)) {
            return parseInt(value, 10);
        }
    }
    if (inArray('number', types) || (!strictIntegers && inArray('integer', types))) {
        if (isNumber(value, 'strict')) {
            return value;
        }
        if (isNumber(value)) {
            return parseFloat(value);
        }
    }
    if (inArray('string', types)) {
        if (isString(value)) {
            return value;
        }
        // If value is a date, and types includes 'string',
        // convert the date to a string
        if (isDate(value)) {
            return value.toISOString().slice(0, 10);
        }
        if (isNumber(value)) {
            return value.toString();
        }
    }
    // If value is a date, and types includes 'integer' or 'number',
    // but not 'string', convert the date to a number
    if (isDate(value) && (inArray('integer', types) || inArray('number', types))) {
        return value.getTime();
    }
    if (inArray('boolean', types)) {
        if (isBoolean(value, true)) {
            return true;
        }
        if (isBoolean(value, false)) {
            return false;
        }
    }
    return null;
}
/**
 * 'toSchemaType' function
 *
 * Converts an input (probably string) value to the "best" JavaScript
 * equivalent available from an allowed list of JSON Schema types, which may
 * contain 'string', 'number', 'integer', 'boolean', and/or 'null'.
 * If necssary, it does progressively agressive type coersion.
 * It will not return null unless null is in the list of allowed types.
 *
 * Number conversion examples:
 * toSchemaType('10', ['number','integer','string']) = 10 // integer
 * toSchemaType('10', ['number','string']) = 10 // number
 * toSchemaType('10', ['string']) = '10' // string
 * toSchemaType('10.5', ['number','integer','string']) = 10.5 // number
 * toSchemaType('10.5', ['integer','string']) = '10.5' // string
 * toSchemaType('10.5', ['integer']) = 10 // integer
 * toSchemaType(10.5, ['null','boolean','string']) = '10.5' // string
 * toSchemaType(10.5, ['null','boolean']) = true // boolean
 *
 * String conversion examples:
 * toSchemaType('1.5x', ['boolean','number','integer','string']) = '1.5x' // string
 * toSchemaType('1.5x', ['boolean','number','integer']) = '1.5' // number
 * toSchemaType('1.5x', ['boolean','integer']) = '1' // integer
 * toSchemaType('1.5x', ['boolean']) = true // boolean
 * toSchemaType('xyz', ['number','integer','boolean','null']) = true // boolean
 * toSchemaType('xyz', ['number','integer','null']) = null // null
 * toSchemaType('xyz', ['number','integer']) = 0 // number
 *
 * Boolean conversion examples:
 * toSchemaType('1', ['integer','number','string','boolean']) = 1 // integer
 * toSchemaType('1', ['number','string','boolean']) = 1 // number
 * toSchemaType('1', ['string','boolean']) = '1' // string
 * toSchemaType('1', ['boolean']) = true // boolean
 * toSchemaType('true', ['number','string','boolean']) = 'true' // string
 * toSchemaType('true', ['boolean']) = true // boolean
 * toSchemaType('true', ['number']) = 0 // number
 * toSchemaType(true, ['number','string','boolean']) = true // boolean
 * toSchemaType(true, ['number','string']) = 'true' // string
 * toSchemaType(true, ['number']) = 1 // number
 *
 * //  { PrimitiveValue } value - value to convert
 * //  { SchemaPrimitiveType | SchemaPrimitiveType[] } types - allowed types to convert to
 * // { PrimitiveValue }
 */
export function toSchemaType(value, types) {
    if (!isArray(types)) {
        types = [types];
    }
    if (types.includes('null') && !hasValue(value)) {
        return null;
    }
    if (types.includes('boolean') && !isBoolean(value, 'strict')) {
        return value;
    }
    if (types.includes('integer')) {
        var testValue = toJavaScriptType(value, 'integer');
        if (testValue !== null) {
            return +testValue;
        }
    }
    if (types.includes('number')) {
        var testValue = toJavaScriptType(value, 'number');
        if (testValue !== null) {
            return +testValue;
        }
    }
    if ((isString(value) || isNumber(value, 'strict')) &&
        types.includes('string')) {
        return toJavaScriptType(value, 'string');
    }
    if (types.includes('boolean') && isBoolean(value)) {
        return toJavaScriptType(value, 'boolean');
    }
    if (types.includes('string')) {
        if (value === null) {
            return '';
        }
        var testValue = toJavaScriptType(value, 'string');
        if (testValue !== null) {
            return testValue;
        }
    }
    if ((types.includes('number') ||
        types.includes('integer'))) {
        if (value === true) {
            return 1;
        } // Convert boolean & null to number
        if (value === false || value === null || value === '') {
            return 0;
        }
    }
    if (types.includes('number')) {
        var testValue = parseFloat(value);
        if (!!testValue) {
            return testValue;
        }
    }
    if (types.includes('integer')) {
        var testValue = parseInt(value, 10);
        if (!!testValue) {
            return testValue;
        }
    }
    if (types.includes('boolean')) {
        return !!value;
    }
    if ((types.includes('number') ||
        types.includes('integer')) && !types.includes('null')) {
        return 0; // If null not allowed, return 0 for non-convertable values
    }
}
/**
 * 'isPromise' function
 *
 * //   object
 * // { boolean }
 */
export function isPromise(object) {
    return !!object && typeof object.then === 'function';
}
/**
 * 'isObservable' function
 *
 * //   object
 * // { boolean }
 */
export function isObservable(object) {
    return !!object && typeof object.subscribe === 'function';
}
/**
 * '_toPromise' function
 *
 * //  { object } object
 * // { Promise<any> }
 */
export function _toPromise(object) {
    return isPromise(object) ? object : object.toPromise();
}
/**
 * 'toObservable' function
 *
 * //  { object } object
 * // { Observable<any> }
 */
export function toObservable(object) {
    var observable = isPromise(object) ? from(object) : object;
    if (isObservable(observable)) {
        return observable;
    }
    console.error('toObservable error: Expected validator to return Promise or Observable.');
    return new Observable();
}
/**
 * 'inArray' function
 *
 * Searches an array for an item, or one of a list of items, and returns true
 * as soon as a match is found, or false if no match.
 *
 * If the optional third parameter allIn is set to TRUE, and the item to find
 * is an array, then the function returns true only if all elements from item
 * are found in the array list, and false if any element is not found. If the
 * item to find is not an array, setting allIn to TRUE has no effect.
 *
 * //  { any|any[] } item - the item to search for
 * //   array - the array to search
 * //  { boolean = false } allIn - if TRUE, all items must be in array
 * // { boolean } - true if item(s) in array, false otherwise
 */
export function inArray(item, array, allIn) {
    if (allIn === void 0) { allIn = false; }
    if (!isDefined(item) || !isArray(array)) {
        return false;
    }
    return isArray(item) ?
        item[allIn ? 'every' : 'some'](function (subItem) { return array.includes(subItem); }) :
        array.includes(item);
}
/**
 * 'xor' utility function - exclusive or
 *
 * Returns true if exactly one of two values is truthy.
 *
 * //   value1 - first value to check
 * //   value2 - second value to check
 * // { boolean } - true if exactly one input value is truthy, false if not
 */
export function xor(value1, value2) {
    return (!!value1 && !value2) || (!value1 && !!value2);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9yLmZ1bmN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvc2hhcmVkL3ZhbGlkYXRvci5mdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLE9BQU8sRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBZ0R4Qzs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sNkJBQTZCLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBYztJQUFkLHVCQUFBLEVBQUEsY0FBYztJQUNwRSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFBLFNBQVMsSUFBSSxPQUFBLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQztBQUNqRSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxNQUFNLGtDQUFrQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQWM7SUFBZCx1QkFBQSxFQUFBLGNBQWM7SUFDekUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxTQUFTLElBQUksT0FBQSxTQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7QUFDakUsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU07SUFBd0IsaUJBQVU7U0FBVixVQUFVLEVBQVYscUJBQVUsRUFBVixJQUFVO1FBQVYsNEJBQVU7O0lBQ3RDLElBQU0sWUFBWSxHQUFnQixFQUFHLENBQUM7O1FBQ3RDLEdBQUcsQ0FBQyxDQUF3QixJQUFBLFlBQUEsaUJBQUEsT0FBTyxDQUFBLGdDQUFBO1lBQTlCLElBQU0sYUFBYSxvQkFBQTtZQUN0QixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDOztvQkFDNUIsR0FBRyxDQUFDLENBQWMsSUFBQSxLQUFB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LENBQUMsUUFBUSxDQUNsRCxDQUFDLENBQUMsQ0FBQztRQUNELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUF5QixLQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0UsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQXlCLEtBQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RELEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUFDLENBQUM7UUFDbEMsSUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLENBQ3NCLEtBQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1FBQ3pCLEtBQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQ3BELENBQUMsQ0FBQyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxDQUFDLG1DQUFtQztRQUNyRSxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQztJQUN0RSxD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T0FBQSxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUF2QixDQUF1QixDQUFDLENBQUMsQ0FBQztRQUNwRSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sY0FBYyxNQUFNLEVBQUUsTUFBTTtJQUNoQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFic3RyYWN0Q29udHJvbCwgVmFsaWRhdGlvbkVycm9ycyB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IE9ic2VydmFibGUsIGZyb20gfSBmcm9tICdyeGpzJztcblxuLyoqXG4gKiBWYWxpZGF0b3IgdXRpbGl0eSBmdW5jdGlvbiBsaWJyYXJ5OlxuICpcbiAqIFZhbGlkYXRvciBhbmQgZXJyb3IgdXRpbGl0aWVzOlxuICogICBfZXhlY3V0ZVZhbGlkYXRvcnMsIF9leGVjdXRlQXN5bmNWYWxpZGF0b3JzLCBfbWVyZ2VPYmplY3RzLCBfbWVyZ2VFcnJvcnNcbiAqXG4gKiBJbmRpdmlkdWFsIHZhbHVlIGNoZWNraW5nOlxuICogICBpc0RlZmluZWQsIGhhc1ZhbHVlLCBpc0VtcHR5XG4gKlxuICogSW5kaXZpZHVhbCB0eXBlIGNoZWNraW5nOlxuICogICBpc1N0cmluZywgaXNOdW1iZXIsIGlzSW50ZWdlciwgaXNCb29sZWFuLCBpc0Z1bmN0aW9uLCBpc09iamVjdCwgaXNBcnJheSxcbiAqICAgaXNNYXAsIGlzU2V0LCBpc1Byb21pc2UsIGlzT2JzZXJ2YWJsZVxuICpcbiAqIE11bHRpcGxlIHR5cGUgY2hlY2tpbmcgYW5kIGZpeGluZzpcbiAqICAgZ2V0VHlwZSwgaXNUeXBlLCBpc1ByaW1pdGl2ZSwgdG9KYXZhU2NyaXB0VHlwZSwgdG9TY2hlbWFUeXBlLFxuICogICBfdG9Qcm9taXNlLCB0b09ic2VydmFibGVcbiAqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uczpcbiAqICAgaW5BcnJheSwgeG9yXG4gKlxuICogVHlwZXNjcmlwdCB0eXBlcyBhbmQgaW50ZXJmYWNlczpcbiAqICAgU2NoZW1hUHJpbWl0aXZlVHlwZSwgU2NoZW1hVHlwZSwgSmF2YVNjcmlwdFByaW1pdGl2ZVR5cGUsIEphdmFTY3JpcHRUeXBlLFxuICogICBQcmltaXRpdmVWYWx1ZSwgUGxhaW5PYmplY3QsIElWYWxpZGF0b3JGbiwgQXN5bmNJVmFsaWRhdG9yRm5cbiAqXG4gKiBOb3RlOiAnSVZhbGlkYXRvckZuJyBpcyBzaG9ydCBmb3IgJ2ludmVydGFibGUgdmFsaWRhdG9yIGZ1bmN0aW9uJyxcbiAqICAgd2hpY2ggaXMgYSB2YWxpZGF0b3IgZnVuY3Rpb25zIHRoYXQgYWNjZXB0cyBhbiBvcHRpb25hbCBzZWNvbmRcbiAqICAgYXJndW1lbnQgd2hpY2gsIGlmIHNldCB0byBUUlVFLCBjYXVzZXMgdGhlIHZhbGlkYXRvciB0byBwZXJmb3JtXG4gKiAgIHRoZSBvcHBvc2l0ZSBvZiBpdHMgb3JpZ2luYWwgZnVuY3Rpb24uXG4gKi9cblxuZXhwb3J0IHR5cGUgU2NoZW1hUHJpbWl0aXZlVHlwZSA9XG4gICdzdHJpbmcnIHwgJ251bWJlcicgfCAnaW50ZWdlcicgfCAnYm9vbGVhbicgfCAnbnVsbCc7XG5leHBvcnQgdHlwZSBTY2hlbWFUeXBlID1cbiAgJ3N0cmluZycgfCAnbnVtYmVyJyB8ICdpbnRlZ2VyJyB8ICdib29sZWFuJyB8ICdudWxsJyB8ICdvYmplY3QnIHwgJ2FycmF5JztcbmV4cG9ydCB0eXBlIEphdmFTY3JpcHRQcmltaXRpdmVUeXBlID1cbiAgJ3N0cmluZycgfCAnbnVtYmVyJyB8ICdib29sZWFuJyB8ICdudWxsJyB8ICd1bmRlZmluZWQnO1xuZXhwb3J0IHR5cGUgSmF2YVNjcmlwdFR5cGUgPVxuICAnc3RyaW5nJyB8ICdudW1iZXInIHwgJ2Jvb2xlYW4nIHwgJ251bGwnIHwgJ3VuZGVmaW5lZCcgfCAnb2JqZWN0JyB8ICdhcnJheScgfFxuICAnbWFwJyB8ICdzZXQnIHwgJ2FyZ3VtZW50cycgfCAnZGF0ZScgfCAnZXJyb3InIHwgJ2Z1bmN0aW9uJyB8ICdqc29uJyB8XG4gICdtYXRoJyB8ICdyZWdleHAnOyAvLyBOb3RlOiB0aGlzIGxpc3QgaXMgaW5jb21wbGV0ZVxuZXhwb3J0IHR5cGUgUHJpbWl0aXZlVmFsdWUgPSBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZDtcbmV4cG9ydCBpbnRlcmZhY2UgUGxhaW5PYmplY3QgeyBbazogc3RyaW5nXTogYW55OyB9XG5cbmV4cG9ydCB0eXBlIElWYWxpZGF0b3JGbiA9IChjOiBBYnN0cmFjdENvbnRyb2wsIGk/OiBib29sZWFuKSA9PiBQbGFpbk9iamVjdDtcbmV4cG9ydCB0eXBlIEFzeW5jSVZhbGlkYXRvckZuID0gKGM6IEFic3RyYWN0Q29udHJvbCwgaT86IGJvb2xlYW4pID0+IGFueTtcblxuLyoqXG4gKiAnX2V4ZWN1dGVWYWxpZGF0b3JzJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogVmFsaWRhdGVzIGEgY29udHJvbCBhZ2FpbnN0IGFuIGFycmF5IG9mIHZhbGlkYXRvcnMsIGFuZCByZXR1cm5zXG4gKiBhbiBhcnJheSBvZiB0aGUgc2FtZSBsZW5ndGggY29udGFpbmluZyBhIGNvbWJpbmF0aW9uIG9mIGVycm9yIG1lc3NhZ2VzXG4gKiAoZnJvbSBpbnZhbGlkIHZhbGlkYXRvcnMpIGFuZCBudWxsIHZhbHVlcyAoZnJvbSB2YWxpZCB2YWxpZGF0b3JzKVxuICpcbiAqIC8vICB7IEFic3RyYWN0Q29udHJvbCB9IGNvbnRyb2wgLSBjb250cm9sIHRvIHZhbGlkYXRlXG4gKiAvLyAgeyBJVmFsaWRhdG9yRm5bXSB9IHZhbGlkYXRvcnMgLSBhcnJheSBvZiB2YWxpZGF0b3JzXG4gKiAvLyAgeyBib29sZWFuIH0gaW52ZXJ0IC0gaW52ZXJ0P1xuICogLy8geyBQbGFpbk9iamVjdFtdIH0gLSBhcnJheSBvZiBudWxscyBhbmQgZXJyb3IgbWVzc2FnZVxuICovXG5leHBvcnQgZnVuY3Rpb24gX2V4ZWN1dGVWYWxpZGF0b3JzKGNvbnRyb2wsIHZhbGlkYXRvcnMsIGludmVydCA9IGZhbHNlKSB7XG4gIHJldHVybiB2YWxpZGF0b3JzLm1hcCh2YWxpZGF0b3IgPT4gdmFsaWRhdG9yKGNvbnRyb2wsIGludmVydCkpO1xufVxuXG4vKipcbiAqICdfZXhlY3V0ZUFzeW5jVmFsaWRhdG9ycycgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIFZhbGlkYXRlcyBhIGNvbnRyb2wgYWdhaW5zdCBhbiBhcnJheSBvZiBhc3luYyB2YWxpZGF0b3JzLCBhbmQgcmV0dXJuc1xuICogYW4gYXJyYXkgb2Ygb2JzZXJ2YWJlIHJlc3VsdHMgb2YgdGhlIHNhbWUgbGVuZ3RoIGNvbnRhaW5pbmcgYSBjb21iaW5hdGlvbiBvZlxuICogZXJyb3IgbWVzc2FnZXMgKGZyb20gaW52YWxpZCB2YWxpZGF0b3JzKSBhbmQgbnVsbCB2YWx1ZXMgKGZyb20gdmFsaWQgb25lcylcbiAqXG4gKiAvLyAgeyBBYnN0cmFjdENvbnRyb2wgfSBjb250cm9sIC0gY29udHJvbCB0byB2YWxpZGF0ZVxuICogLy8gIHsgQXN5bmNJVmFsaWRhdG9yRm5bXSB9IHZhbGlkYXRvcnMgLSBhcnJheSBvZiBhc3luYyB2YWxpZGF0b3JzXG4gKiAvLyAgeyBib29sZWFuIH0gaW52ZXJ0IC0gaW52ZXJ0P1xuICogLy8gIC0gYXJyYXkgb2Ygb2JzZXJ2YWJsZSBudWxscyBhbmQgZXJyb3IgbWVzc2FnZVxuICovXG5leHBvcnQgZnVuY3Rpb24gX2V4ZWN1dGVBc3luY1ZhbGlkYXRvcnMoY29udHJvbCwgdmFsaWRhdG9ycywgaW52ZXJ0ID0gZmFsc2UpIHtcbiAgcmV0dXJuIHZhbGlkYXRvcnMubWFwKHZhbGlkYXRvciA9PiB2YWxpZGF0b3IoY29udHJvbCwgaW52ZXJ0KSk7XG59XG5cbi8qKlxuICogJ19tZXJnZU9iamVjdHMnIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBSZWN1cnNpdmVseSBNZXJnZXMgb25lIG9yIG1vcmUgb2JqZWN0cyBpbnRvIGEgc2luZ2xlIG9iamVjdCB3aXRoIGNvbWJpbmVkIGtleXMuXG4gKiBBdXRvbWF0aWNhbGx5IGRldGVjdHMgYW5kIGlnbm9yZXMgbnVsbCBhbmQgdW5kZWZpbmVkIGlucHV0cy5cbiAqIEFsc28gZGV0ZWN0cyBkdXBsaWNhdGVkIGJvb2xlYW4gJ25vdCcga2V5cyBhbmQgWE9ScyB0aGVpciB2YWx1ZXMuXG4gKlxuICogLy8gIHsgUGxhaW5PYmplY3RbXSB9IG9iamVjdHMgLSBvbmUgb3IgbW9yZSBvYmplY3RzIHRvIG1lcmdlXG4gKiAvLyB7IFBsYWluT2JqZWN0IH0gLSBtZXJnZWQgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfbWVyZ2VPYmplY3RzKC4uLm9iamVjdHMpIHtcbiAgY29uc3QgbWVyZ2VkT2JqZWN0OiBQbGFpbk9iamVjdCA9IHsgfTtcbiAgZm9yIChjb25zdCBjdXJyZW50T2JqZWN0IG9mIG9iamVjdHMpIHtcbiAgICBpZiAoaXNPYmplY3QoY3VycmVudE9iamVjdCkpIHtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGN1cnJlbnRPYmplY3QpKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IGN1cnJlbnRPYmplY3Rba2V5XTtcbiAgICAgICAgY29uc3QgbWVyZ2VkVmFsdWUgPSBtZXJnZWRPYmplY3Rba2V5XTtcbiAgICAgICAgbWVyZ2VkT2JqZWN0W2tleV0gPSAhaXNEZWZpbmVkKG1lcmdlZFZhbHVlKSA/IGN1cnJlbnRWYWx1ZSA6XG4gICAgICAgICAga2V5ID09PSAnbm90JyAmJiBpc0Jvb2xlYW4obWVyZ2VkVmFsdWUsICdzdHJpY3QnKSAmJlxuICAgICAgICAgICAgaXNCb29sZWFuKGN1cnJlbnRWYWx1ZSwgJ3N0cmljdCcpID8geG9yKG1lcmdlZFZhbHVlLCBjdXJyZW50VmFsdWUpIDpcbiAgICAgICAgICBnZXRUeXBlKG1lcmdlZFZhbHVlKSA9PT0gJ29iamVjdCcgJiYgZ2V0VHlwZShjdXJyZW50VmFsdWUpID09PSAnb2JqZWN0JyA/XG4gICAgICAgICAgICBfbWVyZ2VPYmplY3RzKG1lcmdlZFZhbHVlLCBjdXJyZW50VmFsdWUpIDpcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1lcmdlZE9iamVjdDtcbn1cblxuLyoqXG4gKiAnX21lcmdlRXJyb3JzJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogTWVyZ2VzIGFuIGFycmF5IG9mIG9iamVjdHMuXG4gKiBVc2VkIGZvciBjb21iaW5pbmcgdGhlIHZhbGlkYXRvciBlcnJvcnMgcmV0dXJuZWQgZnJvbSAnZXhlY3V0ZVZhbGlkYXRvcnMnXG4gKlxuICogLy8gIHsgUGxhaW5PYmplY3RbXSB9IGFycmF5T2ZFcnJvcnMgLSBhcnJheSBvZiBvYmplY3RzXG4gKiAvLyB7IFBsYWluT2JqZWN0IH0gLSBtZXJnZWQgb2JqZWN0LCBvciBudWxsIGlmIG5vIHVzYWJsZSBpbnB1dCBvYmplY3Rjc1xuICovXG5leHBvcnQgZnVuY3Rpb24gX21lcmdlRXJyb3JzKGFycmF5T2ZFcnJvcnMpIHtcbiAgY29uc3QgbWVyZ2VkRXJyb3JzID0gX21lcmdlT2JqZWN0cyguLi5hcnJheU9mRXJyb3JzKTtcbiAgcmV0dXJuIGlzRW1wdHkobWVyZ2VkRXJyb3JzKSA/IG51bGwgOiBtZXJnZWRFcnJvcnM7XG59XG5cbi8qKlxuICogJ2lzRGVmaW5lZCcgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIENoZWNrcyBpZiBhIHZhcmlhYmxlIGNvbnRhaW5zIGEgdmFsdWUgb2YgYW55IHR5cGUuXG4gKiBSZXR1cm5zIHRydWUgZXZlbiBmb3Igb3RoZXJ3aXNlICdmYWxzZXknIHZhbHVlcyBvZiAwLCAnJywgYW5kIGZhbHNlLlxuICpcbiAqIC8vICAgdmFsdWUgLSB0aGUgdmFsdWUgdG8gY2hlY2tcbiAqIC8vIHsgYm9vbGVhbiB9IC0gZmFsc2UgaWYgdW5kZWZpbmVkIG9yIG51bGwsIG90aGVyd2lzZSB0cnVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RlZmluZWQodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGw7XG59XG5cbi8qKlxuICogJ2hhc1ZhbHVlJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIGlmIGEgdmFyaWFibGUgY29udGFpbnMgYSB2YWx1ZS5cbiAqIFJldHVycyBmYWxzZSBmb3IgbnVsbCwgdW5kZWZpbmVkLCBvciBhIHplcm8tbGVuZ3RoIHN0cm5nLCAnJyxcbiAqIG90aGVyd2lzZSByZXR1cm5zIHRydWUuXG4gKiAoU3RyaWN0ZXIgdGhhbiAnaXNEZWZpbmVkJyBiZWNhdXNlIGl0IGFsc28gcmV0dXJucyBmYWxzZSBmb3IgJycsXG4gKiB0aG91Z2ggaXQgc3RpbCByZXR1cm5zIHRydWUgZm9yIG90aGVyd2lzZSAnZmFsc2V5JyB2YWx1ZXMgMCBhbmQgZmFsc2UuKVxuICpcbiAqIC8vICAgdmFsdWUgLSB0aGUgdmFsdWUgdG8gY2hlY2tcbiAqIC8vIHsgYm9vbGVhbiB9IC0gZmFsc2UgaWYgdW5kZWZpbmVkLCBudWxsLCBvciAnJywgb3RoZXJ3aXNlIHRydWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc1ZhbHVlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSAnJztcbn1cblxuLyoqXG4gKiAnaXNFbXB0eScgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIFNpbWlsYXIgdG8gIWhhc1ZhbHVlLCBidXQgYWxzbyByZXR1cm5zIHRydWUgZm9yIGVtcHR5IGFycmF5cyBhbmQgb2JqZWN0cy5cbiAqXG4gKiAvLyAgIHZhbHVlIC0gdGhlIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyB7IGJvb2xlYW4gfSAtIGZhbHNlIGlmIHVuZGVmaW5lZCwgbnVsbCwgb3IgJycsIG90aGVyd2lzZSB0cnVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIGlmIChpc0FycmF5KHZhbHVlKSkgeyByZXR1cm4gIXZhbHVlLmxlbmd0aDsgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7IHJldHVybiAhT2JqZWN0LmtleXModmFsdWUpLmxlbmd0aDsgfVxuICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJyc7XG59XG5cbi8qKlxuICogJ2lzU3RyaW5nJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgYSBzdHJpbmcuXG4gKlxuICogLy8gICB2YWx1ZSAtIHRoZSB2YWx1ZSB0byBjaGVja1xuICogLy8geyBib29sZWFuIH0gLSB0cnVlIGlmIHN0cmluZywgZmFsc2UgaWYgbm90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiAnaXNOdW1iZXInIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3MgaWYgYSB2YWx1ZSBpcyBhIHJlZ3VsYXIgbnVtYmVyLCBudW1lcmljIHN0cmluZywgb3IgSmF2YVNjcmlwdCBEYXRlLlxuICpcbiAqIC8vICAgdmFsdWUgLSB0aGUgdmFsdWUgdG8gY2hlY2tcbiAqIC8vICB7IGFueSA9IGZhbHNlIH0gc3RyaWN0IC0gaWYgdHJ1dGh5LCBhbHNvIGNoZWNrcyBKYXZhU2NyaXB0IHR5b2VcbiAqIC8vIHsgYm9vbGVhbiB9IC0gdHJ1ZSBpZiBudW1iZXIsIGZhbHNlIGlmIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1iZXIodmFsdWUsIHN0cmljdDogYW55ID0gZmFsc2UpIHtcbiAgaWYgKHN0cmljdCAmJiB0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSB7IHJldHVybiBmYWxzZTsgfVxuICByZXR1cm4gIWlzTmFOKHZhbHVlKSAmJiB2YWx1ZSAhPT0gdmFsdWUgLyAwO1xufVxuXG4vKipcbiAqICdpc0ludGVnZXInIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3MgaWYgYSB2YWx1ZSBpcyBhbiBpbnRlZ2VyLlxuICpcbiAqIC8vICAgdmFsdWUgLSB0aGUgdmFsdWUgdG8gY2hlY2tcbiAqIC8vICB7IGFueSA9IGZhbHNlIH0gc3RyaWN0IC0gaWYgdHJ1dGh5LCBhbHNvIGNoZWNrcyBKYXZhU2NyaXB0IHR5b2VcbiAqIC8vIHtib29sZWFuIH0gLSB0cnVlIGlmIG51bWJlciwgZmFsc2UgaWYgbm90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0ludGVnZXIodmFsdWUsIHN0cmljdDogYW55ID0gZmFsc2UpIHtcbiAgaWYgKHN0cmljdCAmJiB0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSB7IHJldHVybiBmYWxzZTsgfVxuICByZXR1cm4gIWlzTmFOKHZhbHVlKSAmJiAgdmFsdWUgIT09IHZhbHVlIC8gMCAmJiB2YWx1ZSAlIDEgPT09IDA7XG59XG5cbi8qKlxuICogJ2lzQm9vbGVhbicgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIENoZWNrcyBpZiBhIHZhbHVlIGlzIGEgYm9vbGVhbi5cbiAqXG4gKiAvLyAgIHZhbHVlIC0gdGhlIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyAgeyBhbnkgPSBudWxsIH0gb3B0aW9uIC0gaWYgJ3N0cmljdCcsIGFsc28gY2hlY2tzIEphdmFTY3JpcHQgdHlwZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBUUlVFIG9yIEZBTFNFLCBjaGVja3Mgb25seSBmb3IgdGhhdCB2YWx1ZVxuICogLy8geyBib29sZWFuIH0gLSB0cnVlIGlmIGJvb2xlYW4sIGZhbHNlIGlmIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCb29sZWFuKHZhbHVlLCBvcHRpb246IGFueSA9IG51bGwpIHtcbiAgaWYgKG9wdGlvbiA9PT0gJ3N0cmljdCcpIHsgcmV0dXJuIHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSBmYWxzZTsgfVxuICBpZiAob3B0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSAxIHx8IHZhbHVlID09PSAndHJ1ZScgfHwgdmFsdWUgPT09ICcxJztcbiAgfVxuICBpZiAob3B0aW9uID09PSBmYWxzZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gZmFsc2UgfHwgdmFsdWUgPT09IDAgfHwgdmFsdWUgPT09ICdmYWxzZScgfHwgdmFsdWUgPT09ICcwJztcbiAgfVxuICByZXR1cm4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IDEgfHwgdmFsdWUgPT09ICd0cnVlJyB8fCB2YWx1ZSA9PT0gJzEnIHx8XG4gICAgdmFsdWUgPT09IGZhbHNlIHx8IHZhbHVlID09PSAwIHx8IHZhbHVlID09PSAnZmFsc2UnIHx8IHZhbHVlID09PSAnMCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGl0ZW06IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIGl0ZW0gPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdChpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIGl0ZW0gIT09IG51bGwgJiYgdHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnICYmXG4gICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZW0pID09PSAnW29iamVjdCBPYmplY3RdJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQXJyYXkoaXRlbTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGl0ZW0pIHx8XG4gICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZW0pID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRlKGl0ZW06IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnICYmXG4gICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZW0pID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc01hcChpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVtKSA9PT0gJ1tvYmplY3QgTWFwXSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NldChpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVtKSA9PT0gJ1tvYmplY3QgU2V0XSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N5bWJvbChpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSAnc3ltYm9sJztcbn1cblxuLyoqXG4gKiAnZ2V0VHlwZScgZnVuY3Rpb25cbiAqXG4gKiBEZXRlY3RzIHRoZSBKU09OIFNjaGVtYSBUeXBlIG9mIGEgdmFsdWUuXG4gKiBCeSBkZWZhdWx0LCBkZXRlY3RzIG51bWJlcnMgYW5kIGludGVnZXJzIGV2ZW4gaWYgZm9ybWF0dGVkIGFzIHN0cmluZ3MuXG4gKiAoU28gYWxsIGludGVnZXJzIGFyZSBhbHNvIG51bWJlcnMsIGFuZCBhbnkgbnVtYmVyIG1heSBhbHNvIGJlIGEgc3RyaW5nLilcbiAqIEhvd2V2ZXIsIGl0IG9ubHkgZGV0ZWN0cyB0cnVlIGJvb2xlYW4gdmFsdWVzICh0byBkZXRlY3QgYm9vbGVhbiB2YWx1ZXNcbiAqIGluIG5vbi1ib29sZWFuIGZvcm1hdHMsIHVzZSBpc0Jvb2xlYW4oKSBpbnN0ZWFkKS5cbiAqXG4gKiBJZiBwYXNzZWQgYSBzZWNvbmQgb3B0aW9uYWwgcGFyYW1ldGVyIG9mICdzdHJpY3QnLCBpdCB3aWxsIG9ubHkgZGV0ZWN0XG4gKiBudW1iZXJzIGFuZCBpbnRlZ2VycyBpZiB0aGV5IGFyZSBmb3JtYXR0ZWQgYXMgSmF2YVNjcmlwdCBudW1iZXJzLlxuICpcbiAqIEV4YW1wbGVzOlxuICogZ2V0VHlwZSgnMTAuNScpID0gJ251bWJlcidcbiAqIGdldFR5cGUoMTAuNSkgPSAnbnVtYmVyJ1xuICogZ2V0VHlwZSgnMTAnKSA9ICdpbnRlZ2VyJ1xuICogZ2V0VHlwZSgxMCkgPSAnaW50ZWdlcidcbiAqIGdldFR5cGUoJ3RydWUnKSA9ICdzdHJpbmcnXG4gKiBnZXRUeXBlKHRydWUpID0gJ2Jvb2xlYW4nXG4gKiBnZXRUeXBlKG51bGwpID0gJ251bGwnXG4gKiBnZXRUeXBlKHsgfSkgPSAnb2JqZWN0J1xuICogZ2V0VHlwZShbXSkgPSAnYXJyYXknXG4gKlxuICogZ2V0VHlwZSgnMTAuNScsICdzdHJpY3QnKSA9ICdzdHJpbmcnXG4gKiBnZXRUeXBlKDEwLjUsICdzdHJpY3QnKSA9ICdudW1iZXInXG4gKiBnZXRUeXBlKCcxMCcsICdzdHJpY3QnKSA9ICdzdHJpbmcnXG4gKiBnZXRUeXBlKDEwLCAnc3RyaWN0JykgPSAnaW50ZWdlcidcbiAqIGdldFR5cGUoJ3RydWUnLCAnc3RyaWN0JykgPSAnc3RyaW5nJ1xuICogZ2V0VHlwZSh0cnVlLCAnc3RyaWN0JykgPSAnYm9vbGVhbidcbiAqXG4gKiAvLyAgIHZhbHVlIC0gdmFsdWUgdG8gY2hlY2tcbiAqIC8vICB7IGFueSA9IGZhbHNlIH0gc3RyaWN0IC0gaWYgdHJ1dGh5LCBhbHNvIGNoZWNrcyBKYXZhU2NyaXB0IHR5b2VcbiAqIC8vIHsgU2NoZW1hVHlwZSB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlKHZhbHVlLCBzdHJpY3Q6IGFueSA9IGZhbHNlKSB7XG4gIGlmICghaXNEZWZpbmVkKHZhbHVlKSkgeyByZXR1cm4gJ251bGwnOyB9XG4gIGlmIChpc0FycmF5KHZhbHVlKSkgeyByZXR1cm4gJ2FycmF5JzsgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7IHJldHVybiAnb2JqZWN0JzsgfVxuICBpZiAoaXNCb29sZWFuKHZhbHVlLCAnc3RyaWN0JykpIHsgcmV0dXJuICdib29sZWFuJzsgfVxuICBpZiAoaXNJbnRlZ2VyKHZhbHVlLCBzdHJpY3QpKSB7IHJldHVybiAnaW50ZWdlcic7IH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlLCBzdHJpY3QpKSB7IHJldHVybiAnbnVtYmVyJzsgfVxuICBpZiAoaXNTdHJpbmcodmFsdWUpIHx8ICghc3RyaWN0ICYmIGlzRGF0ZSh2YWx1ZSkpKSB7IHJldHVybiAnc3RyaW5nJzsgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiAnaXNUeXBlJyBmdW5jdGlvblxuICpcbiAqIENoZWNrcyB3ZXRoZXIgYW4gaW5wdXQgKHByb2JhYmx5IHN0cmluZykgdmFsdWUgY29udGFpbnMgZGF0YSBvZlxuICogYSBzcGVjaWZpZWQgSlNPTiBTY2hlbWEgdHlwZVxuICpcbiAqIC8vICB7IFByaW1pdGl2ZVZhbHVlIH0gdmFsdWUgLSB2YWx1ZSB0byBjaGVja1xuICogLy8gIHsgU2NoZW1hUHJpbWl0aXZlVHlwZSB9IHR5cGUgLSB0eXBlIHRvIGNoZWNrXG4gKiAvLyB7IGJvb2xlYW4gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNUeXBlKHZhbHVlLCB0eXBlKSB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gaXNTdHJpbmcodmFsdWUpIHx8IGlzRGF0ZSh2YWx1ZSk7XG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBpc051bWJlcih2YWx1ZSk7XG4gICAgY2FzZSAnaW50ZWdlcic6XG4gICAgICByZXR1cm4gaXNJbnRlZ2VyKHZhbHVlKTtcbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiBpc0Jvb2xlYW4odmFsdWUpO1xuICAgIGNhc2UgJ251bGwnOlxuICAgICAgcmV0dXJuICFoYXNWYWx1ZSh2YWx1ZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZXJyb3IoYGlzVHlwZSBlcnJvcjogXCIke3R5cGV9XCIgaXMgbm90IGEgcmVjb2duaXplZCB0eXBlLmApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiAnaXNQcmltaXRpdmUnIGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIHdldGhlciBhbiBpbnB1dCB2YWx1ZSBpcyBhIEphdmFTY3JpcHQgcHJpbWl0aXZlIHR5cGU6XG4gKiBzdHJpbmcsIG51bWJlciwgYm9vbGVhbiwgb3IgbnVsbC5cbiAqXG4gKiAvLyAgIHZhbHVlIC0gdmFsdWUgdG8gY2hlY2tcbiAqIC8vIHsgYm9vbGVhbiB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ByaW1pdGl2ZSh2YWx1ZSkge1xuICByZXR1cm4gKGlzU3RyaW5nKHZhbHVlKSB8fCBpc051bWJlcih2YWx1ZSkgfHxcbiAgICBpc0Jvb2xlYW4odmFsdWUsICdzdHJpY3QnKSB8fCB2YWx1ZSA9PT0gbnVsbCk7XG59XG5cbi8qKlxuICogJ3RvSmF2YVNjcmlwdFR5cGUnIGZ1bmN0aW9uXG4gKlxuICogQ29udmVydHMgYW4gaW5wdXQgKHByb2JhYmx5IHN0cmluZykgdmFsdWUgdG8gYSBKYXZhU2NyaXB0IHByaW1pdGl2ZSB0eXBlIC1cbiAqICdzdHJpbmcnLCAnbnVtYmVyJywgJ2Jvb2xlYW4nLCBvciAnbnVsbCcgLSBiZWZvcmUgc3RvcmluZyBpbiBhIEpTT04gb2JqZWN0LlxuICpcbiAqIERvZXMgbm90IGNvZXJjZSB2YWx1ZXMgKG90aGVyIHRoYW4gbnVsbCksIGFuZCBvbmx5IGNvbnZlcnRzIHRoZSB0eXBlc1xuICogb2YgdmFsdWVzIHRoYXQgd291bGQgb3RoZXJ3aXNlIGJlIHZhbGlkLlxuICpcbiAqIElmIHRoZSBvcHRpb25hbCB0aGlyZCBwYXJhbWV0ZXIgJ3N0cmljdEludGVnZXJzJyBpcyBUUlVFLCBhbmQgdGhlXG4gKiBKU09OIFNjaGVtYSB0eXBlICdpbnRlZ2VyJyBpcyBzcGVjaWZpZWQsIGl0IGFsc28gdmVyaWZpZXMgdGhlIGlucHV0IHZhbHVlXG4gKiBpcyBhbiBpbnRlZ2VyIGFuZCwgaWYgaXQgaXMsIHJldHVybnMgaXQgYXMgYSBKYXZlU2NyaXB0IG51bWJlci5cbiAqIElmICdzdHJpY3RJbnRlZ2VycycgaXMgRkFMU0UgKG9yIG5vdCBzZXQpIHRoZSB0eXBlICdpbnRlZ2VyJyBpcyB0cmVhdGVkXG4gKiBleGFjdGx5IHRoZSBzYW1lIGFzICdudW1iZXInLCBhbmQgYWxsb3dzIGRlY2ltYWxzLlxuICpcbiAqIFZhbGlkIEV4YW1wbGVzOlxuICogdG9KYXZhU2NyaXB0VHlwZSgnMTAnLCAgICdudW1iZXInICkgPSAxMCAgIC8vICcxMCcgICBpcyBhIG51bWJlclxuICogdG9KYXZhU2NyaXB0VHlwZSgnMTAnLCAgICdpbnRlZ2VyJykgPSAxMCAgIC8vICcxMCcgICBpcyBhbHNvIGFuIGludGVnZXJcbiAqIHRvSmF2YVNjcmlwdFR5cGUoIDEwLCAgICAnaW50ZWdlcicpID0gMTAgICAvLyAgMTAgICAgaXMgc3RpbGwgYW4gaW50ZWdlclxuICogdG9KYXZhU2NyaXB0VHlwZSggMTAsICAgICdzdHJpbmcnICkgPSAnMTAnIC8vICAxMCAgICBjYW4gYmUgbWFkZSBpbnRvIGEgc3RyaW5nXG4gKiB0b0phdmFTY3JpcHRUeXBlKCcxMC41JywgJ251bWJlcicgKSA9IDEwLjUgLy8gJzEwLjUnIGlzIGEgbnVtYmVyXG4gKlxuICogSW52YWxpZCBFeGFtcGxlczpcbiAqIHRvSmF2YVNjcmlwdFR5cGUoJzEwLjUnLCAnaW50ZWdlcicpID0gbnVsbCAvLyAnMTAuNScgaXMgbm90IGFuIGludGVnZXJcbiAqIHRvSmF2YVNjcmlwdFR5cGUoIDEwLjUsICAnaW50ZWdlcicpID0gbnVsbCAvLyAgMTAuNSAgaXMgc3RpbGwgbm90IGFuIGludGVnZXJcbiAqXG4gKiAvLyAgeyBQcmltaXRpdmVWYWx1ZSB9IHZhbHVlIC0gdmFsdWUgdG8gY29udmVydFxuICogLy8gIHsgU2NoZW1hUHJpbWl0aXZlVHlwZSB8IFNjaGVtYVByaW1pdGl2ZVR5cGVbXSB9IHR5cGVzIC0gdHlwZXMgdG8gY29udmVydCB0b1xuICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gc3RyaWN0SW50ZWdlcnMgLSBpZiBGQUxTRSwgdHJlYXQgaW50ZWdlcnMgYXMgbnVtYmVyc1xuICogLy8geyBQcmltaXRpdmVWYWx1ZSB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0phdmFTY3JpcHRUeXBlKHZhbHVlLCB0eXBlcywgc3RyaWN0SW50ZWdlcnMgPSB0cnVlKSAge1xuICBpZiAoIWlzRGVmaW5lZCh2YWx1ZSkpIHsgcmV0dXJuIG51bGw7IH1cbiAgaWYgKGlzU3RyaW5nKHR5cGVzKSkgeyB0eXBlcyA9IFt0eXBlc107IH1cbiAgaWYgKHN0cmljdEludGVnZXJzICYmIGluQXJyYXkoJ2ludGVnZXInLCB0eXBlcykpIHtcbiAgICBpZiAoaXNJbnRlZ2VyKHZhbHVlLCAnc3RyaWN0JykpIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgaWYgKGlzSW50ZWdlcih2YWx1ZSkpIHsgcmV0dXJuIHBhcnNlSW50KHZhbHVlLCAxMCk7IH1cbiAgfVxuICBpZiAoaW5BcnJheSgnbnVtYmVyJywgdHlwZXMpIHx8ICghc3RyaWN0SW50ZWdlcnMgJiYgaW5BcnJheSgnaW50ZWdlcicsIHR5cGVzKSkpIHtcbiAgICBpZiAoaXNOdW1iZXIodmFsdWUsICdzdHJpY3QnKSkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICBpZiAoaXNOdW1iZXIodmFsdWUpKSB7IHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKTsgfVxuICB9XG4gIGlmIChpbkFycmF5KCdzdHJpbmcnLCB0eXBlcykpIHtcbiAgICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgIC8vIElmIHZhbHVlIGlzIGEgZGF0ZSwgYW5kIHR5cGVzIGluY2x1ZGVzICdzdHJpbmcnLFxuICAgIC8vIGNvbnZlcnQgdGhlIGRhdGUgdG8gYSBzdHJpbmdcbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkgeyByZXR1cm4gdmFsdWUudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7IH1cbiAgICBpZiAoaXNOdW1iZXIodmFsdWUpKSB7IHJldHVybiB2YWx1ZS50b1N0cmluZygpOyB9XG4gIH1cbiAgLy8gSWYgdmFsdWUgaXMgYSBkYXRlLCBhbmQgdHlwZXMgaW5jbHVkZXMgJ2ludGVnZXInIG9yICdudW1iZXInLFxuICAvLyBidXQgbm90ICdzdHJpbmcnLCBjb252ZXJ0IHRoZSBkYXRlIHRvIGEgbnVtYmVyXG4gIGlmIChpc0RhdGUodmFsdWUpICYmIChpbkFycmF5KCdpbnRlZ2VyJywgdHlwZXMpIHx8IGluQXJyYXkoJ251bWJlcicsIHR5cGVzKSkpIHtcbiAgICByZXR1cm4gdmFsdWUuZ2V0VGltZSgpO1xuICB9XG4gIGlmIChpbkFycmF5KCdib29sZWFuJywgdHlwZXMpKSB7XG4gICAgaWYgKGlzQm9vbGVhbih2YWx1ZSwgdHJ1ZSkpIHsgcmV0dXJuIHRydWU7IH1cbiAgICBpZiAoaXNCb29sZWFuKHZhbHVlLCBmYWxzZSkpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogJ3RvU2NoZW1hVHlwZScgZnVuY3Rpb25cbiAqXG4gKiBDb252ZXJ0cyBhbiBpbnB1dCAocHJvYmFibHkgc3RyaW5nKSB2YWx1ZSB0byB0aGUgXCJiZXN0XCIgSmF2YVNjcmlwdFxuICogZXF1aXZhbGVudCBhdmFpbGFibGUgZnJvbSBhbiBhbGxvd2VkIGxpc3Qgb2YgSlNPTiBTY2hlbWEgdHlwZXMsIHdoaWNoIG1heVxuICogY29udGFpbiAnc3RyaW5nJywgJ251bWJlcicsICdpbnRlZ2VyJywgJ2Jvb2xlYW4nLCBhbmQvb3IgJ251bGwnLlxuICogSWYgbmVjc3NhcnksIGl0IGRvZXMgcHJvZ3Jlc3NpdmVseSBhZ3Jlc3NpdmUgdHlwZSBjb2Vyc2lvbi5cbiAqIEl0IHdpbGwgbm90IHJldHVybiBudWxsIHVubGVzcyBudWxsIGlzIGluIHRoZSBsaXN0IG9mIGFsbG93ZWQgdHlwZXMuXG4gKlxuICogTnVtYmVyIGNvbnZlcnNpb24gZXhhbXBsZXM6XG4gKiB0b1NjaGVtYVR5cGUoJzEwJywgWydudW1iZXInLCdpbnRlZ2VyJywnc3RyaW5nJ10pID0gMTAgLy8gaW50ZWdlclxuICogdG9TY2hlbWFUeXBlKCcxMCcsIFsnbnVtYmVyJywnc3RyaW5nJ10pID0gMTAgLy8gbnVtYmVyXG4gKiB0b1NjaGVtYVR5cGUoJzEwJywgWydzdHJpbmcnXSkgPSAnMTAnIC8vIHN0cmluZ1xuICogdG9TY2hlbWFUeXBlKCcxMC41JywgWydudW1iZXInLCdpbnRlZ2VyJywnc3RyaW5nJ10pID0gMTAuNSAvLyBudW1iZXJcbiAqIHRvU2NoZW1hVHlwZSgnMTAuNScsIFsnaW50ZWdlcicsJ3N0cmluZyddKSA9ICcxMC41JyAvLyBzdHJpbmdcbiAqIHRvU2NoZW1hVHlwZSgnMTAuNScsIFsnaW50ZWdlciddKSA9IDEwIC8vIGludGVnZXJcbiAqIHRvU2NoZW1hVHlwZSgxMC41LCBbJ251bGwnLCdib29sZWFuJywnc3RyaW5nJ10pID0gJzEwLjUnIC8vIHN0cmluZ1xuICogdG9TY2hlbWFUeXBlKDEwLjUsIFsnbnVsbCcsJ2Jvb2xlYW4nXSkgPSB0cnVlIC8vIGJvb2xlYW5cbiAqXG4gKiBTdHJpbmcgY29udmVyc2lvbiBleGFtcGxlczpcbiAqIHRvU2NoZW1hVHlwZSgnMS41eCcsIFsnYm9vbGVhbicsJ251bWJlcicsJ2ludGVnZXInLCdzdHJpbmcnXSkgPSAnMS41eCcgLy8gc3RyaW5nXG4gKiB0b1NjaGVtYVR5cGUoJzEuNXgnLCBbJ2Jvb2xlYW4nLCdudW1iZXInLCdpbnRlZ2VyJ10pID0gJzEuNScgLy8gbnVtYmVyXG4gKiB0b1NjaGVtYVR5cGUoJzEuNXgnLCBbJ2Jvb2xlYW4nLCdpbnRlZ2VyJ10pID0gJzEnIC8vIGludGVnZXJcbiAqIHRvU2NoZW1hVHlwZSgnMS41eCcsIFsnYm9vbGVhbiddKSA9IHRydWUgLy8gYm9vbGVhblxuICogdG9TY2hlbWFUeXBlKCd4eXonLCBbJ251bWJlcicsJ2ludGVnZXInLCdib29sZWFuJywnbnVsbCddKSA9IHRydWUgLy8gYm9vbGVhblxuICogdG9TY2hlbWFUeXBlKCd4eXonLCBbJ251bWJlcicsJ2ludGVnZXInLCdudWxsJ10pID0gbnVsbCAvLyBudWxsXG4gKiB0b1NjaGVtYVR5cGUoJ3h5eicsIFsnbnVtYmVyJywnaW50ZWdlciddKSA9IDAgLy8gbnVtYmVyXG4gKlxuICogQm9vbGVhbiBjb252ZXJzaW9uIGV4YW1wbGVzOlxuICogdG9TY2hlbWFUeXBlKCcxJywgWydpbnRlZ2VyJywnbnVtYmVyJywnc3RyaW5nJywnYm9vbGVhbiddKSA9IDEgLy8gaW50ZWdlclxuICogdG9TY2hlbWFUeXBlKCcxJywgWydudW1iZXInLCdzdHJpbmcnLCdib29sZWFuJ10pID0gMSAvLyBudW1iZXJcbiAqIHRvU2NoZW1hVHlwZSgnMScsIFsnc3RyaW5nJywnYm9vbGVhbiddKSA9ICcxJyAvLyBzdHJpbmdcbiAqIHRvU2NoZW1hVHlwZSgnMScsIFsnYm9vbGVhbiddKSA9IHRydWUgLy8gYm9vbGVhblxuICogdG9TY2hlbWFUeXBlKCd0cnVlJywgWydudW1iZXInLCdzdHJpbmcnLCdib29sZWFuJ10pID0gJ3RydWUnIC8vIHN0cmluZ1xuICogdG9TY2hlbWFUeXBlKCd0cnVlJywgWydib29sZWFuJ10pID0gdHJ1ZSAvLyBib29sZWFuXG4gKiB0b1NjaGVtYVR5cGUoJ3RydWUnLCBbJ251bWJlciddKSA9IDAgLy8gbnVtYmVyXG4gKiB0b1NjaGVtYVR5cGUodHJ1ZSwgWydudW1iZXInLCdzdHJpbmcnLCdib29sZWFuJ10pID0gdHJ1ZSAvLyBib29sZWFuXG4gKiB0b1NjaGVtYVR5cGUodHJ1ZSwgWydudW1iZXInLCdzdHJpbmcnXSkgPSAndHJ1ZScgLy8gc3RyaW5nXG4gKiB0b1NjaGVtYVR5cGUodHJ1ZSwgWydudW1iZXInXSkgPSAxIC8vIG51bWJlclxuICpcbiAqIC8vICB7IFByaW1pdGl2ZVZhbHVlIH0gdmFsdWUgLSB2YWx1ZSB0byBjb252ZXJ0XG4gKiAvLyAgeyBTY2hlbWFQcmltaXRpdmVUeXBlIHwgU2NoZW1hUHJpbWl0aXZlVHlwZVtdIH0gdHlwZXMgLSBhbGxvd2VkIHR5cGVzIHRvIGNvbnZlcnQgdG9cbiAqIC8vIHsgUHJpbWl0aXZlVmFsdWUgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9TY2hlbWFUeXBlKHZhbHVlLCB0eXBlcykge1xuICBpZiAoIWlzQXJyYXkoPFNjaGVtYVByaW1pdGl2ZVR5cGU+dHlwZXMpKSB7XG4gICAgdHlwZXMgPSA8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPlt0eXBlc107XG4gIH1cbiAgaWYgKCg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnbnVsbCcpICYmICFoYXNWYWx1ZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdib29sZWFuJykgJiYgIWlzQm9vbGVhbih2YWx1ZSwgJ3N0cmljdCcpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ2ludGVnZXInKSkge1xuICAgIGNvbnN0IHRlc3RWYWx1ZSA9IHRvSmF2YVNjcmlwdFR5cGUodmFsdWUsICdpbnRlZ2VyJyk7XG4gICAgaWYgKHRlc3RWYWx1ZSAhPT0gbnVsbCkgeyByZXR1cm4gK3Rlc3RWYWx1ZTsgfVxuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ251bWJlcicpKSB7XG4gICAgY29uc3QgdGVzdFZhbHVlID0gdG9KYXZhU2NyaXB0VHlwZSh2YWx1ZSwgJ251bWJlcicpO1xuICAgIGlmICh0ZXN0VmFsdWUgIT09IG51bGwpIHsgcmV0dXJuICt0ZXN0VmFsdWU7IH1cbiAgfVxuICBpZiAoXG4gICAgKGlzU3RyaW5nKHZhbHVlKSB8fCBpc051bWJlcih2YWx1ZSwgJ3N0cmljdCcpKSAmJlxuICAgICg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnc3RyaW5nJylcbiAgKSB7IC8vIENvbnZlcnQgbnVtYmVyIHRvIHN0cmluZ1xuICAgIHJldHVybiB0b0phdmFTY3JpcHRUeXBlKHZhbHVlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKCg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnYm9vbGVhbicpICYmIGlzQm9vbGVhbih2YWx1ZSkpIHtcbiAgICByZXR1cm4gdG9KYXZhU2NyaXB0VHlwZSh2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgfVxuICBpZiAoKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdzdHJpbmcnKSkgeyAvLyBDb252ZXJ0IG51bGwgJiBib29sZWFuIHRvIHN0cmluZ1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkgeyByZXR1cm4gJyc7IH1cbiAgICBjb25zdCB0ZXN0VmFsdWUgPSB0b0phdmFTY3JpcHRUeXBlKHZhbHVlLCAnc3RyaW5nJyk7XG4gICAgaWYgKHRlc3RWYWx1ZSAhPT0gbnVsbCkgeyByZXR1cm4gdGVzdFZhbHVlOyB9XG4gIH1cbiAgaWYgKChcbiAgICAoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ251bWJlcicpIHx8XG4gICAgKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdpbnRlZ2VyJykpXG4gICkge1xuICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkgeyByZXR1cm4gMTsgfSAvLyBDb252ZXJ0IGJvb2xlYW4gJiBudWxsIHRvIG51bWJlclxuICAgIGlmICh2YWx1ZSA9PT0gZmFsc2UgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSB7IHJldHVybiAwOyB9XG4gIH1cbiAgaWYgKCg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnbnVtYmVyJykpIHsgLy8gQ29udmVydCBtaXhlZCBzdHJpbmcgdG8gbnVtYmVyXG4gICAgY29uc3QgdGVzdFZhbHVlID0gcGFyc2VGbG9hdCg8c3RyaW5nPnZhbHVlKTtcbiAgICBpZiAoISF0ZXN0VmFsdWUpIHsgcmV0dXJuIHRlc3RWYWx1ZTsgfVxuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ2ludGVnZXInKSkgeyAvLyBDb252ZXJ0IHN0cmluZyBvciBudW1iZXIgdG8gaW50ZWdlclxuICAgIGNvbnN0IHRlc3RWYWx1ZSA9IHBhcnNlSW50KDxzdHJpbmc+dmFsdWUsIDEwKTtcbiAgICBpZiAoISF0ZXN0VmFsdWUpIHsgcmV0dXJuIHRlc3RWYWx1ZTsgfVxuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ2Jvb2xlYW4nKSkgeyAvLyBDb252ZXJ0IGFueXRoaW5nIHRvIGJvb2xlYW5cbiAgICByZXR1cm4gISF2YWx1ZTtcbiAgfVxuICBpZiAoKFxuICAgICAgKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdudW1iZXInKSB8fFxuICAgICAgKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdpbnRlZ2VyJylcbiAgICApICYmICEoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ251bGwnKVxuICApIHtcbiAgICByZXR1cm4gMDsgLy8gSWYgbnVsbCBub3QgYWxsb3dlZCwgcmV0dXJuIDAgZm9yIG5vbi1jb252ZXJ0YWJsZSB2YWx1ZXNcbiAgfVxufVxuXG4vKipcbiAqICdpc1Byb21pc2UnIGZ1bmN0aW9uXG4gKlxuICogLy8gICBvYmplY3RcbiAqIC8vIHsgYm9vbGVhbiB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2Uob2JqZWN0KTogb2JqZWN0IGlzIFByb21pc2U8YW55PiB7XG4gIHJldHVybiAhIW9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0LnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogJ2lzT2JzZXJ2YWJsZScgZnVuY3Rpb25cbiAqXG4gKiAvLyAgIG9iamVjdFxuICogLy8geyBib29sZWFuIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzT2JzZXJ2YWJsZShvYmplY3QpOiBvYmplY3QgaXMgT2JzZXJ2YWJsZTxhbnk+IHtcbiAgcmV0dXJuICEhb2JqZWN0ICYmIHR5cGVvZiBvYmplY3Quc3Vic2NyaWJlID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqICdfdG9Qcm9taXNlJyBmdW5jdGlvblxuICpcbiAqIC8vICB7IG9iamVjdCB9IG9iamVjdFxuICogLy8geyBQcm9taXNlPGFueT4gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gX3RvUHJvbWlzZShvYmplY3QpOiBQcm9taXNlPGFueT4ge1xuICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgPyBvYmplY3QgOiBvYmplY3QudG9Qcm9taXNlKCk7XG59XG5cbi8qKlxuICogJ3RvT2JzZXJ2YWJsZScgZnVuY3Rpb25cbiAqXG4gKiAvLyAgeyBvYmplY3QgfSBvYmplY3RcbiAqIC8vIHsgT2JzZXJ2YWJsZTxhbnk+IH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvT2JzZXJ2YWJsZShvYmplY3QpOiBPYnNlcnZhYmxlPGFueT4ge1xuICBjb25zdCBvYnNlcnZhYmxlID0gaXNQcm9taXNlKG9iamVjdCkgPyBmcm9tKG9iamVjdCkgOiBvYmplY3Q7XG4gIGlmIChpc09ic2VydmFibGUob2JzZXJ2YWJsZSkpIHsgcmV0dXJuIG9ic2VydmFibGU7IH1cbiAgY29uc29sZS5lcnJvcigndG9PYnNlcnZhYmxlIGVycm9yOiBFeHBlY3RlZCB2YWxpZGF0b3IgdG8gcmV0dXJuIFByb21pc2Ugb3IgT2JzZXJ2YWJsZS4nKTtcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKCk7XG59XG5cbi8qKlxuICogJ2luQXJyYXknIGZ1bmN0aW9uXG4gKlxuICogU2VhcmNoZXMgYW4gYXJyYXkgZm9yIGFuIGl0ZW0sIG9yIG9uZSBvZiBhIGxpc3Qgb2YgaXRlbXMsIGFuZCByZXR1cm5zIHRydWVcbiAqIGFzIHNvb24gYXMgYSBtYXRjaCBpcyBmb3VuZCwgb3IgZmFsc2UgaWYgbm8gbWF0Y2guXG4gKlxuICogSWYgdGhlIG9wdGlvbmFsIHRoaXJkIHBhcmFtZXRlciBhbGxJbiBpcyBzZXQgdG8gVFJVRSwgYW5kIHRoZSBpdGVtIHRvIGZpbmRcbiAqIGlzIGFuIGFycmF5LCB0aGVuIHRoZSBmdW5jdGlvbiByZXR1cm5zIHRydWUgb25seSBpZiBhbGwgZWxlbWVudHMgZnJvbSBpdGVtXG4gKiBhcmUgZm91bmQgaW4gdGhlIGFycmF5IGxpc3QsIGFuZCBmYWxzZSBpZiBhbnkgZWxlbWVudCBpcyBub3QgZm91bmQuIElmIHRoZVxuICogaXRlbSB0byBmaW5kIGlzIG5vdCBhbiBhcnJheSwgc2V0dGluZyBhbGxJbiB0byBUUlVFIGhhcyBubyBlZmZlY3QuXG4gKlxuICogLy8gIHsgYW55fGFueVtdIH0gaXRlbSAtIHRoZSBpdGVtIHRvIHNlYXJjaCBmb3JcbiAqIC8vICAgYXJyYXkgLSB0aGUgYXJyYXkgdG8gc2VhcmNoXG4gKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBhbGxJbiAtIGlmIFRSVUUsIGFsbCBpdGVtcyBtdXN0IGJlIGluIGFycmF5XG4gKiAvLyB7IGJvb2xlYW4gfSAtIHRydWUgaWYgaXRlbShzKSBpbiBhcnJheSwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbkFycmF5KGl0ZW0sIGFycmF5LCBhbGxJbiA9IGZhbHNlKSB7XG4gIGlmICghaXNEZWZpbmVkKGl0ZW0pIHx8ICFpc0FycmF5KGFycmF5KSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgcmV0dXJuIGlzQXJyYXkoaXRlbSkgP1xuICAgIGl0ZW1bYWxsSW4gPyAnZXZlcnknIDogJ3NvbWUnXShzdWJJdGVtID0+IGFycmF5LmluY2x1ZGVzKHN1Ykl0ZW0pKSA6XG4gICAgYXJyYXkuaW5jbHVkZXMoaXRlbSk7XG59XG5cbi8qKlxuICogJ3hvcicgdXRpbGl0eSBmdW5jdGlvbiAtIGV4Y2x1c2l2ZSBvclxuICpcbiAqIFJldHVybnMgdHJ1ZSBpZiBleGFjdGx5IG9uZSBvZiB0d28gdmFsdWVzIGlzIHRydXRoeS5cbiAqXG4gKiAvLyAgIHZhbHVlMSAtIGZpcnN0IHZhbHVlIHRvIGNoZWNrXG4gKiAvLyAgIHZhbHVlMiAtIHNlY29uZCB2YWx1ZSB0byBjaGVja1xuICogLy8geyBib29sZWFuIH0gLSB0cnVlIGlmIGV4YWN0bHkgb25lIGlucHV0IHZhbHVlIGlzIHRydXRoeSwgZmFsc2UgaWYgbm90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB4b3IodmFsdWUxLCB2YWx1ZTIpIHtcbiAgcmV0dXJuICghIXZhbHVlMSAmJiAhdmFsdWUyKSB8fCAoIXZhbHVlMSAmJiAhIXZhbHVlMik7XG59XG4iXX0=