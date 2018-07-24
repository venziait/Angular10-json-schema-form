import * as tslib_1 from "tslib";
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { hasValue, inArray, isArray, isEmpty, isDate, isObject, isDefined, isPrimitive, toJavaScriptType, toSchemaType } from './validator.functions';
import { forEach, hasOwn } from './utility.functions';
import { JsonPointer } from './jsonpointer.functions';
import { JsonValidators } from './json.validators';
import { getControlValidators, removeRecursiveReferences } from './json-schema.functions';
/**
 * FormGroup function library:
 *
 * buildFormGroupTemplate:  Builds a FormGroupTemplate from schema
 *
 * buildFormGroup:          Builds an Angular FormGroup from a FormGroupTemplate
 *
 * mergeValues:
 *
 * setRequiredFields:
 *
 * formatFormData:
 *
 * getControl:
 *
 * ---- TODO: ----
 * TODO: add buildFormGroupTemplateFromLayout function
 * buildFormGroupTemplateFromLayout: Builds a FormGroupTemplate from a form layout
 */
/**
 * 'buildFormGroupTemplate' function
 *
 * Builds a template for an Angular FormGroup from a JSON Schema.
 *
 * TODO: add support for pattern properties
 * https://spacetelescope.github.io/understanding-json-schema/reference/object.html
 *
 * //  {any} jsf -
 * //  {any = null} nodeValue -
 * //  {boolean = true} mapArrays -
 * //  {string = ''} schemaPointer -
 * //  {string = ''} dataPointer -
 * //  {any = ''} templatePointer -
 * // {any} -
 */
export function buildFormGroupTemplate(jsf, nodeValue, setValues, schemaPointer, dataPointer, templatePointer) {
    if (nodeValue === void 0) { nodeValue = null; }
    if (setValues === void 0) { setValues = true; }
    if (schemaPointer === void 0) { schemaPointer = ''; }
    if (dataPointer === void 0) { dataPointer = ''; }
    if (templatePointer === void 0) { templatePointer = ''; }
    var schema = JsonPointer.get(jsf.schema, schemaPointer);
    if (setValues) {
        if (!isDefined(nodeValue) && (jsf.formOptions.setSchemaDefaults === true ||
            (jsf.formOptions.setSchemaDefaults === 'auto' && isEmpty(jsf.formValues)))) {
            nodeValue = JsonPointer.get(jsf.schema, schemaPointer + '/default');
        }
    }
    else {
        nodeValue = null;
    }
    // TODO: If nodeValue still not set, check layout for default value
    var schemaType = JsonPointer.get(schema, '/type');
    var controlType = (hasOwn(schema, 'properties') || hasOwn(schema, 'additionalProperties')) &&
        schemaType === 'object' ? 'FormGroup' :
        (hasOwn(schema, 'items') || hasOwn(schema, 'additionalItems')) &&
            schemaType === 'array' ? 'FormArray' :
            !schemaType && hasOwn(schema, '$ref') ? '$ref' : 'FormControl';
    var shortDataPointer = removeRecursiveReferences(dataPointer, jsf.dataRecursiveRefMap, jsf.arrayMap);
    if (!jsf.dataMap.has(shortDataPointer)) {
        jsf.dataMap.set(shortDataPointer, new Map());
    }
    var nodeOptions = jsf.dataMap.get(shortDataPointer);
    if (!nodeOptions.has('schemaType')) {
        nodeOptions.set('schemaPointer', schemaPointer);
        nodeOptions.set('schemaType', schema.type);
        if (schema.format) {
            nodeOptions.set('schemaFormat', schema.format);
            if (!schema.type) {
                nodeOptions.set('schemaType', 'string');
            }
        }
        if (controlType) {
            nodeOptions.set('templatePointer', templatePointer);
            nodeOptions.set('templateType', controlType);
        }
    }
    var controls;
    var validators = getControlValidators(schema);
    switch (controlType) {
        case 'FormGroup':
            controls = {};
            if (hasOwn(schema, 'ui:order') || hasOwn(schema, 'properties')) {
                var propertyKeys_1 = schema['ui:order'] || Object.keys(schema.properties);
                if (propertyKeys_1.includes('*') && !hasOwn(schema.properties, '*')) {
                    var unnamedKeys = Object.keys(schema.properties)
                        .filter(function (key) { return !propertyKeys_1.includes(key); });
                    for (var i = propertyKeys_1.length - 1; i >= 0; i--) {
                        if (propertyKeys_1[i] === '*') {
                            propertyKeys_1.splice.apply(propertyKeys_1, tslib_1.__spread([i, 1], unnamedKeys));
                        }
                    }
                }
                propertyKeys_1
                    .filter(function (key) { return hasOwn(schema.properties, key) ||
                    hasOwn(schema, 'additionalProperties'); })
                    .forEach(function (key) { return controls[key] = buildFormGroupTemplate(jsf, JsonPointer.get(nodeValue, [key]), setValues, schemaPointer + (hasOwn(schema.properties, key) ?
                    '/properties/' + key : '/additionalProperties'), dataPointer + '/' + key, templatePointer + '/controls/' + key); });
                jsf.formOptions.fieldsRequired = setRequiredFields(schema, controls);
            }
            return { controlType: controlType, controls: controls, validators: validators };
        case 'FormArray':
            controls = [];
            var minItems = Math.max(schema.minItems || 0, nodeOptions.get('minItems') || 0);
            var maxItems = Math.min(schema.maxItems || 1000, nodeOptions.get('maxItems') || 1000);
            var additionalItemsPointer = null;
            if (isArray(schema.items)) {
                var tupleItems = nodeOptions.get('tupleItems') ||
                    (isArray(schema.items) ? Math.min(schema.items.length, maxItems) : 0);
                for (var i = 0; i < tupleItems; i++) {
                    if (i < minItems) {
                        controls.push(buildFormGroupTemplate(jsf, isArray(nodeValue) ? nodeValue[i] : nodeValue, setValues, schemaPointer + '/items/' + i, dataPointer + '/' + i, templatePointer + '/controls/' + i));
                    }
                    else {
                        var schemaRefPointer = removeRecursiveReferences(schemaPointer + '/items/' + i, jsf.schemaRecursiveRefMap);
                        var itemRefPointer = removeRecursiveReferences(shortDataPointer + '/' + i, jsf.dataRecursiveRefMap, jsf.arrayMap);
                        var itemRecursive = itemRefPointer !== shortDataPointer + '/' + i;
                        if (!hasOwn(jsf.templateRefLibrary, itemRefPointer)) {
                            jsf.templateRefLibrary[itemRefPointer] = null;
                            jsf.templateRefLibrary[itemRefPointer] = buildFormGroupTemplate(jsf, null, setValues, schemaRefPointer, itemRefPointer, templatePointer + '/controls/' + i);
                        }
                        controls.push(isArray(nodeValue) ?
                            buildFormGroupTemplate(jsf, nodeValue[i], setValues, schemaPointer + '/items/' + i, dataPointer + '/' + i, templatePointer + '/controls/' + i) :
                            itemRecursive ?
                                null : _.cloneDeep(jsf.templateRefLibrary[itemRefPointer]));
                    }
                }
                // If 'additionalItems' is an object = additional list items (after tuple items)
                if (schema.items.length < maxItems && isObject(schema.additionalItems)) {
                    additionalItemsPointer = schemaPointer + '/additionalItems';
                }
                // If 'items' is an object = list items only (no tuple items)
            }
            else {
                additionalItemsPointer = schemaPointer + '/items';
            }
            if (additionalItemsPointer) {
                var schemaRefPointer = removeRecursiveReferences(additionalItemsPointer, jsf.schemaRecursiveRefMap);
                var itemRefPointer = removeRecursiveReferences(shortDataPointer + '/-', jsf.dataRecursiveRefMap, jsf.arrayMap);
                var itemRecursive = itemRefPointer !== shortDataPointer + '/-';
                if (!hasOwn(jsf.templateRefLibrary, itemRefPointer)) {
                    jsf.templateRefLibrary[itemRefPointer] = null;
                    jsf.templateRefLibrary[itemRefPointer] = buildFormGroupTemplate(jsf, null, setValues, schemaRefPointer, itemRefPointer, templatePointer + '/controls/-');
                }
                // const itemOptions = jsf.dataMap.get(itemRefPointer) || new Map();
                var itemOptions = nodeOptions;
                if (!itemRecursive || hasOwn(validators, 'required')) {
                    var arrayLength = Math.min(Math.max(itemRecursive ? 0 :
                        (itemOptions.get('tupleItems') + itemOptions.get('listItems')) || 0, isArray(nodeValue) ? nodeValue.length : 0), maxItems);
                    for (var i = controls.length; i < arrayLength; i++) {
                        controls.push(isArray(nodeValue) ?
                            buildFormGroupTemplate(jsf, nodeValue[i], setValues, schemaRefPointer, dataPointer + '/-', templatePointer + '/controls/-') :
                            itemRecursive ?
                                null : _.cloneDeep(jsf.templateRefLibrary[itemRefPointer]));
                    }
                }
            }
            return { controlType: controlType, controls: controls, validators: validators };
        case '$ref':
            var schemaRef = JsonPointer.compile(schema.$ref);
            var dataRef = JsonPointer.toDataPointer(schemaRef, schema);
            var refPointer = removeRecursiveReferences(dataRef, jsf.dataRecursiveRefMap, jsf.arrayMap);
            if (refPointer && !hasOwn(jsf.templateRefLibrary, refPointer)) {
                // Set to null first to prevent recursive reference from causing endless loop
                jsf.templateRefLibrary[refPointer] = null;
                var newTemplate = buildFormGroupTemplate(jsf, setValues, setValues, schemaRef);
                if (newTemplate) {
                    jsf.templateRefLibrary[refPointer] = newTemplate;
                }
                else {
                    delete jsf.templateRefLibrary[refPointer];
                }
            }
            return null;
        case 'FormControl':
            var value = {
                value: setValues && isPrimitive(nodeValue) ? nodeValue : null,
                disabled: nodeOptions.get('disabled') || false
            };
            return { controlType: controlType, value: value, validators: validators };
        default:
            return null;
    }
}
/**
 * 'buildFormGroup' function
 *
 * // {any} template -
 * // {AbstractControl}
*/
export function buildFormGroup(template) {
    var validatorFns = [];
    var validatorFn = null;
    if (hasOwn(template, 'validators')) {
        forEach(template.validators, function (parameters, validator) {
            if (typeof JsonValidators[validator] === 'function') {
                validatorFns.push(JsonValidators[validator].apply(null, parameters));
            }
        });
        if (validatorFns.length &&
            inArray(template.controlType, ['FormGroup', 'FormArray'])) {
            validatorFn = validatorFns.length > 1 ?
                JsonValidators.compose(validatorFns) : validatorFns[0];
        }
    }
    if (hasOwn(template, 'controlType')) {
        switch (template.controlType) {
            case 'FormGroup':
                var groupControls_1 = {};
                forEach(template.controls, function (controls, key) {
                    var newControl = buildFormGroup(controls);
                    if (newControl) {
                        groupControls_1[key] = newControl;
                    }
                });
                return new FormGroup(groupControls_1, validatorFn);
            case 'FormArray':
                return new FormArray(_.filter(_.map(template.controls, function (controls) { return buildFormGroup(controls); })), validatorFn);
            case 'FormControl':
                return new FormControl(template.value, validatorFns);
        }
    }
    return null;
}
/**
 * 'mergeValues' function
 *
 * //  {any[]} ...valuesToMerge - Multiple values to merge
 * // {any} - Merged values
 */
export function mergeValues() {
    var valuesToMerge = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        valuesToMerge[_i] = arguments[_i];
    }
    var mergedValues = null;
    try {
        for (var valuesToMerge_1 = tslib_1.__values(valuesToMerge), valuesToMerge_1_1 = valuesToMerge_1.next(); !valuesToMerge_1_1.done; valuesToMerge_1_1 = valuesToMerge_1.next()) {
            var currentValue = valuesToMerge_1_1.value;
            if (!isEmpty(currentValue)) {
                if (typeof currentValue === 'object' &&
                    (isEmpty(mergedValues) || typeof mergedValues !== 'object')) {
                    if (isArray(currentValue)) {
                        mergedValues = tslib_1.__spread(currentValue);
                    }
                    else if (isObject(currentValue)) {
                        mergedValues = tslib_1.__assign({}, currentValue);
                    }
                }
                else if (typeof currentValue !== 'object') {
                    mergedValues = currentValue;
                }
                else if (isObject(mergedValues) && isObject(currentValue)) {
                    Object.assign(mergedValues, currentValue);
                }
                else if (isObject(mergedValues) && isArray(currentValue)) {
                    var newValues = [];
                    try {
                        for (var currentValue_1 = tslib_1.__values(currentValue), currentValue_1_1 = currentValue_1.next(); !currentValue_1_1.done; currentValue_1_1 = currentValue_1.next()) {
                            var value = currentValue_1_1.value;
                            newValues.push(mergeValues(mergedValues, value));
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (currentValue_1_1 && !currentValue_1_1.done && (_a = currentValue_1.return)) _a.call(currentValue_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    mergedValues = newValues;
                }
                else if (isArray(mergedValues) && isObject(currentValue)) {
                    var newValues = [];
                    try {
                        for (var mergedValues_1 = tslib_1.__values(mergedValues), mergedValues_1_1 = mergedValues_1.next(); !mergedValues_1_1.done; mergedValues_1_1 = mergedValues_1.next()) {
                            var value = mergedValues_1_1.value;
                            newValues.push(mergeValues(value, currentValue));
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (mergedValues_1_1 && !mergedValues_1_1.done && (_b = mergedValues_1.return)) _b.call(mergedValues_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    mergedValues = newValues;
                }
                else if (isArray(mergedValues) && isArray(currentValue)) {
                    var newValues = [];
                    for (var i = 0; i < Math.max(mergedValues.length, currentValue.length); i++) {
                        if (i < mergedValues.length && i < currentValue.length) {
                            newValues.push(mergeValues(mergedValues[i], currentValue[i]));
                        }
                        else if (i < mergedValues.length) {
                            newValues.push(mergedValues[i]);
                        }
                        else if (i < currentValue.length) {
                            newValues.push(currentValue[i]);
                        }
                    }
                    mergedValues = newValues;
                }
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (valuesToMerge_1_1 && !valuesToMerge_1_1.done && (_c = valuesToMerge_1.return)) _c.call(valuesToMerge_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return mergedValues;
    var e_3, _c, e_1, _a, e_2, _b;
}
/**
 * 'setRequiredFields' function
 *
 * // {schema} schema - JSON Schema
 * // {object} formControlTemplate - Form Control Template object
 * // {boolean} - true if any fields have been set to required, false if not
 */
export function setRequiredFields(schema, formControlTemplate) {
    var fieldsRequired = false;
    if (hasOwn(schema, 'required') && !isEmpty(schema.required)) {
        fieldsRequired = true;
        var requiredArray = isArray(schema.required) ? schema.required : [schema.required];
        requiredArray = forEach(requiredArray, function (key) { return JsonPointer.set(formControlTemplate, '/' + key + '/validators/required', []); });
    }
    return fieldsRequired;
    // TODO: Add support for patternProperties
    // https://spacetelescope.github.io/understanding-json-schema/reference/object.html#pattern-properties
}
/**
 * 'formatFormData' function
 *
 * // {any} formData - Angular FormGroup data object
 * // {Map<string, any>} dataMap -
 * // {Map<string, string>} recursiveRefMap -
 * // {Map<string, number>} arrayMap -
 * // {boolean = false} fixErrors - if TRUE, tries to fix data
 * // {any} - formatted data object
 */
export function formatFormData(formData, dataMap, recursiveRefMap, arrayMap, returnEmptyFields, fixErrors) {
    if (returnEmptyFields === void 0) { returnEmptyFields = false; }
    if (fixErrors === void 0) { fixErrors = false; }
    if (formData === null || typeof formData !== 'object') {
        return formData;
    }
    var formattedData = isArray(formData) ? [] : {};
    JsonPointer.forEachDeep(formData, function (value, dataPointer) {
        // If returnEmptyFields === true,
        // add empty arrays and objects to all allowed keys
        if (returnEmptyFields && isArray(value)) {
            JsonPointer.set(formattedData, dataPointer, []);
        }
        else if (returnEmptyFields && isObject(value) && !isDate(value)) {
            JsonPointer.set(formattedData, dataPointer, {});
        }
        else {
            var genericPointer_1 = JsonPointer.has(dataMap, [dataPointer, 'schemaType']) ? dataPointer :
                removeRecursiveReferences(dataPointer, recursiveRefMap, arrayMap);
            if (JsonPointer.has(dataMap, [genericPointer_1, 'schemaType'])) {
                var schemaType = dataMap.get(genericPointer_1).get('schemaType');
                if (schemaType === 'null') {
                    JsonPointer.set(formattedData, dataPointer, null);
                }
                else if ((hasValue(value) || returnEmptyFields) &&
                    inArray(schemaType, ['string', 'integer', 'number', 'boolean'])) {
                    var newValue = (fixErrors || (value === null && returnEmptyFields)) ?
                        toSchemaType(value, schemaType) : toJavaScriptType(value, schemaType);
                    if (isDefined(newValue) || returnEmptyFields) {
                        JsonPointer.set(formattedData, dataPointer, newValue);
                    }
                    // If returnEmptyFields === false,
                    // only add empty arrays and objects to required keys
                }
                else if (schemaType === 'object' && !returnEmptyFields) {
                    (dataMap.get(genericPointer_1).get('required') || []).forEach(function (key) {
                        var keySchemaType = dataMap.get(genericPointer_1 + "/" + key).get('schemaType');
                        if (keySchemaType === 'array') {
                            JsonPointer.set(formattedData, dataPointer + "/" + key, []);
                        }
                        else if (keySchemaType === 'object') {
                            JsonPointer.set(formattedData, dataPointer + "/" + key, {});
                        }
                    });
                }
                // Finish incomplete 'date-time' entries
                if (dataMap.get(genericPointer_1).get('schemaFormat') === 'date-time') {
                    // "2000-03-14T01:59:26.535" -> "2000-03-14T01:59:26.535Z" (add "Z")
                    if (/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?$/i.test(value)) {
                        JsonPointer.set(formattedData, dataPointer, value + "Z");
                        // "2000-03-14T01:59" -> "2000-03-14T01:59:00Z" (add ":00Z")
                    }
                    else if (/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d$/i.test(value)) {
                        JsonPointer.set(formattedData, dataPointer, value + ":00Z");
                        // "2000-03-14" -> "2000-03-14T00:00:00Z" (add "T00:00:00Z")
                    }
                    else if (fixErrors && /^\d\d\d\d-[0-1]\d-[0-3]\d$/i.test(value)) {
                        JsonPointer.set(formattedData, dataPointer, value + ":00:00:00Z");
                    }
                }
            }
            else if (typeof value !== 'object' || isDate(value) ||
                (value === null && returnEmptyFields)) {
                console.error('formatFormData error: ' +
                    ("Schema type not found for form value at " + genericPointer_1));
                console.error('dataMap', dataMap);
                console.error('recursiveRefMap', recursiveRefMap);
                console.error('genericPointer', genericPointer_1);
            }
        }
    });
    return formattedData;
}
/**
 * 'getControl' function
 *
 * Uses a JSON Pointer for a data object to retrieve a control from
 * an Angular formGroup or formGroup template. (Note: though a formGroup
 * template is much simpler, its basic structure is idential to a formGroup).
 *
 * If the optional third parameter 'returnGroup' is set to TRUE, the group
 * containing the control is returned, rather than the control itself.
 *
 * // {FormGroup} formGroup - Angular FormGroup to get value from
 * // {Pointer} dataPointer - JSON Pointer (string or array)
 * // {boolean = false} returnGroup - If true, return group containing control
 * // {group} - Located value (or null, if no control found)
 */
export function getControl(formGroup, dataPointer, returnGroup) {
    if (returnGroup === void 0) { returnGroup = false; }
    if (!isObject(formGroup) || !JsonPointer.isJsonPointer(dataPointer)) {
        if (!JsonPointer.isJsonPointer(dataPointer)) {
            // If dataPointer input is not a valid JSON pointer, check to
            // see if it is instead a valid object path, using dot notaion
            if (typeof dataPointer === 'string') {
                var formControl = formGroup.get(dataPointer);
                if (formControl) {
                    return formControl;
                }
            }
            console.error("getControl error: Invalid JSON Pointer: " + dataPointer);
        }
        if (!isObject(formGroup)) {
            console.error("getControl error: Invalid formGroup: " + formGroup);
        }
        return null;
    }
    var dataPointerArray = JsonPointer.parse(dataPointer);
    if (returnGroup) {
        dataPointerArray = dataPointerArray.slice(0, -1);
    }
    // If formGroup input is a real formGroup (not a formGroup template)
    // try using formGroup.get() to return the control
    if (typeof formGroup.get === 'function' &&
        dataPointerArray.every(function (key) { return key.indexOf('.') === -1; })) {
        var formControl = formGroup.get(dataPointerArray.join('.'));
        if (formControl) {
            return formControl;
        }
    }
    // If formGroup input is a formGroup template,
    // or formGroup.get() failed to return the control,
    // search the formGroup object for dataPointer's control
    var subGroup = formGroup;
    try {
        for (var dataPointerArray_1 = tslib_1.__values(dataPointerArray), dataPointerArray_1_1 = dataPointerArray_1.next(); !dataPointerArray_1_1.done; dataPointerArray_1_1 = dataPointerArray_1.next()) {
            var key = dataPointerArray_1_1.value;
            if (hasOwn(subGroup, 'controls')) {
                subGroup = subGroup.controls;
            }
            if (isArray(subGroup) && (key === '-')) {
                subGroup = subGroup[subGroup.length - 1];
            }
            else if (hasOwn(subGroup, key)) {
                subGroup = subGroup[key];
            }
            else {
                console.error("getControl error: Unable to find \"" + key + "\" item in FormGroup.");
                console.error(dataPointer);
                console.error(formGroup);
                return;
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (dataPointerArray_1_1 && !dataPointerArray_1_1.done && (_a = dataPointerArray_1.return)) _a.call(dataPointerArray_1);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return subGroup;
    var e_4, _a;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1ncm91cC5mdW5jdGlvbnMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL3NoYXJlZC9mb3JtLWdyb3VwLmZ1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUNZLFNBQVMsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUNuRCxNQUFNLGdCQUFnQixDQUFDO0FBRXhCLE9BQU8sS0FBSyxDQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTVCLE9BQU8sRUFDTCxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUM3RSxnQkFBZ0IsRUFBRSxZQUFZLEVBQy9CLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN0RCxPQUFPLEVBQVcsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFDUyxvQkFBb0IsRUFBZ0IseUJBQXlCLEVBQzVFLE1BQU0seUJBQXlCLENBQUM7QUFFakM7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUVIOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNILE1BQU0saUNBQ0osR0FBUSxFQUFFLFNBQXFCLEVBQUUsU0FBZ0IsRUFDakQsYUFBa0IsRUFBRSxXQUFnQixFQUFFLGVBQW9CO0lBRGhELDBCQUFBLEVBQUEsZ0JBQXFCO0lBQUUsMEJBQUEsRUFBQSxnQkFBZ0I7SUFDakQsOEJBQUEsRUFBQSxrQkFBa0I7SUFBRSw0QkFBQSxFQUFBLGdCQUFnQjtJQUFFLGdDQUFBLEVBQUEsb0JBQW9CO0lBRTFELElBQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1B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RCw4Q0FBOEM7SUFDOUMsbURBQW1EO0lBQ25ELHdEQUF3RDtJQUN4RCxJQUFJLFFBQVEsR0FBRyxTQUFTLENBQUM7O1FBQ3pCLEdBQUcsQ0FBQyxDQUFjLElBQUEscUJBQUEsaUJBQUEsZ0JBQWdCLENBQUEsa0RBQUE7WUFBN0IsSUFBTSxHQUFHLDZCQUFBO1lBQ1osRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFBQyxDQUFDO1lBQ25FLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzQyxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLHdDQUFxQyxHQUFHLDBCQUFzQixDQUFDLENBQUM7Z0JBQzlFLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3pCLE1BQU0sQ0FBQztZQUNULENBQUM7U0FDRjs7Ozs7Ozs7O0lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQzs7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFic3RyYWN0Q29udHJvbCwgRm9ybUFycmF5LCBGb3JtQ29udHJvbCwgRm9ybUdyb3VwLCBWYWxpZGF0b3JGblxufSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcblxuaW1wb3J0IHtcbiAgaGFzVmFsdWUsIGluQXJyYXksIGlzQXJyYXksIGlzRW1wdHksIGlzRGF0ZSwgaXNPYmplY3QsIGlzRGVmaW5lZCwgaXNQcmltaXRpdmUsXG4gIHRvSmF2YVNjcmlwdFR5cGUsIHRvU2NoZW1hVHlwZSwgU2NoZW1hUHJpbWl0aXZlVHlwZVxufSBmcm9tICcuL3ZhbGlkYXRvci5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgZm9yRWFjaCwgaGFzT3duIH0gZnJvbSAnLi91dGlsaXR5LmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBQb2ludGVyLCBKc29uUG9pbnRlciB9IGZyb20gJy4vanNvbnBvaW50ZXIuZnVuY3Rpb25zJztcbmltcG9ydCB7IEpzb25WYWxpZGF0b3JzIH0gZnJvbSAnLi9qc29uLnZhbGlkYXRvcnMnO1xuaW1wb3J0IHtcbiAgY29tYmluZUFsbE9mLCBnZXRDb250cm9sVmFsaWRhdG9ycywgZ2V0U3ViU2NoZW1hLCByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzXG59IGZyb20gJy4vanNvbi1zY2hlbWEuZnVuY3Rpb25zJztcblxuLyoqXG4gKiBGb3JtR3JvdXAgZnVuY3Rpb24gbGlicmFyeTpcbiAqXG4gKiBidWlsZEZvcm1Hcm91cFRlbXBsYXRlOiAgQnVpbGRzIGEgRm9ybUdyb3VwVGVtcGxhdGUgZnJvbSBzY2hlbWFcbiAqXG4gKiBidWlsZEZvcm1Hcm91cDogICAgICAgICAgQnVpbGRzIGFuIEFuZ3VsYXIgRm9ybUdyb3VwIGZyb20gYSBGb3JtR3JvdXBUZW1wbGF0ZVxuICpcbiAqIG1lcmdlVmFsdWVzOlxuICpcbiAqIHNldFJlcXVpcmVkRmllbGRzOlxuICpcbiAqIGZvcm1hdEZvcm1EYXRhOlxuICpcbiAqIGdldENvbnRyb2w6XG4gKlxuICogLS0tLSBUT0RPOiAtLS0tXG4gKiBUT0RPOiBhZGQgYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZUZyb21MYXlvdXQgZnVuY3Rpb25cbiAqIGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGVGcm9tTGF5b3V0OiBCdWlsZHMgYSBGb3JtR3JvdXBUZW1wbGF0ZSBmcm9tIGEgZm9ybSBsYXlvdXRcbiAqL1xuXG4vKipcbiAqICdidWlsZEZvcm1Hcm91cFRlbXBsYXRlJyBmdW5jdGlvblxuICpcbiAqIEJ1aWxkcyBhIHRlbXBsYXRlIGZvciBhbiBBbmd1bGFyIEZvcm1Hcm91cCBmcm9tIGEgSlNPTiBTY2hlbWEuXG4gKlxuICogVE9ETzogYWRkIHN1cHBvcnQgZm9yIHBhdHRlcm4gcHJvcGVydGllc1xuICogaHR0cHM6Ly9zcGFjZXRlbGVzY29wZS5naXRodWIuaW8vdW5kZXJzdGFuZGluZy1qc29uLXNjaGVtYS9yZWZlcmVuY2Uvb2JqZWN0Lmh0bWxcbiAqXG4gKiAvLyAge2FueX0ganNmIC1cbiAqIC8vICB7YW55ID0gbnVsbH0gbm9kZVZhbHVlIC1cbiAqIC8vICB7Ym9vbGVhbiA9IHRydWV9IG1hcEFycmF5cyAtXG4gKiAvLyAge3N0cmluZyA9ICcnfSBzY2hlbWFQb2ludGVyIC1cbiAqIC8vICB7c3RyaW5nID0gJyd9IGRhdGFQb2ludGVyIC1cbiAqIC8vICB7YW55ID0gJyd9IHRlbXBsYXRlUG9pbnRlciAtXG4gKiAvLyB7YW55fSAtXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEZvcm1Hcm91cFRlbXBsYXRlKFxuICBqc2Y6IGFueSwgbm9kZVZhbHVlOiBhbnkgPSBudWxsLCBzZXRWYWx1ZXMgPSB0cnVlLFxuICBzY2hlbWFQb2ludGVyID0gJycsIGRhdGFQb2ludGVyID0gJycsIHRlbXBsYXRlUG9pbnRlciA9ICcnXG4pIHtcbiAgY29uc3Qgc2NoZW1hID0gSnNvblBvaW50ZXIuZ2V0KGpzZi5zY2hlbWEsIHNjaGVtYVBvaW50ZXIpO1xuICBpZiAoc2V0VmFsdWVzKSB7XG4gICAgaWYgKCFpc0RlZmluZWQobm9kZVZhbHVlKSAmJiAoXG4gICAgICBqc2YuZm9ybU9wdGlvbnMuc2V0U2NoZW1hRGVmYXVsdHMgPT09IHRydWUgfHxcbiAgICAgIChqc2YuZm9ybU9wdGlvbnMuc2V0U2NoZW1hRGVmYXVsdHMgPT09ICdhdXRvJyAmJiBpc0VtcHR5KGpzZi5mb3JtVmFsdWVzKSlcbiAgICApKSB7XG4gICAgICBub2RlVmFsdWUgPSBKc29uUG9pbnRlci5nZXQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlciArICcvZGVmYXVsdCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBub2RlVmFsdWUgPSBudWxsO1xuICB9XG4gIC8vIFRPRE86IElmIG5vZGVWYWx1ZSBzdGlsbCBub3Qgc2V0LCBjaGVjayBsYXlvdXQgZm9yIGRlZmF1bHQgdmFsdWVcbiAgY29uc3Qgc2NoZW1hVHlwZTogc3RyaW5nIHwgc3RyaW5nW10gPSBKc29uUG9pbnRlci5nZXQoc2NoZW1hLCAnL3R5cGUnKTtcbiAgY29uc3QgY29udHJvbFR5cGUgPVxuICAgIChoYXNPd24oc2NoZW1hLCAncHJvcGVydGllcycpIHx8IGhhc093bihzY2hlbWEsICdhZGRpdGlvbmFsUHJvcGVydGllcycpKSAmJlxuICAgICAgc2NoZW1hVHlwZSA9PT0gJ29iamVjdCcgPyAnRm9ybUdyb3VwJyA6XG4gICAgKGhhc093bihzY2hlbWEsICdpdGVtcycpIHx8IGhhc093bihzY2hlbWEsICdhZGRpdGlvbmFsSXRlbXMnKSkgJiZcbiAgICAgIHNjaGVtYVR5cGUgPT09ICdhcnJheScgPyAnRm9ybUFycmF5JyA6XG4gICAgIXNjaGVtYVR5cGUgJiYgaGFzT3duKHNjaGVtYSwgJyRyZWYnKSA/ICckcmVmJyA6ICdGb3JtQ29udHJvbCc7XG4gIGNvbnN0IHNob3J0RGF0YVBvaW50ZXIgPVxuICAgIHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoZGF0YVBvaW50ZXIsIGpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwLCBqc2YuYXJyYXlNYXApO1xuICBpZiAoIWpzZi5kYXRhTWFwLmhhcyhzaG9ydERhdGFQb2ludGVyKSkge1xuICAgIGpzZi5kYXRhTWFwLnNldChzaG9ydERhdGFQb2ludGVyLCBuZXcgTWFwKCkpO1xuICB9XG4gIGNvbnN0IG5vZGVPcHRpb25zID0ganNmLmRhdGFNYXAuZ2V0KHNob3J0RGF0YVBvaW50ZXIpO1xuICBpZiAoIW5vZGVPcHRpb25zLmhhcygnc2NoZW1hVHlwZScpKSB7XG4gICAgbm9kZU9wdGlvbnMuc2V0KCdzY2hlbWFQb2ludGVyJywgc2NoZW1hUG9pbnRlcik7XG4gICAgbm9kZU9wdGlvbnMuc2V0KCdzY2hlbWFUeXBlJywgc2NoZW1hLnR5cGUpO1xuICAgIGlmIChzY2hlbWEuZm9ybWF0KSB7XG4gICAgICBub2RlT3B0aW9ucy5zZXQoJ3NjaGVtYUZvcm1hdCcsIHNjaGVtYS5mb3JtYXQpO1xuICAgICAgaWYgKCFzY2hlbWEudHlwZSkgeyBub2RlT3B0aW9ucy5zZXQoJ3NjaGVtYVR5cGUnLCAnc3RyaW5nJyk7IH1cbiAgICB9XG4gICAgaWYgKGNvbnRyb2xUeXBlKSB7XG4gICAgICBub2RlT3B0aW9ucy5zZXQoJ3RlbXBsYXRlUG9pbnRlcicsIHRlbXBsYXRlUG9pbnRlcik7XG4gICAgICBub2RlT3B0aW9ucy5zZXQoJ3RlbXBsYXRlVHlwZScsIGNvbnRyb2xUeXBlKTtcbiAgICB9XG4gIH1cbiAgbGV0IGNvbnRyb2xzOiBhbnk7XG4gIGNvbnN0IHZhbGlkYXRvcnMgPSBnZXRDb250cm9sVmFsaWRhdG9ycyhzY2hlbWEpO1xuICBzd2l0Y2ggKGNvbnRyb2xUeXBlKSB7XG5cbiAgICBjYXNlICdGb3JtR3JvdXAnOlxuICAgICAgY29udHJvbHMgPSB7fTtcbiAgICAgIGlmIChoYXNPd24oc2NoZW1hLCAndWk6b3JkZXInKSB8fCBoYXNPd24oc2NoZW1hLCAncHJvcGVydGllcycpKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5S2V5cyA9IHNjaGVtYVsndWk6b3JkZXInXSB8fCBPYmplY3Qua2V5cyhzY2hlbWEucHJvcGVydGllcyk7XG4gICAgICAgIGlmIChwcm9wZXJ0eUtleXMuaW5jbHVkZXMoJyonKSAmJiAhaGFzT3duKHNjaGVtYS5wcm9wZXJ0aWVzLCAnKicpKSB7XG4gICAgICAgICAgY29uc3QgdW5uYW1lZEtleXMgPSBPYmplY3Qua2V5cyhzY2hlbWEucHJvcGVydGllcylcbiAgICAgICAgICAgIC5maWx0ZXIoa2V5ID0+ICFwcm9wZXJ0eUtleXMuaW5jbHVkZXMoa2V5KSk7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IHByb3BlcnR5S2V5cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgaWYgKHByb3BlcnR5S2V5c1tpXSA9PT0gJyonKSB7XG4gICAgICAgICAgICAgIHByb3BlcnR5S2V5cy5zcGxpY2UoaSwgMSwgLi4udW5uYW1lZEtleXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcm9wZXJ0eUtleXNcbiAgICAgICAgICAuZmlsdGVyKGtleSA9PiBoYXNPd24oc2NoZW1hLnByb3BlcnRpZXMsIGtleSkgfHxcbiAgICAgICAgICAgIGhhc093bihzY2hlbWEsICdhZGRpdGlvbmFsUHJvcGVydGllcycpXG4gICAgICAgICAgKVxuICAgICAgICAgIC5mb3JFYWNoKGtleSA9PiBjb250cm9sc1trZXldID0gYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZShcbiAgICAgICAgICAgIGpzZiwgSnNvblBvaW50ZXIuZ2V0KG5vZGVWYWx1ZSwgWzxzdHJpbmc+a2V5XSksIHNldFZhbHVlcyxcbiAgICAgICAgICAgIHNjaGVtYVBvaW50ZXIgKyAoaGFzT3duKHNjaGVtYS5wcm9wZXJ0aWVzLCBrZXkpID9cbiAgICAgICAgICAgICAgJy9wcm9wZXJ0aWVzLycgKyBrZXkgOiAnL2FkZGl0aW9uYWxQcm9wZXJ0aWVzJ1xuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGRhdGFQb2ludGVyICsgJy8nICsga2V5LFxuICAgICAgICAgICAgdGVtcGxhdGVQb2ludGVyICsgJy9jb250cm9scy8nICsga2V5XG4gICAgICAgICAgKSk7XG4gICAgICAgIGpzZi5mb3JtT3B0aW9ucy5maWVsZHNSZXF1aXJlZCA9IHNldFJlcXVpcmVkRmllbGRzKHNjaGVtYSwgY29udHJvbHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgY29udHJvbFR5cGUsIGNvbnRyb2xzLCB2YWxpZGF0b3JzIH07XG5cbiAgICBjYXNlICdGb3JtQXJyYXknOlxuICAgICAgY29udHJvbHMgPSBbXTtcbiAgICAgIGNvbnN0IG1pbkl0ZW1zID1cbiAgICAgICAgTWF0aC5tYXgoc2NoZW1hLm1pbkl0ZW1zIHx8IDAsIG5vZGVPcHRpb25zLmdldCgnbWluSXRlbXMnKSB8fCAwKTtcbiAgICAgIGNvbnN0IG1heEl0ZW1zID1cbiAgICAgICAgTWF0aC5taW4oc2NoZW1hLm1heEl0ZW1zIHx8IDEwMDAsIG5vZGVPcHRpb25zLmdldCgnbWF4SXRlbXMnKSB8fCAxMDAwKTtcbiAgICAgIGxldCBhZGRpdGlvbmFsSXRlbXNQb2ludGVyOiBzdHJpbmcgPSBudWxsO1xuICAgICAgaWYgKGlzQXJyYXkoc2NoZW1hLml0ZW1zKSkgeyAvLyAnaXRlbXMnIGlzIGFuIGFycmF5ID0gdHVwbGUgaXRlbXNcbiAgICAgICAgY29uc3QgdHVwbGVJdGVtcyA9IG5vZGVPcHRpb25zLmdldCgndHVwbGVJdGVtcycpIHx8XG4gICAgICAgICAgKGlzQXJyYXkoc2NoZW1hLml0ZW1zKSA/IE1hdGgubWluKHNjaGVtYS5pdGVtcy5sZW5ndGgsIG1heEl0ZW1zKSA6IDApO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHR1cGxlSXRlbXM7IGkrKykge1xuICAgICAgICAgIGlmIChpIDwgbWluSXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnRyb2xzLnB1c2goYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZShcbiAgICAgICAgICAgICAganNmLCBpc0FycmF5KG5vZGVWYWx1ZSkgPyBub2RlVmFsdWVbaV0gOiBub2RlVmFsdWUsIHNldFZhbHVlcyxcbiAgICAgICAgICAgICAgc2NoZW1hUG9pbnRlciArICcvaXRlbXMvJyArIGksXG4gICAgICAgICAgICAgIGRhdGFQb2ludGVyICsgJy8nICsgaSxcbiAgICAgICAgICAgICAgdGVtcGxhdGVQb2ludGVyICsgJy9jb250cm9scy8nICsgaVxuICAgICAgICAgICAgKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHNjaGVtYVJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICAgICAgICBzY2hlbWFQb2ludGVyICsgJy9pdGVtcy8nICsgaSwganNmLnNjaGVtYVJlY3Vyc2l2ZVJlZk1hcFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1SZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgICAgICAgc2hvcnREYXRhUG9pbnRlciArICcvJyArIGksIGpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwLCBqc2YuYXJyYXlNYXBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBpdGVtUmVjdXJzaXZlID0gaXRlbVJlZlBvaW50ZXIgIT09IHNob3J0RGF0YVBvaW50ZXIgKyAnLycgKyBpO1xuICAgICAgICAgICAgaWYgKCFoYXNPd24oanNmLnRlbXBsYXRlUmVmTGlicmFyeSwgaXRlbVJlZlBvaW50ZXIpKSB7XG4gICAgICAgICAgICAgIGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdID0gbnVsbDtcbiAgICAgICAgICAgICAganNmLnRlbXBsYXRlUmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0gPSBidWlsZEZvcm1Hcm91cFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgIGpzZiwgbnVsbCwgc2V0VmFsdWVzLFxuICAgICAgICAgICAgICAgIHNjaGVtYVJlZlBvaW50ZXIsXG4gICAgICAgICAgICAgICAgaXRlbVJlZlBvaW50ZXIsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVQb2ludGVyICsgJy9jb250cm9scy8nICsgaVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udHJvbHMucHVzaChcbiAgICAgICAgICAgICAgaXNBcnJheShub2RlVmFsdWUpID9cbiAgICAgICAgICAgICAgICBidWlsZEZvcm1Hcm91cFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAganNmLCBub2RlVmFsdWVbaV0sIHNldFZhbHVlcyxcbiAgICAgICAgICAgICAgICAgIHNjaGVtYVBvaW50ZXIgKyAnL2l0ZW1zLycgKyBpLFxuICAgICAgICAgICAgICAgICAgZGF0YVBvaW50ZXIgKyAnLycgKyBpLFxuICAgICAgICAgICAgICAgICAgdGVtcGxhdGVQb2ludGVyICsgJy9jb250cm9scy8nICsgaVxuICAgICAgICAgICAgICAgICkgOlxuICAgICAgICAgICAgICBpdGVtUmVjdXJzaXZlID9cbiAgICAgICAgICAgICAgICBudWxsIDogXy5jbG9uZURlZXAoanNmLnRlbXBsYXRlUmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0pXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmICdhZGRpdGlvbmFsSXRlbXMnIGlzIGFuIG9iamVjdCA9IGFkZGl0aW9uYWwgbGlzdCBpdGVtcyAoYWZ0ZXIgdHVwbGUgaXRlbXMpXG4gICAgICAgIGlmIChzY2hlbWEuaXRlbXMubGVuZ3RoIDwgbWF4SXRlbXMgJiYgaXNPYmplY3Qoc2NoZW1hLmFkZGl0aW9uYWxJdGVtcykpIHtcbiAgICAgICAgICBhZGRpdGlvbmFsSXRlbXNQb2ludGVyID0gc2NoZW1hUG9pbnRlciArICcvYWRkaXRpb25hbEl0ZW1zJztcbiAgICAgICAgfVxuXG4gICAgICAvLyBJZiAnaXRlbXMnIGlzIGFuIG9iamVjdCA9IGxpc3QgaXRlbXMgb25seSAobm8gdHVwbGUgaXRlbXMpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhZGRpdGlvbmFsSXRlbXNQb2ludGVyID0gc2NoZW1hUG9pbnRlciArICcvaXRlbXMnO1xuICAgICAgfVxuXG4gICAgICBpZiAoYWRkaXRpb25hbEl0ZW1zUG9pbnRlcikge1xuICAgICAgICBjb25zdCBzY2hlbWFSZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgICBhZGRpdGlvbmFsSXRlbXNQb2ludGVyLCBqc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGl0ZW1SZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgICBzaG9ydERhdGFQb2ludGVyICsgJy8tJywganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBpdGVtUmVjdXJzaXZlID0gaXRlbVJlZlBvaW50ZXIgIT09IHNob3J0RGF0YVBvaW50ZXIgKyAnLy0nO1xuICAgICAgICBpZiAoIWhhc093bihqc2YudGVtcGxhdGVSZWZMaWJyYXJ5LCBpdGVtUmVmUG9pbnRlcikpIHtcbiAgICAgICAgICBqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSA9IG51bGw7XG4gICAgICAgICAganNmLnRlbXBsYXRlUmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0gPSBidWlsZEZvcm1Hcm91cFRlbXBsYXRlKFxuICAgICAgICAgICAganNmLCBudWxsLCBzZXRWYWx1ZXMsXG4gICAgICAgICAgICBzY2hlbWFSZWZQb2ludGVyLFxuICAgICAgICAgICAgaXRlbVJlZlBvaW50ZXIsXG4gICAgICAgICAgICB0ZW1wbGF0ZVBvaW50ZXIgKyAnL2NvbnRyb2xzLy0nXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zdCBpdGVtT3B0aW9ucyA9IGpzZi5kYXRhTWFwLmdldChpdGVtUmVmUG9pbnRlcikgfHwgbmV3IE1hcCgpO1xuICAgICAgICBjb25zdCBpdGVtT3B0aW9ucyA9IG5vZGVPcHRpb25zO1xuICAgICAgICBpZiAoIWl0ZW1SZWN1cnNpdmUgfHwgaGFzT3duKHZhbGlkYXRvcnMsICdyZXF1aXJlZCcpKSB7XG4gICAgICAgICAgY29uc3QgYXJyYXlMZW5ndGggPSBNYXRoLm1pbihNYXRoLm1heChcbiAgICAgICAgICAgIGl0ZW1SZWN1cnNpdmUgPyAwIDpcbiAgICAgICAgICAgICAgKGl0ZW1PcHRpb25zLmdldCgndHVwbGVJdGVtcycpICsgaXRlbU9wdGlvbnMuZ2V0KCdsaXN0SXRlbXMnKSkgfHwgMCxcbiAgICAgICAgICAgIGlzQXJyYXkobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZS5sZW5ndGggOiAwXG4gICAgICAgICAgKSwgbWF4SXRlbXMpO1xuICAgICAgICAgIGZvciAobGV0IGkgPSBjb250cm9scy5sZW5ndGg7IGkgPCBhcnJheUxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb250cm9scy5wdXNoKFxuICAgICAgICAgICAgICBpc0FycmF5KG5vZGVWYWx1ZSkgP1xuICAgICAgICAgICAgICAgIGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgICBqc2YsIG5vZGVWYWx1ZVtpXSwgc2V0VmFsdWVzLFxuICAgICAgICAgICAgICAgICAgc2NoZW1hUmVmUG9pbnRlcixcbiAgICAgICAgICAgICAgICAgIGRhdGFQb2ludGVyICsgJy8tJyxcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlUG9pbnRlciArICcvY29udHJvbHMvLSdcbiAgICAgICAgICAgICAgICApIDpcbiAgICAgICAgICAgICAgICBpdGVtUmVjdXJzaXZlID9cbiAgICAgICAgICAgICAgICAgIG51bGwgOiBfLmNsb25lRGVlcChqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geyBjb250cm9sVHlwZSwgY29udHJvbHMsIHZhbGlkYXRvcnMgfTtcblxuICAgIGNhc2UgJyRyZWYnOlxuICAgICAgY29uc3Qgc2NoZW1hUmVmID0gSnNvblBvaW50ZXIuY29tcGlsZShzY2hlbWEuJHJlZik7XG4gICAgICBjb25zdCBkYXRhUmVmID0gSnNvblBvaW50ZXIudG9EYXRhUG9pbnRlcihzY2hlbWFSZWYsIHNjaGVtYSk7XG4gICAgICBjb25zdCByZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgZGF0YVJlZiwganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcFxuICAgICAgKTtcbiAgICAgIGlmIChyZWZQb2ludGVyICYmICFoYXNPd24oanNmLnRlbXBsYXRlUmVmTGlicmFyeSwgcmVmUG9pbnRlcikpIHtcbiAgICAgICAgLy8gU2V0IHRvIG51bGwgZmlyc3QgdG8gcHJldmVudCByZWN1cnNpdmUgcmVmZXJlbmNlIGZyb20gY2F1c2luZyBlbmRsZXNzIGxvb3BcbiAgICAgICAganNmLnRlbXBsYXRlUmVmTGlicmFyeVtyZWZQb2ludGVyXSA9IG51bGw7XG4gICAgICAgIGNvbnN0IG5ld1RlbXBsYXRlID0gYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZShqc2YsIHNldFZhbHVlcywgc2V0VmFsdWVzLCBzY2hlbWFSZWYpO1xuICAgICAgICBpZiAobmV3VGVtcGxhdGUpIHtcbiAgICAgICAgICBqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W3JlZlBvaW50ZXJdID0gbmV3VGVtcGxhdGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnlbcmVmUG9pbnRlcl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuXG4gICAgY2FzZSAnRm9ybUNvbnRyb2wnOlxuICAgICAgY29uc3QgdmFsdWUgPSB7XG4gICAgICAgIHZhbHVlOiBzZXRWYWx1ZXMgJiYgaXNQcmltaXRpdmUobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZSA6IG51bGwsXG4gICAgICAgIGRpc2FibGVkOiBub2RlT3B0aW9ucy5nZXQoJ2Rpc2FibGVkJykgfHwgZmFsc2VcbiAgICAgIH07XG4gICAgICByZXR1cm4geyBjb250cm9sVHlwZSwgdmFsdWUsIHZhbGlkYXRvcnMgfTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqICdidWlsZEZvcm1Hcm91cCcgZnVuY3Rpb25cbiAqXG4gKiAvLyB7YW55fSB0ZW1wbGF0ZSAtXG4gKiAvLyB7QWJzdHJhY3RDb250cm9sfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEZvcm1Hcm91cCh0ZW1wbGF0ZTogYW55KTogQWJzdHJhY3RDb250cm9sIHtcbiAgY29uc3QgdmFsaWRhdG9yRm5zOiBWYWxpZGF0b3JGbltdID0gW107XG4gIGxldCB2YWxpZGF0b3JGbjogVmFsaWRhdG9yRm4gPSBudWxsO1xuICBpZiAoaGFzT3duKHRlbXBsYXRlLCAndmFsaWRhdG9ycycpKSB7XG4gICAgZm9yRWFjaCh0ZW1wbGF0ZS52YWxpZGF0b3JzLCAocGFyYW1ldGVycywgdmFsaWRhdG9yKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIEpzb25WYWxpZGF0b3JzW3ZhbGlkYXRvcl0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFsaWRhdG9yRm5zLnB1c2goSnNvblZhbGlkYXRvcnNbdmFsaWRhdG9yXS5hcHBseShudWxsLCBwYXJhbWV0ZXJzKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHZhbGlkYXRvckZucy5sZW5ndGggJiZcbiAgICAgIGluQXJyYXkodGVtcGxhdGUuY29udHJvbFR5cGUsIFsnRm9ybUdyb3VwJywgJ0Zvcm1BcnJheSddKVxuICAgICkge1xuICAgICAgdmFsaWRhdG9yRm4gPSB2YWxpZGF0b3JGbnMubGVuZ3RoID4gMSA/XG4gICAgICAgIEpzb25WYWxpZGF0b3JzLmNvbXBvc2UodmFsaWRhdG9yRm5zKSA6IHZhbGlkYXRvckZuc1swXTtcbiAgICB9XG4gIH1cbiAgaWYgKGhhc093bih0ZW1wbGF0ZSwgJ2NvbnRyb2xUeXBlJykpIHtcbiAgICBzd2l0Y2ggKHRlbXBsYXRlLmNvbnRyb2xUeXBlKSB7XG4gICAgICBjYXNlICdGb3JtR3JvdXAnOlxuICAgICAgICBjb25zdCBncm91cENvbnRyb2xzOiB7IFtrZXk6IHN0cmluZ106IEFic3RyYWN0Q29udHJvbCB9ID0ge307XG4gICAgICAgIGZvckVhY2godGVtcGxhdGUuY29udHJvbHMsIChjb250cm9scywga2V5KSA9PiB7XG4gICAgICAgICAgY29uc3QgbmV3Q29udHJvbDogQWJzdHJhY3RDb250cm9sID0gYnVpbGRGb3JtR3JvdXAoY29udHJvbHMpO1xuICAgICAgICAgIGlmIChuZXdDb250cm9sKSB7IGdyb3VwQ29udHJvbHNba2V5XSA9IG5ld0NvbnRyb2w7IH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXcgRm9ybUdyb3VwKGdyb3VwQ29udHJvbHMsIHZhbGlkYXRvckZuKTtcbiAgICAgIGNhc2UgJ0Zvcm1BcnJheSc6XG4gICAgICAgIHJldHVybiBuZXcgRm9ybUFycmF5KF8uZmlsdGVyKF8ubWFwKHRlbXBsYXRlLmNvbnRyb2xzLFxuICAgICAgICAgIGNvbnRyb2xzID0+IGJ1aWxkRm9ybUdyb3VwKGNvbnRyb2xzKVxuICAgICAgICApKSwgdmFsaWRhdG9yRm4pO1xuICAgICAgY2FzZSAnRm9ybUNvbnRyb2wnOlxuICAgICAgICByZXR1cm4gbmV3IEZvcm1Db250cm9sKHRlbXBsYXRlLnZhbHVlLCB2YWxpZGF0b3JGbnMpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiAnbWVyZ2VWYWx1ZXMnIGZ1bmN0aW9uXG4gKlxuICogLy8gIHthbnlbXX0gLi4udmFsdWVzVG9NZXJnZSAtIE11bHRpcGxlIHZhbHVlcyB0byBtZXJnZVxuICogLy8ge2FueX0gLSBNZXJnZWQgdmFsdWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVZhbHVlcyguLi52YWx1ZXNUb01lcmdlKSB7XG4gIGxldCBtZXJnZWRWYWx1ZXM6IGFueSA9IG51bGw7XG4gIGZvciAoY29uc3QgY3VycmVudFZhbHVlIG9mIHZhbHVlc1RvTWVyZ2UpIHtcbiAgICBpZiAoIWlzRW1wdHkoY3VycmVudFZhbHVlKSkge1xuICAgICAgaWYgKHR5cGVvZiBjdXJyZW50VmFsdWUgPT09ICdvYmplY3QnICYmXG4gICAgICAgIChpc0VtcHR5KG1lcmdlZFZhbHVlcykgfHwgdHlwZW9mIG1lcmdlZFZhbHVlcyAhPT0gJ29iamVjdCcpXG4gICAgICApIHtcbiAgICAgICAgaWYgKGlzQXJyYXkoY3VycmVudFZhbHVlKSkge1xuICAgICAgICAgIG1lcmdlZFZhbHVlcyA9IFsgLi4uY3VycmVudFZhbHVlIF07XG4gICAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QoY3VycmVudFZhbHVlKSkge1xuICAgICAgICAgIG1lcmdlZFZhbHVlcyA9IHsgLi4uY3VycmVudFZhbHVlIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGN1cnJlbnRWYWx1ZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgbWVyZ2VkVmFsdWVzID0gY3VycmVudFZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdChtZXJnZWRWYWx1ZXMpICYmIGlzT2JqZWN0KGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihtZXJnZWRWYWx1ZXMsIGN1cnJlbnRWYWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KG1lcmdlZFZhbHVlcykgJiYgaXNBcnJheShjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIGN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgIG5ld1ZhbHVlcy5wdXNoKG1lcmdlVmFsdWVzKG1lcmdlZFZhbHVlcywgdmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICBtZXJnZWRWYWx1ZXMgPSBuZXdWYWx1ZXM7XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXkobWVyZ2VkVmFsdWVzKSAmJiBpc09iamVjdChjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIG1lcmdlZFZhbHVlcykge1xuICAgICAgICAgIG5ld1ZhbHVlcy5wdXNoKG1lcmdlVmFsdWVzKHZhbHVlLCBjdXJyZW50VmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICBtZXJnZWRWYWx1ZXMgPSBuZXdWYWx1ZXM7XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXkobWVyZ2VkVmFsdWVzKSAmJiBpc0FycmF5KGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgY29uc3QgbmV3VmFsdWVzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5tYXgobWVyZ2VkVmFsdWVzLmxlbmd0aCwgY3VycmVudFZhbHVlLmxlbmd0aCk7IGkrKykge1xuICAgICAgICAgIGlmIChpIDwgbWVyZ2VkVmFsdWVzLmxlbmd0aCAmJiBpIDwgY3VycmVudFZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgbmV3VmFsdWVzLnB1c2gobWVyZ2VWYWx1ZXMobWVyZ2VkVmFsdWVzW2ldLCBjdXJyZW50VmFsdWVbaV0pKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGkgPCBtZXJnZWRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBuZXdWYWx1ZXMucHVzaChtZXJnZWRWYWx1ZXNbaV0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaSA8IGN1cnJlbnRWYWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIG5ld1ZhbHVlcy5wdXNoKGN1cnJlbnRWYWx1ZVtpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG1lcmdlZFZhbHVlcyA9IG5ld1ZhbHVlcztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1lcmdlZFZhbHVlcztcbn1cblxuLyoqXG4gKiAnc2V0UmVxdWlyZWRGaWVsZHMnIGZ1bmN0aW9uXG4gKlxuICogLy8ge3NjaGVtYX0gc2NoZW1hIC0gSlNPTiBTY2hlbWFcbiAqIC8vIHtvYmplY3R9IGZvcm1Db250cm9sVGVtcGxhdGUgLSBGb3JtIENvbnRyb2wgVGVtcGxhdGUgb2JqZWN0XG4gKiAvLyB7Ym9vbGVhbn0gLSB0cnVlIGlmIGFueSBmaWVsZHMgaGF2ZSBiZWVuIHNldCB0byByZXF1aXJlZCwgZmFsc2UgaWYgbm90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRSZXF1aXJlZEZpZWxkcyhzY2hlbWE6IGFueSwgZm9ybUNvbnRyb2xUZW1wbGF0ZTogYW55KTogYm9vbGVhbiB7XG4gIGxldCBmaWVsZHNSZXF1aXJlZCA9IGZhbHNlO1xuICBpZiAoaGFzT3duKHNjaGVtYSwgJ3JlcXVpcmVkJykgJiYgIWlzRW1wdHkoc2NoZW1hLnJlcXVpcmVkKSkge1xuICAgIGZpZWxkc1JlcXVpcmVkID0gdHJ1ZTtcbiAgICBsZXQgcmVxdWlyZWRBcnJheSA9IGlzQXJyYXkoc2NoZW1hLnJlcXVpcmVkKSA/IHNjaGVtYS5yZXF1aXJlZCA6IFtzY2hlbWEucmVxdWlyZWRdO1xuICAgIHJlcXVpcmVkQXJyYXkgPSBmb3JFYWNoKHJlcXVpcmVkQXJyYXksXG4gICAgICBrZXkgPT4gSnNvblBvaW50ZXIuc2V0KGZvcm1Db250cm9sVGVtcGxhdGUsICcvJyArIGtleSArICcvdmFsaWRhdG9ycy9yZXF1aXJlZCcsIFtdKVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIGZpZWxkc1JlcXVpcmVkO1xuXG4gIC8vIFRPRE86IEFkZCBzdXBwb3J0IGZvciBwYXR0ZXJuUHJvcGVydGllc1xuICAvLyBodHRwczovL3NwYWNldGVsZXNjb3BlLmdpdGh1Yi5pby91bmRlcnN0YW5kaW5nLWpzb24tc2NoZW1hL3JlZmVyZW5jZS9vYmplY3QuaHRtbCNwYXR0ZXJuLXByb3BlcnRpZXNcbn1cblxuLyoqXG4gKiAnZm9ybWF0Rm9ybURhdGEnIGZ1bmN0aW9uXG4gKlxuICogLy8ge2FueX0gZm9ybURhdGEgLSBBbmd1bGFyIEZvcm1Hcm91cCBkYXRhIG9iamVjdFxuICogLy8ge01hcDxzdHJpbmcsIGFueT59IGRhdGFNYXAgLVxuICogLy8ge01hcDxzdHJpbmcsIHN0cmluZz59IHJlY3Vyc2l2ZVJlZk1hcCAtXG4gKiAvLyB7TWFwPHN0cmluZywgbnVtYmVyPn0gYXJyYXlNYXAgLVxuICogLy8ge2Jvb2xlYW4gPSBmYWxzZX0gZml4RXJyb3JzIC0gaWYgVFJVRSwgdHJpZXMgdG8gZml4IGRhdGFcbiAqIC8vIHthbnl9IC0gZm9ybWF0dGVkIGRhdGEgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRGb3JtRGF0YShcbiAgZm9ybURhdGE6IGFueSwgZGF0YU1hcDogTWFwPHN0cmluZywgYW55PixcbiAgcmVjdXJzaXZlUmVmTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+LCBhcnJheU1hcDogTWFwPHN0cmluZywgbnVtYmVyPixcbiAgcmV0dXJuRW1wdHlGaWVsZHMgPSBmYWxzZSwgZml4RXJyb3JzID0gZmFsc2Vcbik6IGFueSB7XG4gIGlmIChmb3JtRGF0YSA9PT0gbnVsbCB8fCB0eXBlb2YgZm9ybURhdGEgIT09ICdvYmplY3QnKSB7IHJldHVybiBmb3JtRGF0YTsgfVxuICBjb25zdCBmb3JtYXR0ZWREYXRhID0gaXNBcnJheShmb3JtRGF0YSkgPyBbXSA6IHt9O1xuICBKc29uUG9pbnRlci5mb3JFYWNoRGVlcChmb3JtRGF0YSwgKHZhbHVlLCBkYXRhUG9pbnRlcikgPT4ge1xuXG4gICAgLy8gSWYgcmV0dXJuRW1wdHlGaWVsZHMgPT09IHRydWUsXG4gICAgLy8gYWRkIGVtcHR5IGFycmF5cyBhbmQgb2JqZWN0cyB0byBhbGwgYWxsb3dlZCBrZXlzXG4gICAgaWYgKHJldHVybkVtcHR5RmllbGRzICYmIGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICBKc29uUG9pbnRlci5zZXQoZm9ybWF0dGVkRGF0YSwgZGF0YVBvaW50ZXIsIFtdKTtcbiAgICB9IGVsc2UgaWYgKHJldHVybkVtcHR5RmllbGRzICYmIGlzT2JqZWN0KHZhbHVlKSAmJiAhaXNEYXRlKHZhbHVlKSkge1xuICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGRhdGFQb2ludGVyLCB7fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGdlbmVyaWNQb2ludGVyID1cbiAgICAgICAgSnNvblBvaW50ZXIuaGFzKGRhdGFNYXAsIFtkYXRhUG9pbnRlciwgJ3NjaGVtYVR5cGUnXSkgPyBkYXRhUG9pbnRlciA6XG4gICAgICAgICAgcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhkYXRhUG9pbnRlciwgcmVjdXJzaXZlUmVmTWFwLCBhcnJheU1hcCk7XG4gICAgICBpZiAoSnNvblBvaW50ZXIuaGFzKGRhdGFNYXAsIFtnZW5lcmljUG9pbnRlciwgJ3NjaGVtYVR5cGUnXSkpIHtcbiAgICAgICAgY29uc3Qgc2NoZW1hVHlwZTogU2NoZW1hUHJpbWl0aXZlVHlwZSB8IFNjaGVtYVByaW1pdGl2ZVR5cGVbXSA9XG4gICAgICAgICAgZGF0YU1hcC5nZXQoZ2VuZXJpY1BvaW50ZXIpLmdldCgnc2NoZW1hVHlwZScpO1xuICAgICAgICBpZiAoc2NoZW1hVHlwZSA9PT0gJ251bGwnKSB7XG4gICAgICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGRhdGFQb2ludGVyLCBudWxsKTtcbiAgICAgICAgfSBlbHNlIGlmICgoaGFzVmFsdWUodmFsdWUpIHx8IHJldHVybkVtcHR5RmllbGRzKSAmJlxuICAgICAgICAgIGluQXJyYXkoc2NoZW1hVHlwZSwgWydzdHJpbmcnLCAnaW50ZWdlcicsICdudW1iZXInLCAnYm9vbGVhbiddKVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IChmaXhFcnJvcnMgfHwgKHZhbHVlID09PSBudWxsICYmIHJldHVybkVtcHR5RmllbGRzKSkgP1xuICAgICAgICAgICAgdG9TY2hlbWFUeXBlKHZhbHVlLCBzY2hlbWFUeXBlKSA6IHRvSmF2YVNjcmlwdFR5cGUodmFsdWUsIHNjaGVtYVR5cGUpO1xuICAgICAgICAgIGlmIChpc0RlZmluZWQobmV3VmFsdWUpIHx8IHJldHVybkVtcHR5RmllbGRzKSB7XG4gICAgICAgICAgICBKc29uUG9pbnRlci5zZXQoZm9ybWF0dGVkRGF0YSwgZGF0YVBvaW50ZXIsIG5ld1ZhbHVlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgcmV0dXJuRW1wdHlGaWVsZHMgPT09IGZhbHNlLFxuICAgICAgICAvLyBvbmx5IGFkZCBlbXB0eSBhcnJheXMgYW5kIG9iamVjdHMgdG8gcmVxdWlyZWQga2V5c1xuICAgICAgICB9IGVsc2UgaWYgKHNjaGVtYVR5cGUgPT09ICdvYmplY3QnICYmICFyZXR1cm5FbXB0eUZpZWxkcykge1xuICAgICAgICAgIChkYXRhTWFwLmdldChnZW5lcmljUG9pbnRlcikuZ2V0KCdyZXF1aXJlZCcpIHx8IFtdKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICBjb25zdCBrZXlTY2hlbWFUeXBlID1cbiAgICAgICAgICAgICAgZGF0YU1hcC5nZXQoYCR7Z2VuZXJpY1BvaW50ZXJ9LyR7a2V5fWApLmdldCgnc2NoZW1hVHlwZScpO1xuICAgICAgICAgICAgaWYgKGtleVNjaGVtYVR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgICAgICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGAke2RhdGFQb2ludGVyfS8ke2tleX1gLCBbXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleVNjaGVtYVR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgIEpzb25Qb2ludGVyLnNldChmb3JtYXR0ZWREYXRhLCBgJHtkYXRhUG9pbnRlcn0vJHtrZXl9YCwge30pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluaXNoIGluY29tcGxldGUgJ2RhdGUtdGltZScgZW50cmllc1xuICAgICAgICBpZiAoZGF0YU1hcC5nZXQoZ2VuZXJpY1BvaW50ZXIpLmdldCgnc2NoZW1hRm9ybWF0JykgPT09ICdkYXRlLXRpbWUnKSB7XG4gICAgICAgICAgLy8gXCIyMDAwLTAzLTE0VDAxOjU5OjI2LjUzNVwiIC0+IFwiMjAwMC0wMy0xNFQwMTo1OToyNi41MzVaXCIgKGFkZCBcIlpcIilcbiAgICAgICAgICBpZiAoL15cXGRcXGRcXGRcXGQtWzAtMV1cXGQtWzAtM11cXGRbdFxcc11bMC0yXVxcZDpbMC01XVxcZDpbMC01XVxcZCg/OlxcLlxcZCspPyQvaS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGRhdGFQb2ludGVyLCBgJHt2YWx1ZX1aYCk7XG4gICAgICAgICAgLy8gXCIyMDAwLTAzLTE0VDAxOjU5XCIgLT4gXCIyMDAwLTAzLTE0VDAxOjU5OjAwWlwiIChhZGQgXCI6MDBaXCIpXG4gICAgICAgICAgfSBlbHNlIGlmICgvXlxcZFxcZFxcZFxcZC1bMC0xXVxcZC1bMC0zXVxcZFt0XFxzXVswLTJdXFxkOlswLTVdXFxkJC9pLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICBKc29uUG9pbnRlci5zZXQoZm9ybWF0dGVkRGF0YSwgZGF0YVBvaW50ZXIsIGAke3ZhbHVlfTowMFpgKTtcbiAgICAgICAgICAvLyBcIjIwMDAtMDMtMTRcIiAtPiBcIjIwMDAtMDMtMTRUMDA6MDA6MDBaXCIgKGFkZCBcIlQwMDowMDowMFpcIilcbiAgICAgICAgICB9IGVsc2UgaWYgKGZpeEVycm9ycyAmJiAvXlxcZFxcZFxcZFxcZC1bMC0xXVxcZC1bMC0zXVxcZCQvaS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGRhdGFQb2ludGVyLCBgJHt2YWx1ZX06MDA6MDA6MDBaYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgfHwgaXNEYXRlKHZhbHVlKSB8fFxuICAgICAgICAodmFsdWUgPT09IG51bGwgJiYgcmV0dXJuRW1wdHlGaWVsZHMpXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignZm9ybWF0Rm9ybURhdGEgZXJyb3I6ICcgK1xuICAgICAgICAgIGBTY2hlbWEgdHlwZSBub3QgZm91bmQgZm9yIGZvcm0gdmFsdWUgYXQgJHtnZW5lcmljUG9pbnRlcn1gKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignZGF0YU1hcCcsIGRhdGFNYXApO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdyZWN1cnNpdmVSZWZNYXAnLCByZWN1cnNpdmVSZWZNYXApO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdnZW5lcmljUG9pbnRlcicsIGdlbmVyaWNQb2ludGVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZm9ybWF0dGVkRGF0YTtcbn1cblxuLyoqXG4gKiAnZ2V0Q29udHJvbCcgZnVuY3Rpb25cbiAqXG4gKiBVc2VzIGEgSlNPTiBQb2ludGVyIGZvciBhIGRhdGEgb2JqZWN0IHRvIHJldHJpZXZlIGEgY29udHJvbCBmcm9tXG4gKiBhbiBBbmd1bGFyIGZvcm1Hcm91cCBvciBmb3JtR3JvdXAgdGVtcGxhdGUuIChOb3RlOiB0aG91Z2ggYSBmb3JtR3JvdXBcbiAqIHRlbXBsYXRlIGlzIG11Y2ggc2ltcGxlciwgaXRzIGJhc2ljIHN0cnVjdHVyZSBpcyBpZGVudGlhbCB0byBhIGZvcm1Hcm91cCkuXG4gKlxuICogSWYgdGhlIG9wdGlvbmFsIHRoaXJkIHBhcmFtZXRlciAncmV0dXJuR3JvdXAnIGlzIHNldCB0byBUUlVFLCB0aGUgZ3JvdXBcbiAqIGNvbnRhaW5pbmcgdGhlIGNvbnRyb2wgaXMgcmV0dXJuZWQsIHJhdGhlciB0aGFuIHRoZSBjb250cm9sIGl0c2VsZi5cbiAqXG4gKiAvLyB7Rm9ybUdyb3VwfSBmb3JtR3JvdXAgLSBBbmd1bGFyIEZvcm1Hcm91cCB0byBnZXQgdmFsdWUgZnJvbVxuICogLy8ge1BvaW50ZXJ9IGRhdGFQb2ludGVyIC0gSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpXG4gKiAvLyB7Ym9vbGVhbiA9IGZhbHNlfSByZXR1cm5Hcm91cCAtIElmIHRydWUsIHJldHVybiBncm91cCBjb250YWluaW5nIGNvbnRyb2xcbiAqIC8vIHtncm91cH0gLSBMb2NhdGVkIHZhbHVlIChvciBudWxsLCBpZiBubyBjb250cm9sIGZvdW5kKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udHJvbChcbiAgZm9ybUdyb3VwOiBhbnksIGRhdGFQb2ludGVyOiBQb2ludGVyLCByZXR1cm5Hcm91cCA9IGZhbHNlXG4pOiBhbnkge1xuICBpZiAoIWlzT2JqZWN0KGZvcm1Hcm91cCkgfHwgIUpzb25Qb2ludGVyLmlzSnNvblBvaW50ZXIoZGF0YVBvaW50ZXIpKSB7XG4gICAgaWYgKCFKc29uUG9pbnRlci5pc0pzb25Qb2ludGVyKGRhdGFQb2ludGVyKSkge1xuICAgICAgLy8gSWYgZGF0YVBvaW50ZXIgaW5wdXQgaXMgbm90IGEgdmFsaWQgSlNPTiBwb2ludGVyLCBjaGVjayB0b1xuICAgICAgLy8gc2VlIGlmIGl0IGlzIGluc3RlYWQgYSB2YWxpZCBvYmplY3QgcGF0aCwgdXNpbmcgZG90IG5vdGFpb25cbiAgICAgIGlmICh0eXBlb2YgZGF0YVBvaW50ZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnN0IGZvcm1Db250cm9sID0gZm9ybUdyb3VwLmdldChkYXRhUG9pbnRlcik7XG4gICAgICAgIGlmIChmb3JtQ29udHJvbCkgeyByZXR1cm4gZm9ybUNvbnRyb2w7IH1cbiAgICAgIH1cbiAgICAgIGNvbnNvbGUuZXJyb3IoYGdldENvbnRyb2wgZXJyb3I6IEludmFsaWQgSlNPTiBQb2ludGVyOiAke2RhdGFQb2ludGVyfWApO1xuICAgIH1cbiAgICBpZiAoIWlzT2JqZWN0KGZvcm1Hcm91cCkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYGdldENvbnRyb2wgZXJyb3I6IEludmFsaWQgZm9ybUdyb3VwOiAke2Zvcm1Hcm91cH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgbGV0IGRhdGFQb2ludGVyQXJyYXkgPSBKc29uUG9pbnRlci5wYXJzZShkYXRhUG9pbnRlcik7XG4gIGlmIChyZXR1cm5Hcm91cCkgeyBkYXRhUG9pbnRlckFycmF5ID0gZGF0YVBvaW50ZXJBcnJheS5zbGljZSgwLCAtMSk7IH1cblxuICAvLyBJZiBmb3JtR3JvdXAgaW5wdXQgaXMgYSByZWFsIGZvcm1Hcm91cCAobm90IGEgZm9ybUdyb3VwIHRlbXBsYXRlKVxuICAvLyB0cnkgdXNpbmcgZm9ybUdyb3VwLmdldCgpIHRvIHJldHVybiB0aGUgY29udHJvbFxuICBpZiAodHlwZW9mIGZvcm1Hcm91cC5nZXQgPT09ICdmdW5jdGlvbicgJiZcbiAgICBkYXRhUG9pbnRlckFycmF5LmV2ZXJ5KGtleSA9PiBrZXkuaW5kZXhPZignLicpID09PSAtMSlcbiAgKSB7XG4gICAgY29uc3QgZm9ybUNvbnRyb2wgPSBmb3JtR3JvdXAuZ2V0KGRhdGFQb2ludGVyQXJyYXkuam9pbignLicpKTtcbiAgICBpZiAoZm9ybUNvbnRyb2wpIHsgcmV0dXJuIGZvcm1Db250cm9sOyB9XG4gIH1cblxuICAvLyBJZiBmb3JtR3JvdXAgaW5wdXQgaXMgYSBmb3JtR3JvdXAgdGVtcGxhdGUsXG4gIC8vIG9yIGZvcm1Hcm91cC5nZXQoKSBmYWlsZWQgdG8gcmV0dXJuIHRoZSBjb250cm9sLFxuICAvLyBzZWFyY2ggdGhlIGZvcm1Hcm91cCBvYmplY3QgZm9yIGRhdGFQb2ludGVyJ3MgY29udHJvbFxuICBsZXQgc3ViR3JvdXAgPSBmb3JtR3JvdXA7XG4gIGZvciAoY29uc3Qga2V5IG9mIGRhdGFQb2ludGVyQXJyYXkpIHtcbiAgICBpZiAoaGFzT3duKHN1Ykdyb3VwLCAnY29udHJvbHMnKSkgeyBzdWJHcm91cCA9IHN1Ykdyb3VwLmNvbnRyb2xzOyB9XG4gICAgaWYgKGlzQXJyYXkoc3ViR3JvdXApICYmIChrZXkgPT09ICctJykpIHtcbiAgICAgIHN1Ykdyb3VwID0gc3ViR3JvdXBbc3ViR3JvdXAubGVuZ3RoIC0gMV07XG4gICAgfSBlbHNlIGlmIChoYXNPd24oc3ViR3JvdXAsIGtleSkpIHtcbiAgICAgIHN1Ykdyb3VwID0gc3ViR3JvdXBba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihgZ2V0Q29udHJvbCBlcnJvcjogVW5hYmxlIHRvIGZpbmQgXCIke2tleX1cIiBpdGVtIGluIEZvcm1Hcm91cC5gKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZGF0YVBvaW50ZXIpO1xuICAgICAgY29uc29sZS5lcnJvcihmb3JtR3JvdXApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3ViR3JvdXA7XG59XG4iXX0=