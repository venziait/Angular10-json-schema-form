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
export function buildFormGroupTemplate(jsf, nodeValue = null, setValues = true, schemaPointer = '', dataPointer = '', templatePointer = '') {
    const schema = JsonPointer.get(jsf.schema, schemaPointer);
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
    const schemaType = JsonPointer.get(schema, '/type');
    const controlType = (hasOwn(schema, 'properties') || hasOwn(schema, 'additionalProperties')) &&
        schemaType === 'object' ? 'FormGroup' :
        (hasOwn(schema, 'items') || hasOwn(schema, 'additionalItems')) &&
            schemaType === 'array' ? 'FormArray' :
            !schemaType && hasOwn(schema, '$ref') ? '$ref' : 'FormControl';
    const shortDataPointer = removeRecursiveReferences(dataPointer, jsf.dataRecursiveRefMap, jsf.arrayMap);
    if (!jsf.dataMap.has(shortDataPointer)) {
        jsf.dataMap.set(shortDataPointer, new Map());
    }
    const nodeOptions = jsf.dataMap.get(shortDataPointer);
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
    let controls;
    const validators = getControlValidators(schema);
    switch (controlType) {
        case 'FormGroup':
            controls = {};
            if (hasOwn(schema, 'ui:order') || hasOwn(schema, 'properties')) {
                const propertyKeys = schema['ui:order'] || Object.keys(schema.properties);
                if (propertyKeys.includes('*') && !hasOwn(schema.properties, '*')) {
                    const unnamedKeys = Object.keys(schema.properties)
                        .filter(key => !propertyKeys.includes(key));
                    for (let i = propertyKeys.length - 1; i >= 0; i--) {
                        if (propertyKeys[i] === '*') {
                            propertyKeys.splice(i, 1, ...unnamedKeys);
                        }
                    }
                }
                propertyKeys
                    .filter(key => hasOwn(schema.properties, key) ||
                    hasOwn(schema, 'additionalProperties'))
                    .forEach(key => controls[key] = buildFormGroupTemplate(jsf, JsonPointer.get(nodeValue, [key]), setValues, schemaPointer + (hasOwn(schema.properties, key) ?
                    '/properties/' + key : '/additionalProperties'), dataPointer + '/' + key, templatePointer + '/controls/' + key));
                jsf.formOptions.fieldsRequired = setRequiredFields(schema, controls);
            }
            return { controlType, controls, validators };
        case 'FormArray':
            controls = [];
            const minItems = Math.max(schema.minItems || 0, nodeOptions.get('minItems') || 0);
            const maxItems = Math.min(schema.maxItems || 1000, nodeOptions.get('maxItems') || 1000);
            let additionalItemsPointer = null;
            if (isArray(schema.items)) {
                const tupleItems = nodeOptions.get('tupleItems') ||
                    (isArray(schema.items) ? Math.min(schema.items.length, maxItems) : 0);
                for (let i = 0; i < tupleItems; i++) {
                    if (i < minItems) {
                        controls.push(buildFormGroupTemplate(jsf, isArray(nodeValue) ? nodeValue[i] : nodeValue, setValues, schemaPointer + '/items/' + i, dataPointer + '/' + i, templatePointer + '/controls/' + i));
                    }
                    else {
                        const schemaRefPointer = removeRecursiveReferences(schemaPointer + '/items/' + i, jsf.schemaRecursiveRefMap);
                        const itemRefPointer = removeRecursiveReferences(shortDataPointer + '/' + i, jsf.dataRecursiveRefMap, jsf.arrayMap);
                        const itemRecursive = itemRefPointer !== shortDataPointer + '/' + i;
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
                const schemaRefPointer = removeRecursiveReferences(additionalItemsPointer, jsf.schemaRecursiveRefMap);
                const itemRefPointer = removeRecursiveReferences(shortDataPointer + '/-', jsf.dataRecursiveRefMap, jsf.arrayMap);
                const itemRecursive = itemRefPointer !== shortDataPointer + '/-';
                if (!hasOwn(jsf.templateRefLibrary, itemRefPointer)) {
                    jsf.templateRefLibrary[itemRefPointer] = null;
                    jsf.templateRefLibrary[itemRefPointer] = buildFormGroupTemplate(jsf, null, setValues, schemaRefPointer, itemRefPointer, templatePointer + '/controls/-');
                }
                // const itemOptions = jsf.dataMap.get(itemRefPointer) || new Map();
                const itemOptions = nodeOptions;
                if (!itemRecursive || hasOwn(validators, 'required')) {
                    const arrayLength = Math.min(Math.max(itemRecursive ? 0 :
                        (itemOptions.get('tupleItems') + itemOptions.get('listItems')) || 0, isArray(nodeValue) ? nodeValue.length : 0), maxItems);
                    for (let i = controls.length; i < arrayLength; i++) {
                        controls.push(isArray(nodeValue) ?
                            buildFormGroupTemplate(jsf, nodeValue[i], setValues, schemaRefPointer, dataPointer + '/-', templatePointer + '/controls/-') :
                            itemRecursive ?
                                null : _.cloneDeep(jsf.templateRefLibrary[itemRefPointer]));
                    }
                }
            }
            return { controlType, controls, validators };
        case '$ref':
            const schemaRef = JsonPointer.compile(schema.$ref);
            const dataRef = JsonPointer.toDataPointer(schemaRef, schema);
            const refPointer = removeRecursiveReferences(dataRef, jsf.dataRecursiveRefMap, jsf.arrayMap);
            if (refPointer && !hasOwn(jsf.templateRefLibrary, refPointer)) {
                // Set to null first to prevent recursive reference from causing endless loop
                jsf.templateRefLibrary[refPointer] = null;
                const newTemplate = buildFormGroupTemplate(jsf, setValues, setValues, schemaRef);
                if (newTemplate) {
                    jsf.templateRefLibrary[refPointer] = newTemplate;
                }
                else {
                    delete jsf.templateRefLibrary[refPointer];
                }
            }
            return null;
        case 'FormControl':
            const value = {
                value: setValues && isPrimitive(nodeValue) ? nodeValue : null,
                disabled: nodeOptions.get('disabled') || false
            };
            return { controlType, value, validators };
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
    const validatorFns = [];
    let validatorFn = null;
    if (hasOwn(template, 'validators')) {
        forEach(template.validators, (parameters, validator) => {
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
                const groupControls = {};
                forEach(template.controls, (controls, key) => {
                    const newControl = buildFormGroup(controls);
                    if (newControl) {
                        groupControls[key] = newControl;
                    }
                });
                return new FormGroup(groupControls, validatorFn);
            case 'FormArray':
                return new FormArray(_.filter(_.map(template.controls, controls => buildFormGroup(controls))), validatorFn);
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
export function mergeValues(...valuesToMerge) {
    let mergedValues = null;
    for (const currentValue of valuesToMerge) {
        if (!isEmpty(currentValue)) {
            if (typeof currentValue === 'object' &&
                (isEmpty(mergedValues) || typeof mergedValues !== 'object')) {
                if (isArray(currentValue)) {
                    mergedValues = [...currentValue];
                }
                else if (isObject(currentValue)) {
                    mergedValues = Object.assign({}, currentValue);
                }
            }
            else if (typeof currentValue !== 'object') {
                mergedValues = currentValue;
            }
            else if (isObject(mergedValues) && isObject(currentValue)) {
                Object.assign(mergedValues, currentValue);
            }
            else if (isObject(mergedValues) && isArray(currentValue)) {
                const newValues = [];
                for (const value of currentValue) {
                    newValues.push(mergeValues(mergedValues, value));
                }
                mergedValues = newValues;
            }
            else if (isArray(mergedValues) && isObject(currentValue)) {
                const newValues = [];
                for (const value of mergedValues) {
                    newValues.push(mergeValues(value, currentValue));
                }
                mergedValues = newValues;
            }
            else if (isArray(mergedValues) && isArray(currentValue)) {
                const newValues = [];
                for (let i = 0; i < Math.max(mergedValues.length, currentValue.length); i++) {
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
    return mergedValues;
}
/**
 * 'setRequiredFields' function
 *
 * // {schema} schema - JSON Schema
 * // {object} formControlTemplate - Form Control Template object
 * // {boolean} - true if any fields have been set to required, false if not
 */
export function setRequiredFields(schema, formControlTemplate) {
    let fieldsRequired = false;
    if (hasOwn(schema, 'required') && !isEmpty(schema.required)) {
        fieldsRequired = true;
        let requiredArray = isArray(schema.required) ? schema.required : [schema.required];
        requiredArray = forEach(requiredArray, key => JsonPointer.set(formControlTemplate, '/' + key + '/validators/required', []));
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
export function formatFormData(formData, dataMap, recursiveRefMap, arrayMap, returnEmptyFields = false, fixErrors = false) {
    if (formData === null || typeof formData !== 'object') {
        return formData;
    }
    const formattedData = isArray(formData) ? [] : {};
    JsonPointer.forEachDeep(formData, (value, dataPointer) => {
        // If returnEmptyFields === true,
        // add empty arrays and objects to all allowed keys
        if (returnEmptyFields && isArray(value)) {
            JsonPointer.set(formattedData, dataPointer, []);
        }
        else if (returnEmptyFields && isObject(value) && !isDate(value)) {
            JsonPointer.set(formattedData, dataPointer, {});
        }
        else {
            const genericPointer = JsonPointer.has(dataMap, [dataPointer, 'schemaType']) ? dataPointer :
                removeRecursiveReferences(dataPointer, recursiveRefMap, arrayMap);
            if (JsonPointer.has(dataMap, [genericPointer, 'schemaType'])) {
                const schemaType = dataMap.get(genericPointer).get('schemaType');
                if (schemaType === 'null') {
                    JsonPointer.set(formattedData, dataPointer, null);
                }
                else if ((hasValue(value) || returnEmptyFields) &&
                    inArray(schemaType, ['string', 'integer', 'number', 'boolean'])) {
                    const newValue = (fixErrors || (value === null && returnEmptyFields)) ?
                        toSchemaType(value, schemaType) : toJavaScriptType(value, schemaType);
                    if (isDefined(newValue) || returnEmptyFields) {
                        JsonPointer.set(formattedData, dataPointer, newValue);
                    }
                    // If returnEmptyFields === false,
                    // only add empty arrays and objects to required keys
                }
                else if (schemaType === 'object' && !returnEmptyFields) {
                    (dataMap.get(genericPointer).get('required') || []).forEach(key => {
                        const keySchemaType = dataMap.get(`${genericPointer}/${key}`).get('schemaType');
                        if (keySchemaType === 'array') {
                            JsonPointer.set(formattedData, `${dataPointer}/${key}`, []);
                        }
                        else if (keySchemaType === 'object') {
                            JsonPointer.set(formattedData, `${dataPointer}/${key}`, {});
                        }
                    });
                }
                // Finish incomplete 'date-time' entries
                if (dataMap.get(genericPointer).get('schemaFormat') === 'date-time') {
                    // "2000-03-14T01:59:26.535" -> "2000-03-14T01:59:26.535Z" (add "Z")
                    if (/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?$/i.test(value)) {
                        JsonPointer.set(formattedData, dataPointer, `${value}Z`);
                        // "2000-03-14T01:59" -> "2000-03-14T01:59:00Z" (add ":00Z")
                    }
                    else if (/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d$/i.test(value)) {
                        JsonPointer.set(formattedData, dataPointer, `${value}:00Z`);
                        // "2000-03-14" -> "2000-03-14T00:00:00Z" (add "T00:00:00Z")
                    }
                    else if (fixErrors && /^\d\d\d\d-[0-1]\d-[0-3]\d$/i.test(value)) {
                        JsonPointer.set(formattedData, dataPointer, `${value}:00:00:00Z`);
                    }
                }
            }
            else if (typeof value !== 'object' || isDate(value) ||
                (value === null && returnEmptyFields)) {
                console.error('formatFormData error: ' +
                    `Schema type not found for form value at ${genericPointer}`);
                console.error('dataMap', dataMap);
                console.error('recursiveRefMap', recursiveRefMap);
                console.error('genericPointer', genericPointer);
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
export function getControl(formGroup, dataPointer, returnGroup = false) {
    if (!isObject(formGroup) || !JsonPointer.isJsonPointer(dataPointer)) {
        if (!JsonPointer.isJsonPointer(dataPointer)) {
            // If dataPointer input is not a valid JSON pointer, check to
            // see if it is instead a valid object path, using dot notaion
            if (typeof dataPointer === 'string') {
                const formControl = formGroup.get(dataPointer);
                if (formControl) {
                    return formControl;
                }
            }
            console.error(`getControl error: Invalid JSON Pointer: ${dataPointer}`);
        }
        if (!isObject(formGroup)) {
            console.error(`getControl error: Invalid formGroup: ${formGroup}`);
        }
        return null;
    }
    let dataPointerArray = JsonPointer.parse(dataPointer);
    if (returnGroup) {
        dataPointerArray = dataPointerArray.slice(0, -1);
    }
    // If formGroup input is a real formGroup (not a formGroup template)
    // try using formGroup.get() to return the control
    if (typeof formGroup.get === 'function' &&
        dataPointerArray.every(key => key.indexOf('.') === -1)) {
        const formControl = formGroup.get(dataPointerArray.join('.'));
        if (formControl) {
            return formControl;
        }
    }
    // If formGroup input is a formGroup template,
    // or formGroup.get() failed to return the control,
    // search the formGroup object for dataPointer's control
    let subGroup = formGroup;
    for (const key of dataPointerArray) {
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
            console.error(`getControl error: Unable to find "${key}" item in FormGroup.`);
            console.error(dataPointer);
            console.error(formGroup);
            return;
        }
    }
    return subGroup;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1ncm91cC5mdW5jdGlvbnMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL3NoYXJlZC9mb3JtLWdyb3VwLmZ1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ1ksU0FBUyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQ25ELE1BQU0sZ0JBQWdCLENBQUM7QUFFeEIsT0FBTyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUM7QUFFNUIsT0FBTyxFQUNMLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQzdFLGdCQUFnQixFQUFFLFlBQVksRUFDL0IsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RELE9BQU8sRUFBVyxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbkQsT0FBTyxFQUNTLG9CQUFvQixFQUFnQix5QkFBeUIsRUFDNUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBRUg7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsTUFBTSxpQ0FDSixHQUFRLEVBQUUsWUFBaUIsSUFBSSxFQUFFLFNBQVMsR0FBRyxJQUFJLEVBQ2pELGFBQWEsR0FBRyxFQUFFLEVBQUUsV0FBVyxHQUFHLEVBQUUsRUFBRSxlQUFlLEdBQUcsRUFBRTtJQUUxRCxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDMUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNkLEVBQUUsQ0FB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QUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxHQUFHLHNCQUFzQixDQUFDLENBQUM7WUFDOUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQztRQUNULENBQUM7SUFDSCxDQUFDO0lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNsQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWJzdHJhY3RDb250cm9sLCBGb3JtQXJyYXksIEZvcm1Db250cm9sLCBGb3JtR3JvdXAsIFZhbGlkYXRvckZuXG59IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQge1xuICBoYXNWYWx1ZSwgaW5BcnJheSwgaXNBcnJheSwgaXNFbXB0eSwgaXNEYXRlLCBpc09iamVjdCwgaXNEZWZpbmVkLCBpc1ByaW1pdGl2ZSxcbiAgdG9KYXZhU2NyaXB0VHlwZSwgdG9TY2hlbWFUeXBlLCBTY2hlbWFQcmltaXRpdmVUeXBlXG59IGZyb20gJy4vdmFsaWRhdG9yLmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBmb3JFYWNoLCBoYXNPd24gfSBmcm9tICcuL3V0aWxpdHkuZnVuY3Rpb25zJztcbmltcG9ydCB7IFBvaW50ZXIsIEpzb25Qb2ludGVyIH0gZnJvbSAnLi9qc29ucG9pbnRlci5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgSnNvblZhbGlkYXRvcnMgfSBmcm9tICcuL2pzb24udmFsaWRhdG9ycyc7XG5pbXBvcnQge1xuICBjb21iaW5lQWxsT2YsIGdldENvbnRyb2xWYWxpZGF0b3JzLCBnZXRTdWJTY2hlbWEsIHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXNcbn0gZnJvbSAnLi9qc29uLXNjaGVtYS5mdW5jdGlvbnMnO1xuXG4vKipcbiAqIEZvcm1Hcm91cCBmdW5jdGlvbiBsaWJyYXJ5OlxuICpcbiAqIGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGU6ICBCdWlsZHMgYSBGb3JtR3JvdXBUZW1wbGF0ZSBmcm9tIHNjaGVtYVxuICpcbiAqIGJ1aWxkRm9ybUdyb3VwOiAgICAgICAgICBCdWlsZHMgYW4gQW5ndWxhciBGb3JtR3JvdXAgZnJvbSBhIEZvcm1Hcm91cFRlbXBsYXRlXG4gKlxuICogbWVyZ2VWYWx1ZXM6XG4gKlxuICogc2V0UmVxdWlyZWRGaWVsZHM6XG4gKlxuICogZm9ybWF0Rm9ybURhdGE6XG4gKlxuICogZ2V0Q29udHJvbDpcbiAqXG4gKiAtLS0tIFRPRE86IC0tLS1cbiAqIFRPRE86IGFkZCBidWlsZEZvcm1Hcm91cFRlbXBsYXRlRnJvbUxheW91dCBmdW5jdGlvblxuICogYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZUZyb21MYXlvdXQ6IEJ1aWxkcyBhIEZvcm1Hcm91cFRlbXBsYXRlIGZyb20gYSBmb3JtIGxheW91dFxuICovXG5cbi8qKlxuICogJ2J1aWxkRm9ybUdyb3VwVGVtcGxhdGUnIGZ1bmN0aW9uXG4gKlxuICogQnVpbGRzIGEgdGVtcGxhdGUgZm9yIGFuIEFuZ3VsYXIgRm9ybUdyb3VwIGZyb20gYSBKU09OIFNjaGVtYS5cbiAqXG4gKiBUT0RPOiBhZGQgc3VwcG9ydCBmb3IgcGF0dGVybiBwcm9wZXJ0aWVzXG4gKiBodHRwczovL3NwYWNldGVsZXNjb3BlLmdpdGh1Yi5pby91bmRlcnN0YW5kaW5nLWpzb24tc2NoZW1hL3JlZmVyZW5jZS9vYmplY3QuaHRtbFxuICpcbiAqIC8vICB7YW55fSBqc2YgLVxuICogLy8gIHthbnkgPSBudWxsfSBub2RlVmFsdWUgLVxuICogLy8gIHtib29sZWFuID0gdHJ1ZX0gbWFwQXJyYXlzIC1cbiAqIC8vICB7c3RyaW5nID0gJyd9IHNjaGVtYVBvaW50ZXIgLVxuICogLy8gIHtzdHJpbmcgPSAnJ30gZGF0YVBvaW50ZXIgLVxuICogLy8gIHthbnkgPSAnJ30gdGVtcGxhdGVQb2ludGVyIC1cbiAqIC8vIHthbnl9IC1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gIGpzZjogYW55LCBub2RlVmFsdWU6IGFueSA9IG51bGwsIHNldFZhbHVlcyA9IHRydWUsXG4gIHNjaGVtYVBvaW50ZXIgPSAnJywgZGF0YVBvaW50ZXIgPSAnJywgdGVtcGxhdGVQb2ludGVyID0gJydcbikge1xuICBjb25zdCBzY2hlbWEgPSBKc29uUG9pbnRlci5nZXQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlcik7XG4gIGlmIChzZXRWYWx1ZXMpIHtcbiAgICBpZiAoIWlzRGVmaW5lZChub2RlVmFsdWUpICYmIChcbiAgICAgIGpzZi5mb3JtT3B0aW9ucy5zZXRTY2hlbWFEZWZhdWx0cyA9PT0gdHJ1ZSB8fFxuICAgICAgKGpzZi5mb3JtT3B0aW9ucy5zZXRTY2hlbWFEZWZhdWx0cyA9PT0gJ2F1dG8nICYmIGlzRW1wdHkoanNmLmZvcm1WYWx1ZXMpKVxuICAgICkpIHtcbiAgICAgIG5vZGVWYWx1ZSA9IEpzb25Qb2ludGVyLmdldChqc2Yuc2NoZW1hLCBzY2hlbWFQb2ludGVyICsgJy9kZWZhdWx0Jyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG5vZGVWYWx1ZSA9IG51bGw7XG4gIH1cbiAgLy8gVE9ETzogSWYgbm9kZVZhbHVlIHN0aWxsIG5vdCBzZXQsIGNoZWNrIGxheW91dCBmb3IgZGVmYXVsdCB2YWx1ZVxuICBjb25zdCBzY2hlbWFUeXBlOiBzdHJpbmcgfCBzdHJpbmdbXSA9IEpzb25Qb2ludGVyLmdldChzY2hlbWEsICcvdHlwZScpO1xuICBjb25zdCBjb250cm9sVHlwZSA9XG4gICAgKGhhc093bihzY2hlbWEsICdwcm9wZXJ0aWVzJykgfHwgaGFzT3duKHNjaGVtYSwgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJykpICYmXG4gICAgICBzY2hlbWFUeXBlID09PSAnb2JqZWN0JyA/ICdGb3JtR3JvdXAnIDpcbiAgICAoaGFzT3duKHNjaGVtYSwgJ2l0ZW1zJykgfHwgaGFzT3duKHNjaGVtYSwgJ2FkZGl0aW9uYWxJdGVtcycpKSAmJlxuICAgICAgc2NoZW1hVHlwZSA9PT0gJ2FycmF5JyA/ICdGb3JtQXJyYXknIDpcbiAgICAhc2NoZW1hVHlwZSAmJiBoYXNPd24oc2NoZW1hLCAnJHJlZicpID8gJyRyZWYnIDogJ0Zvcm1Db250cm9sJztcbiAgY29uc3Qgc2hvcnREYXRhUG9pbnRlciA9XG4gICAgcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhkYXRhUG9pbnRlciwganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcCk7XG4gIGlmICghanNmLmRhdGFNYXAuaGFzKHNob3J0RGF0YVBvaW50ZXIpKSB7XG4gICAganNmLmRhdGFNYXAuc2V0KHNob3J0RGF0YVBvaW50ZXIsIG5ldyBNYXAoKSk7XG4gIH1cbiAgY29uc3Qgbm9kZU9wdGlvbnMgPSBqc2YuZGF0YU1hcC5nZXQoc2hvcnREYXRhUG9pbnRlcik7XG4gIGlmICghbm9kZU9wdGlvbnMuaGFzKCdzY2hlbWFUeXBlJykpIHtcbiAgICBub2RlT3B0aW9ucy5zZXQoJ3NjaGVtYVBvaW50ZXInLCBzY2hlbWFQb2ludGVyKTtcbiAgICBub2RlT3B0aW9ucy5zZXQoJ3NjaGVtYVR5cGUnLCBzY2hlbWEudHlwZSk7XG4gICAgaWYgKHNjaGVtYS5mb3JtYXQpIHtcbiAgICAgIG5vZGVPcHRpb25zLnNldCgnc2NoZW1hRm9ybWF0Jywgc2NoZW1hLmZvcm1hdCk7XG4gICAgICBpZiAoIXNjaGVtYS50eXBlKSB7IG5vZGVPcHRpb25zLnNldCgnc2NoZW1hVHlwZScsICdzdHJpbmcnKTsgfVxuICAgIH1cbiAgICBpZiAoY29udHJvbFR5cGUpIHtcbiAgICAgIG5vZGVPcHRpb25zLnNldCgndGVtcGxhdGVQb2ludGVyJywgdGVtcGxhdGVQb2ludGVyKTtcbiAgICAgIG5vZGVPcHRpb25zLnNldCgndGVtcGxhdGVUeXBlJywgY29udHJvbFR5cGUpO1xuICAgIH1cbiAgfVxuICBsZXQgY29udHJvbHM6IGFueTtcbiAgY29uc3QgdmFsaWRhdG9ycyA9IGdldENvbnRyb2xWYWxpZGF0b3JzKHNjaGVtYSk7XG4gIHN3aXRjaCAoY29udHJvbFR5cGUpIHtcblxuICAgIGNhc2UgJ0Zvcm1Hcm91cCc6XG4gICAgICBjb250cm9scyA9IHt9O1xuICAgICAgaWYgKGhhc093bihzY2hlbWEsICd1aTpvcmRlcicpIHx8IGhhc093bihzY2hlbWEsICdwcm9wZXJ0aWVzJykpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHlLZXlzID0gc2NoZW1hWyd1aTpvcmRlciddIHx8IE9iamVjdC5rZXlzKHNjaGVtYS5wcm9wZXJ0aWVzKTtcbiAgICAgICAgaWYgKHByb3BlcnR5S2V5cy5pbmNsdWRlcygnKicpICYmICFoYXNPd24oc2NoZW1hLnByb3BlcnRpZXMsICcqJykpIHtcbiAgICAgICAgICBjb25zdCB1bm5hbWVkS2V5cyA9IE9iamVjdC5rZXlzKHNjaGVtYS5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgLmZpbHRlcihrZXkgPT4gIXByb3BlcnR5S2V5cy5pbmNsdWRlcyhrZXkpKTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gcHJvcGVydHlLZXlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAocHJvcGVydHlLZXlzW2ldID09PSAnKicpIHtcbiAgICAgICAgICAgICAgcHJvcGVydHlLZXlzLnNwbGljZShpLCAxLCAuLi51bm5hbWVkS2V5cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHByb3BlcnR5S2V5c1xuICAgICAgICAgIC5maWx0ZXIoa2V5ID0+IGhhc093bihzY2hlbWEucHJvcGVydGllcywga2V5KSB8fFxuICAgICAgICAgICAgaGFzT3duKHNjaGVtYSwgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJylcbiAgICAgICAgICApXG4gICAgICAgICAgLmZvckVhY2goa2V5ID0+IGNvbnRyb2xzW2tleV0gPSBidWlsZEZvcm1Hcm91cFRlbXBsYXRlKFxuICAgICAgICAgICAganNmLCBKc29uUG9pbnRlci5nZXQobm9kZVZhbHVlLCBbPHN0cmluZz5rZXldKSwgc2V0VmFsdWVzLFxuICAgICAgICAgICAgc2NoZW1hUG9pbnRlciArIChoYXNPd24oc2NoZW1hLnByb3BlcnRpZXMsIGtleSkgP1xuICAgICAgICAgICAgICAnL3Byb3BlcnRpZXMvJyArIGtleSA6ICcvYWRkaXRpb25hbFByb3BlcnRpZXMnXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgZGF0YVBvaW50ZXIgKyAnLycgKyBrZXksXG4gICAgICAgICAgICB0ZW1wbGF0ZVBvaW50ZXIgKyAnL2NvbnRyb2xzLycgKyBrZXlcbiAgICAgICAgICApKTtcbiAgICAgICAganNmLmZvcm1PcHRpb25zLmZpZWxkc1JlcXVpcmVkID0gc2V0UmVxdWlyZWRGaWVsZHMoc2NoZW1hLCBjb250cm9scyk7XG4gICAgICB9XG4gICAgICByZXR1cm4geyBjb250cm9sVHlwZSwgY29udHJvbHMsIHZhbGlkYXRvcnMgfTtcblxuICAgIGNhc2UgJ0Zvcm1BcnJheSc6XG4gICAgICBjb250cm9scyA9IFtdO1xuICAgICAgY29uc3QgbWluSXRlbXMgPVxuICAgICAgICBNYXRoLm1heChzY2hlbWEubWluSXRlbXMgfHwgMCwgbm9kZU9wdGlvbnMuZ2V0KCdtaW5JdGVtcycpIHx8IDApO1xuICAgICAgY29uc3QgbWF4SXRlbXMgPVxuICAgICAgICBNYXRoLm1pbihzY2hlbWEubWF4SXRlbXMgfHwgMTAwMCwgbm9kZU9wdGlvbnMuZ2V0KCdtYXhJdGVtcycpIHx8IDEwMDApO1xuICAgICAgbGV0IGFkZGl0aW9uYWxJdGVtc1BvaW50ZXI6IHN0cmluZyA9IG51bGw7XG4gICAgICBpZiAoaXNBcnJheShzY2hlbWEuaXRlbXMpKSB7IC8vICdpdGVtcycgaXMgYW4gYXJyYXkgPSB0dXBsZSBpdGVtc1xuICAgICAgICBjb25zdCB0dXBsZUl0ZW1zID0gbm9kZU9wdGlvbnMuZ2V0KCd0dXBsZUl0ZW1zJykgfHxcbiAgICAgICAgICAoaXNBcnJheShzY2hlbWEuaXRlbXMpID8gTWF0aC5taW4oc2NoZW1hLml0ZW1zLmxlbmd0aCwgbWF4SXRlbXMpIDogMCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHVwbGVJdGVtczsgaSsrKSB7XG4gICAgICAgICAgaWYgKGkgPCBtaW5JdGVtcykge1xuICAgICAgICAgICAgY29udHJvbHMucHVzaChidWlsZEZvcm1Hcm91cFRlbXBsYXRlKFxuICAgICAgICAgICAgICBqc2YsIGlzQXJyYXkobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZVtpXSA6IG5vZGVWYWx1ZSwgc2V0VmFsdWVzLFxuICAgICAgICAgICAgICBzY2hlbWFQb2ludGVyICsgJy9pdGVtcy8nICsgaSxcbiAgICAgICAgICAgICAgZGF0YVBvaW50ZXIgKyAnLycgKyBpLFxuICAgICAgICAgICAgICB0ZW1wbGF0ZVBvaW50ZXIgKyAnL2NvbnRyb2xzLycgKyBpXG4gICAgICAgICAgICApKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc2NoZW1hUmVmUG9pbnRlciA9IHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoXG4gICAgICAgICAgICAgIHNjaGVtYVBvaW50ZXIgKyAnL2l0ZW1zLycgKyBpLCBqc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgaXRlbVJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICAgICAgICBzaG9ydERhdGFQb2ludGVyICsgJy8nICsgaSwganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1SZWN1cnNpdmUgPSBpdGVtUmVmUG9pbnRlciAhPT0gc2hvcnREYXRhUG9pbnRlciArICcvJyArIGk7XG4gICAgICAgICAgICBpZiAoIWhhc093bihqc2YudGVtcGxhdGVSZWZMaWJyYXJ5LCBpdGVtUmVmUG9pbnRlcikpIHtcbiAgICAgICAgICAgICAganNmLnRlbXBsYXRlUmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0gPSBudWxsO1xuICAgICAgICAgICAgICBqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSA9IGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAganNmLCBudWxsLCBzZXRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgc2NoZW1hUmVmUG9pbnRlcixcbiAgICAgICAgICAgICAgICBpdGVtUmVmUG9pbnRlcixcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBvaW50ZXIgKyAnL2NvbnRyb2xzLycgKyBpXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250cm9scy5wdXNoKFxuICAgICAgICAgICAgICBpc0FycmF5KG5vZGVWYWx1ZSkgP1xuICAgICAgICAgICAgICAgIGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgICBqc2YsIG5vZGVWYWx1ZVtpXSwgc2V0VmFsdWVzLFxuICAgICAgICAgICAgICAgICAgc2NoZW1hUG9pbnRlciArICcvaXRlbXMvJyArIGksXG4gICAgICAgICAgICAgICAgICBkYXRhUG9pbnRlciArICcvJyArIGksXG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBvaW50ZXIgKyAnL2NvbnRyb2xzLycgKyBpXG4gICAgICAgICAgICAgICAgKSA6XG4gICAgICAgICAgICAgIGl0ZW1SZWN1cnNpdmUgP1xuICAgICAgICAgICAgICAgIG51bGwgOiBfLmNsb25lRGVlcChqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgJ2FkZGl0aW9uYWxJdGVtcycgaXMgYW4gb2JqZWN0ID0gYWRkaXRpb25hbCBsaXN0IGl0ZW1zIChhZnRlciB0dXBsZSBpdGVtcylcbiAgICAgICAgaWYgKHNjaGVtYS5pdGVtcy5sZW5ndGggPCBtYXhJdGVtcyAmJiBpc09iamVjdChzY2hlbWEuYWRkaXRpb25hbEl0ZW1zKSkge1xuICAgICAgICAgIGFkZGl0aW9uYWxJdGVtc1BvaW50ZXIgPSBzY2hlbWFQb2ludGVyICsgJy9hZGRpdGlvbmFsSXRlbXMnO1xuICAgICAgICB9XG5cbiAgICAgIC8vIElmICdpdGVtcycgaXMgYW4gb2JqZWN0ID0gbGlzdCBpdGVtcyBvbmx5IChubyB0dXBsZSBpdGVtcylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkZGl0aW9uYWxJdGVtc1BvaW50ZXIgPSBzY2hlbWFQb2ludGVyICsgJy9pdGVtcyc7XG4gICAgICB9XG5cbiAgICAgIGlmIChhZGRpdGlvbmFsSXRlbXNQb2ludGVyKSB7XG4gICAgICAgIGNvbnN0IHNjaGVtYVJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICAgIGFkZGl0aW9uYWxJdGVtc1BvaW50ZXIsIGpzZi5zY2hlbWFSZWN1cnNpdmVSZWZNYXBcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgaXRlbVJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICAgIHNob3J0RGF0YVBvaW50ZXIgKyAnLy0nLCBqc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCwganNmLmFycmF5TWFwXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGl0ZW1SZWN1cnNpdmUgPSBpdGVtUmVmUG9pbnRlciAhPT0gc2hvcnREYXRhUG9pbnRlciArICcvLSc7XG4gICAgICAgIGlmICghaGFzT3duKGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnksIGl0ZW1SZWZQb2ludGVyKSkge1xuICAgICAgICAgIGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdID0gbnVsbDtcbiAgICAgICAgICBqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSA9IGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gICAgICAgICAgICBqc2YsIG51bGwsIHNldFZhbHVlcyxcbiAgICAgICAgICAgIHNjaGVtYVJlZlBvaW50ZXIsXG4gICAgICAgICAgICBpdGVtUmVmUG9pbnRlcixcbiAgICAgICAgICAgIHRlbXBsYXRlUG9pbnRlciArICcvY29udHJvbHMvLSdcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnN0IGl0ZW1PcHRpb25zID0ganNmLmRhdGFNYXAuZ2V0KGl0ZW1SZWZQb2ludGVyKSB8fCBuZXcgTWFwKCk7XG4gICAgICAgIGNvbnN0IGl0ZW1PcHRpb25zID0gbm9kZU9wdGlvbnM7XG4gICAgICAgIGlmICghaXRlbVJlY3Vyc2l2ZSB8fCBoYXNPd24odmFsaWRhdG9ycywgJ3JlcXVpcmVkJykpIHtcbiAgICAgICAgICBjb25zdCBhcnJheUxlbmd0aCA9IE1hdGgubWluKE1hdGgubWF4KFxuICAgICAgICAgICAgaXRlbVJlY3Vyc2l2ZSA/IDAgOlxuICAgICAgICAgICAgICAoaXRlbU9wdGlvbnMuZ2V0KCd0dXBsZUl0ZW1zJykgKyBpdGVtT3B0aW9ucy5nZXQoJ2xpc3RJdGVtcycpKSB8fCAwLFxuICAgICAgICAgICAgaXNBcnJheShub2RlVmFsdWUpID8gbm9kZVZhbHVlLmxlbmd0aCA6IDBcbiAgICAgICAgICApLCBtYXhJdGVtcyk7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IGNvbnRyb2xzLmxlbmd0aDsgaSA8IGFycmF5TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnRyb2xzLnB1c2goXG4gICAgICAgICAgICAgIGlzQXJyYXkobm9kZVZhbHVlKSA/XG4gICAgICAgICAgICAgICAgYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAgIGpzZiwgbm9kZVZhbHVlW2ldLCBzZXRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgICBzY2hlbWFSZWZQb2ludGVyLFxuICAgICAgICAgICAgICAgICAgZGF0YVBvaW50ZXIgKyAnLy0nLFxuICAgICAgICAgICAgICAgICAgdGVtcGxhdGVQb2ludGVyICsgJy9jb250cm9scy8tJ1xuICAgICAgICAgICAgICAgICkgOlxuICAgICAgICAgICAgICAgIGl0ZW1SZWN1cnNpdmUgP1xuICAgICAgICAgICAgICAgICAgbnVsbCA6IF8uY2xvbmVEZWVwKGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGNvbnRyb2xUeXBlLCBjb250cm9scywgdmFsaWRhdG9ycyB9O1xuXG4gICAgY2FzZSAnJHJlZic6XG4gICAgICBjb25zdCBzY2hlbWFSZWYgPSBKc29uUG9pbnRlci5jb21waWxlKHNjaGVtYS4kcmVmKTtcbiAgICAgIGNvbnN0IGRhdGFSZWYgPSBKc29uUG9pbnRlci50b0RhdGFQb2ludGVyKHNjaGVtYVJlZiwgc2NoZW1hKTtcbiAgICAgIGNvbnN0IHJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICBkYXRhUmVmLCBqc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCwganNmLmFycmF5TWFwXG4gICAgICApO1xuICAgICAgaWYgKHJlZlBvaW50ZXIgJiYgIWhhc093bihqc2YudGVtcGxhdGVSZWZMaWJyYXJ5LCByZWZQb2ludGVyKSkge1xuICAgICAgICAvLyBTZXQgdG8gbnVsbCBmaXJzdCB0byBwcmV2ZW50IHJlY3Vyc2l2ZSByZWZlcmVuY2UgZnJvbSBjYXVzaW5nIGVuZGxlc3MgbG9vcFxuICAgICAgICBqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W3JlZlBvaW50ZXJdID0gbnVsbDtcbiAgICAgICAgY29uc3QgbmV3VGVtcGxhdGUgPSBidWlsZEZvcm1Hcm91cFRlbXBsYXRlKGpzZiwgc2V0VmFsdWVzLCBzZXRWYWx1ZXMsIHNjaGVtYVJlZik7XG4gICAgICAgIGlmIChuZXdUZW1wbGF0ZSkge1xuICAgICAgICAgIGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnlbcmVmUG9pbnRlcl0gPSBuZXdUZW1wbGF0ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUganNmLnRlbXBsYXRlUmVmTGlicmFyeVtyZWZQb2ludGVyXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICBjYXNlICdGb3JtQ29udHJvbCc6XG4gICAgICBjb25zdCB2YWx1ZSA9IHtcbiAgICAgICAgdmFsdWU6IHNldFZhbHVlcyAmJiBpc1ByaW1pdGl2ZShub2RlVmFsdWUpID8gbm9kZVZhbHVlIDogbnVsbCxcbiAgICAgICAgZGlzYWJsZWQ6IG5vZGVPcHRpb25zLmdldCgnZGlzYWJsZWQnKSB8fCBmYWxzZVxuICAgICAgfTtcbiAgICAgIHJldHVybiB7IGNvbnRyb2xUeXBlLCB2YWx1ZSwgdmFsaWRhdG9ycyB9O1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogJ2J1aWxkRm9ybUdyb3VwJyBmdW5jdGlvblxuICpcbiAqIC8vIHthbnl9IHRlbXBsYXRlIC1cbiAqIC8vIHtBYnN0cmFjdENvbnRyb2x9XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRm9ybUdyb3VwKHRlbXBsYXRlOiBhbnkpOiBBYnN0cmFjdENvbnRyb2wge1xuICBjb25zdCB2YWxpZGF0b3JGbnM6IFZhbGlkYXRvckZuW10gPSBbXTtcbiAgbGV0IHZhbGlkYXRvckZuOiBWYWxpZGF0b3JGbiA9IG51bGw7XG4gIGlmIChoYXNPd24odGVtcGxhdGUsICd2YWxpZGF0b3JzJykpIHtcbiAgICBmb3JFYWNoKHRlbXBsYXRlLnZhbGlkYXRvcnMsIChwYXJhbWV0ZXJzLCB2YWxpZGF0b3IpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgSnNvblZhbGlkYXRvcnNbdmFsaWRhdG9yXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YWxpZGF0b3JGbnMucHVzaChKc29uVmFsaWRhdG9yc1t2YWxpZGF0b3JdLmFwcGx5KG51bGwsIHBhcmFtZXRlcnMpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAodmFsaWRhdG9yRm5zLmxlbmd0aCAmJlxuICAgICAgaW5BcnJheSh0ZW1wbGF0ZS5jb250cm9sVHlwZSwgWydGb3JtR3JvdXAnLCAnRm9ybUFycmF5J10pXG4gICAgKSB7XG4gICAgICB2YWxpZGF0b3JGbiA9IHZhbGlkYXRvckZucy5sZW5ndGggPiAxID9cbiAgICAgICAgSnNvblZhbGlkYXRvcnMuY29tcG9zZSh2YWxpZGF0b3JGbnMpIDogdmFsaWRhdG9yRm5zWzBdO1xuICAgIH1cbiAgfVxuICBpZiAoaGFzT3duKHRlbXBsYXRlLCAnY29udHJvbFR5cGUnKSkge1xuICAgIHN3aXRjaCAodGVtcGxhdGUuY29udHJvbFR5cGUpIHtcbiAgICAgIGNhc2UgJ0Zvcm1Hcm91cCc6XG4gICAgICAgIGNvbnN0IGdyb3VwQ29udHJvbHM6IHsgW2tleTogc3RyaW5nXTogQWJzdHJhY3RDb250cm9sIH0gPSB7fTtcbiAgICAgICAgZm9yRWFjaCh0ZW1wbGF0ZS5jb250cm9scywgKGNvbnRyb2xzLCBrZXkpID0+IHtcbiAgICAgICAgICBjb25zdCBuZXdDb250cm9sOiBBYnN0cmFjdENvbnRyb2wgPSBidWlsZEZvcm1Hcm91cChjb250cm9scyk7XG4gICAgICAgICAgaWYgKG5ld0NvbnRyb2wpIHsgZ3JvdXBDb250cm9sc1trZXldID0gbmV3Q29udHJvbDsgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ldyBGb3JtR3JvdXAoZ3JvdXBDb250cm9scywgdmFsaWRhdG9yRm4pO1xuICAgICAgY2FzZSAnRm9ybUFycmF5JzpcbiAgICAgICAgcmV0dXJuIG5ldyBGb3JtQXJyYXkoXy5maWx0ZXIoXy5tYXAodGVtcGxhdGUuY29udHJvbHMsXG4gICAgICAgICAgY29udHJvbHMgPT4gYnVpbGRGb3JtR3JvdXAoY29udHJvbHMpXG4gICAgICAgICkpLCB2YWxpZGF0b3JGbik7XG4gICAgICBjYXNlICdGb3JtQ29udHJvbCc6XG4gICAgICAgIHJldHVybiBuZXcgRm9ybUNvbnRyb2wodGVtcGxhdGUudmFsdWUsIHZhbGlkYXRvckZucyk7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqICdtZXJnZVZhbHVlcycgZnVuY3Rpb25cbiAqXG4gKiAvLyAge2FueVtdfSAuLi52YWx1ZXNUb01lcmdlIC0gTXVsdGlwbGUgdmFsdWVzIHRvIG1lcmdlXG4gKiAvLyB7YW55fSAtIE1lcmdlZCB2YWx1ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVmFsdWVzKC4uLnZhbHVlc1RvTWVyZ2UpIHtcbiAgbGV0IG1lcmdlZFZhbHVlczogYW55ID0gbnVsbDtcbiAgZm9yIChjb25zdCBjdXJyZW50VmFsdWUgb2YgdmFsdWVzVG9NZXJnZSkge1xuICAgIGlmICghaXNFbXB0eShjdXJyZW50VmFsdWUpKSB7XG4gICAgICBpZiAodHlwZW9mIGN1cnJlbnRWYWx1ZSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgKGlzRW1wdHkobWVyZ2VkVmFsdWVzKSB8fCB0eXBlb2YgbWVyZ2VkVmFsdWVzICE9PSAnb2JqZWN0JylcbiAgICAgICkge1xuICAgICAgICBpZiAoaXNBcnJheShjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgICAgbWVyZ2VkVmFsdWVzID0gWyAuLi5jdXJyZW50VmFsdWUgXTtcbiAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdChjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgICAgbWVyZ2VkVmFsdWVzID0geyAuLi5jdXJyZW50VmFsdWUgfTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY3VycmVudFZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICBtZXJnZWRWYWx1ZXMgPSBjdXJyZW50VmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KG1lcmdlZFZhbHVlcykgJiYgaXNPYmplY3QoY3VycmVudFZhbHVlKSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKG1lcmdlZFZhbHVlcywgY3VycmVudFZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QobWVyZ2VkVmFsdWVzKSAmJiBpc0FycmF5KGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgY29uc3QgbmV3VmFsdWVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgbmV3VmFsdWVzLnB1c2gobWVyZ2VWYWx1ZXMobWVyZ2VkVmFsdWVzLCB2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIG1lcmdlZFZhbHVlcyA9IG5ld1ZhbHVlcztcbiAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShtZXJnZWRWYWx1ZXMpICYmIGlzT2JqZWN0KGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgY29uc3QgbmV3VmFsdWVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgbWVyZ2VkVmFsdWVzKSB7XG4gICAgICAgICAgbmV3VmFsdWVzLnB1c2gobWVyZ2VWYWx1ZXModmFsdWUsIGN1cnJlbnRWYWx1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIG1lcmdlZFZhbHVlcyA9IG5ld1ZhbHVlcztcbiAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShtZXJnZWRWYWx1ZXMpICYmIGlzQXJyYXkoY3VycmVudFZhbHVlKSkge1xuICAgICAgICBjb25zdCBuZXdWYWx1ZXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBNYXRoLm1heChtZXJnZWRWYWx1ZXMubGVuZ3RoLCBjdXJyZW50VmFsdWUubGVuZ3RoKTsgaSsrKSB7XG4gICAgICAgICAgaWYgKGkgPCBtZXJnZWRWYWx1ZXMubGVuZ3RoICYmIGkgPCBjdXJyZW50VmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBuZXdWYWx1ZXMucHVzaChtZXJnZVZhbHVlcyhtZXJnZWRWYWx1ZXNbaV0sIGN1cnJlbnRWYWx1ZVtpXSkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaSA8IG1lcmdlZFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG5ld1ZhbHVlcy5wdXNoKG1lcmdlZFZhbHVlc1tpXSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpIDwgY3VycmVudFZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgbmV3VmFsdWVzLnB1c2goY3VycmVudFZhbHVlW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbWVyZ2VkVmFsdWVzID0gbmV3VmFsdWVzO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbWVyZ2VkVmFsdWVzO1xufVxuXG4vKipcbiAqICdzZXRSZXF1aXJlZEZpZWxkcycgZnVuY3Rpb25cbiAqXG4gKiAvLyB7c2NoZW1hfSBzY2hlbWEgLSBKU09OIFNjaGVtYVxuICogLy8ge29iamVjdH0gZm9ybUNvbnRyb2xUZW1wbGF0ZSAtIEZvcm0gQ29udHJvbCBUZW1wbGF0ZSBvYmplY3RcbiAqIC8vIHtib29sZWFufSAtIHRydWUgaWYgYW55IGZpZWxkcyBoYXZlIGJlZW4gc2V0IHRvIHJlcXVpcmVkLCBmYWxzZSBpZiBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFJlcXVpcmVkRmllbGRzKHNjaGVtYTogYW55LCBmb3JtQ29udHJvbFRlbXBsYXRlOiBhbnkpOiBib29sZWFuIHtcbiAgbGV0IGZpZWxkc1JlcXVpcmVkID0gZmFsc2U7XG4gIGlmIChoYXNPd24oc2NoZW1hLCAncmVxdWlyZWQnKSAmJiAhaXNFbXB0eShzY2hlbWEucmVxdWlyZWQpKSB7XG4gICAgZmllbGRzUmVxdWlyZWQgPSB0cnVlO1xuICAgIGxldCByZXF1aXJlZEFycmF5ID0gaXNBcnJheShzY2hlbWEucmVxdWlyZWQpID8gc2NoZW1hLnJlcXVpcmVkIDogW3NjaGVtYS5yZXF1aXJlZF07XG4gICAgcmVxdWlyZWRBcnJheSA9IGZvckVhY2gocmVxdWlyZWRBcnJheSxcbiAgICAgIGtleSA9PiBKc29uUG9pbnRlci5zZXQoZm9ybUNvbnRyb2xUZW1wbGF0ZSwgJy8nICsga2V5ICsgJy92YWxpZGF0b3JzL3JlcXVpcmVkJywgW10pXG4gICAgKTtcbiAgfVxuICByZXR1cm4gZmllbGRzUmVxdWlyZWQ7XG5cbiAgLy8gVE9ETzogQWRkIHN1cHBvcnQgZm9yIHBhdHRlcm5Qcm9wZXJ0aWVzXG4gIC8vIGh0dHBzOi8vc3BhY2V0ZWxlc2NvcGUuZ2l0aHViLmlvL3VuZGVyc3RhbmRpbmctanNvbi1zY2hlbWEvcmVmZXJlbmNlL29iamVjdC5odG1sI3BhdHRlcm4tcHJvcGVydGllc1xufVxuXG4vKipcbiAqICdmb3JtYXRGb3JtRGF0YScgZnVuY3Rpb25cbiAqXG4gKiAvLyB7YW55fSBmb3JtRGF0YSAtIEFuZ3VsYXIgRm9ybUdyb3VwIGRhdGEgb2JqZWN0XG4gKiAvLyB7TWFwPHN0cmluZywgYW55Pn0gZGF0YU1hcCAtXG4gKiAvLyB7TWFwPHN0cmluZywgc3RyaW5nPn0gcmVjdXJzaXZlUmVmTWFwIC1cbiAqIC8vIHtNYXA8c3RyaW5nLCBudW1iZXI+fSBhcnJheU1hcCAtXG4gKiAvLyB7Ym9vbGVhbiA9IGZhbHNlfSBmaXhFcnJvcnMgLSBpZiBUUlVFLCB0cmllcyB0byBmaXggZGF0YVxuICogLy8ge2FueX0gLSBmb3JtYXR0ZWQgZGF0YSBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEZvcm1EYXRhKFxuICBmb3JtRGF0YTogYW55LCBkYXRhTWFwOiBNYXA8c3RyaW5nLCBhbnk+LFxuICByZWN1cnNpdmVSZWZNYXA6IE1hcDxzdHJpbmcsIHN0cmluZz4sIGFycmF5TWFwOiBNYXA8c3RyaW5nLCBudW1iZXI+LFxuICByZXR1cm5FbXB0eUZpZWxkcyA9IGZhbHNlLCBmaXhFcnJvcnMgPSBmYWxzZVxuKTogYW55IHtcbiAgaWYgKGZvcm1EYXRhID09PSBudWxsIHx8IHR5cGVvZiBmb3JtRGF0YSAhPT0gJ29iamVjdCcpIHsgcmV0dXJuIGZvcm1EYXRhOyB9XG4gIGNvbnN0IGZvcm1hdHRlZERhdGEgPSBpc0FycmF5KGZvcm1EYXRhKSA/IFtdIDoge307XG4gIEpzb25Qb2ludGVyLmZvckVhY2hEZWVwKGZvcm1EYXRhLCAodmFsdWUsIGRhdGFQb2ludGVyKSA9PiB7XG5cbiAgICAvLyBJZiByZXR1cm5FbXB0eUZpZWxkcyA9PT0gdHJ1ZSxcbiAgICAvLyBhZGQgZW1wdHkgYXJyYXlzIGFuZCBvYmplY3RzIHRvIGFsbCBhbGxvd2VkIGtleXNcbiAgICBpZiAocmV0dXJuRW1wdHlGaWVsZHMgJiYgaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIEpzb25Qb2ludGVyLnNldChmb3JtYXR0ZWREYXRhLCBkYXRhUG9pbnRlciwgW10pO1xuICAgIH0gZWxzZSBpZiAocmV0dXJuRW1wdHlGaWVsZHMgJiYgaXNPYmplY3QodmFsdWUpICYmICFpc0RhdGUodmFsdWUpKSB7XG4gICAgICBKc29uUG9pbnRlci5zZXQoZm9ybWF0dGVkRGF0YSwgZGF0YVBvaW50ZXIsIHt9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZ2VuZXJpY1BvaW50ZXIgPVxuICAgICAgICBKc29uUG9pbnRlci5oYXMoZGF0YU1hcCwgW2RhdGFQb2ludGVyLCAnc2NoZW1hVHlwZSddKSA/IGRhdGFQb2ludGVyIDpcbiAgICAgICAgICByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKGRhdGFQb2ludGVyLCByZWN1cnNpdmVSZWZNYXAsIGFycmF5TWFwKTtcbiAgICAgIGlmIChKc29uUG9pbnRlci5oYXMoZGF0YU1hcCwgW2dlbmVyaWNQb2ludGVyLCAnc2NoZW1hVHlwZSddKSkge1xuICAgICAgICBjb25zdCBzY2hlbWFUeXBlOiBTY2hlbWFQcmltaXRpdmVUeXBlIHwgU2NoZW1hUHJpbWl0aXZlVHlwZVtdID1cbiAgICAgICAgICBkYXRhTWFwLmdldChnZW5lcmljUG9pbnRlcikuZ2V0KCdzY2hlbWFUeXBlJyk7XG4gICAgICAgIGlmIChzY2hlbWFUeXBlID09PSAnbnVsbCcpIHtcbiAgICAgICAgICBKc29uUG9pbnRlci5zZXQoZm9ybWF0dGVkRGF0YSwgZGF0YVBvaW50ZXIsIG51bGwpO1xuICAgICAgICB9IGVsc2UgaWYgKChoYXNWYWx1ZSh2YWx1ZSkgfHwgcmV0dXJuRW1wdHlGaWVsZHMpICYmXG4gICAgICAgICAgaW5BcnJheShzY2hlbWFUeXBlLCBbJ3N0cmluZycsICdpbnRlZ2VyJywgJ251bWJlcicsICdib29sZWFuJ10pXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gKGZpeEVycm9ycyB8fCAodmFsdWUgPT09IG51bGwgJiYgcmV0dXJuRW1wdHlGaWVsZHMpKSA/XG4gICAgICAgICAgICB0b1NjaGVtYVR5cGUodmFsdWUsIHNjaGVtYVR5cGUpIDogdG9KYXZhU2NyaXB0VHlwZSh2YWx1ZSwgc2NoZW1hVHlwZSk7XG4gICAgICAgICAgaWYgKGlzRGVmaW5lZChuZXdWYWx1ZSkgfHwgcmV0dXJuRW1wdHlGaWVsZHMpIHtcbiAgICAgICAgICAgIEpzb25Qb2ludGVyLnNldChmb3JtYXR0ZWREYXRhLCBkYXRhUG9pbnRlciwgbmV3VmFsdWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAvLyBJZiByZXR1cm5FbXB0eUZpZWxkcyA9PT0gZmFsc2UsXG4gICAgICAgIC8vIG9ubHkgYWRkIGVtcHR5IGFycmF5cyBhbmQgb2JqZWN0cyB0byByZXF1aXJlZCBrZXlzXG4gICAgICAgIH0gZWxzZSBpZiAoc2NoZW1hVHlwZSA9PT0gJ29iamVjdCcgJiYgIXJldHVybkVtcHR5RmllbGRzKSB7XG4gICAgICAgICAgKGRhdGFNYXAuZ2V0KGdlbmVyaWNQb2ludGVyKS5nZXQoJ3JlcXVpcmVkJykgfHwgW10pLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGtleVNjaGVtYVR5cGUgPVxuICAgICAgICAgICAgICBkYXRhTWFwLmdldChgJHtnZW5lcmljUG9pbnRlcn0vJHtrZXl9YCkuZ2V0KCdzY2hlbWFUeXBlJyk7XG4gICAgICAgICAgICBpZiAoa2V5U2NoZW1hVHlwZSA9PT0gJ2FycmF5Jykge1xuICAgICAgICAgICAgICBKc29uUG9pbnRlci5zZXQoZm9ybWF0dGVkRGF0YSwgYCR7ZGF0YVBvaW50ZXJ9LyR7a2V5fWAsIFtdKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2NoZW1hVHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGAke2RhdGFQb2ludGVyfS8ke2tleX1gLCB7fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5pc2ggaW5jb21wbGV0ZSAnZGF0ZS10aW1lJyBlbnRyaWVzXG4gICAgICAgIGlmIChkYXRhTWFwLmdldChnZW5lcmljUG9pbnRlcikuZ2V0KCdzY2hlbWFGb3JtYXQnKSA9PT0gJ2RhdGUtdGltZScpIHtcbiAgICAgICAgICAvLyBcIjIwMDAtMDMtMTRUMDE6NTk6MjYuNTM1XCIgLT4gXCIyMDAwLTAzLTE0VDAxOjU5OjI2LjUzNVpcIiAoYWRkIFwiWlwiKVxuICAgICAgICAgIGlmICgvXlxcZFxcZFxcZFxcZC1bMC0xXVxcZC1bMC0zXVxcZFt0XFxzXVswLTJdXFxkOlswLTVdXFxkOlswLTVdXFxkKD86XFwuXFxkKyk/JC9pLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICBKc29uUG9pbnRlci5zZXQoZm9ybWF0dGVkRGF0YSwgZGF0YVBvaW50ZXIsIGAke3ZhbHVlfVpgKTtcbiAgICAgICAgICAvLyBcIjIwMDAtMDMtMTRUMDE6NTlcIiAtPiBcIjIwMDAtMDMtMTRUMDE6NTk6MDBaXCIgKGFkZCBcIjowMFpcIilcbiAgICAgICAgICB9IGVsc2UgaWYgKC9eXFxkXFxkXFxkXFxkLVswLTFdXFxkLVswLTNdXFxkW3RcXHNdWzAtMl1cXGQ6WzAtNV1cXGQkL2kudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIEpzb25Qb2ludGVyLnNldChmb3JtYXR0ZWREYXRhLCBkYXRhUG9pbnRlciwgYCR7dmFsdWV9OjAwWmApO1xuICAgICAgICAgIC8vIFwiMjAwMC0wMy0xNFwiIC0+IFwiMjAwMC0wMy0xNFQwMDowMDowMFpcIiAoYWRkIFwiVDAwOjAwOjAwWlwiKVxuICAgICAgICAgIH0gZWxzZSBpZiAoZml4RXJyb3JzICYmIC9eXFxkXFxkXFxkXFxkLVswLTFdXFxkLVswLTNdXFxkJC9pLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICBKc29uUG9pbnRlci5zZXQoZm9ybWF0dGVkRGF0YSwgZGF0YVBvaW50ZXIsIGAke3ZhbHVlfTowMDowMDowMFpgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JyB8fCBpc0RhdGUodmFsdWUpIHx8XG4gICAgICAgICh2YWx1ZSA9PT0gbnVsbCAmJiByZXR1cm5FbXB0eUZpZWxkcylcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdmb3JtYXRGb3JtRGF0YSBlcnJvcjogJyArXG4gICAgICAgICAgYFNjaGVtYSB0eXBlIG5vdCBmb3VuZCBmb3IgZm9ybSB2YWx1ZSBhdCAke2dlbmVyaWNQb2ludGVyfWApO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdkYXRhTWFwJywgZGF0YU1hcCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ3JlY3Vyc2l2ZVJlZk1hcCcsIHJlY3Vyc2l2ZVJlZk1hcCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ2dlbmVyaWNQb2ludGVyJywgZ2VuZXJpY1BvaW50ZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBmb3JtYXR0ZWREYXRhO1xufVxuXG4vKipcbiAqICdnZXRDb250cm9sJyBmdW5jdGlvblxuICpcbiAqIFVzZXMgYSBKU09OIFBvaW50ZXIgZm9yIGEgZGF0YSBvYmplY3QgdG8gcmV0cmlldmUgYSBjb250cm9sIGZyb21cbiAqIGFuIEFuZ3VsYXIgZm9ybUdyb3VwIG9yIGZvcm1Hcm91cCB0ZW1wbGF0ZS4gKE5vdGU6IHRob3VnaCBhIGZvcm1Hcm91cFxuICogdGVtcGxhdGUgaXMgbXVjaCBzaW1wbGVyLCBpdHMgYmFzaWMgc3RydWN0dXJlIGlzIGlkZW50aWFsIHRvIGEgZm9ybUdyb3VwKS5cbiAqXG4gKiBJZiB0aGUgb3B0aW9uYWwgdGhpcmQgcGFyYW1ldGVyICdyZXR1cm5Hcm91cCcgaXMgc2V0IHRvIFRSVUUsIHRoZSBncm91cFxuICogY29udGFpbmluZyB0aGUgY29udHJvbCBpcyByZXR1cm5lZCwgcmF0aGVyIHRoYW4gdGhlIGNvbnRyb2wgaXRzZWxmLlxuICpcbiAqIC8vIHtGb3JtR3JvdXB9IGZvcm1Hcm91cCAtIEFuZ3VsYXIgRm9ybUdyb3VwIHRvIGdldCB2YWx1ZSBmcm9tXG4gKiAvLyB7UG9pbnRlcn0gZGF0YVBvaW50ZXIgLSBKU09OIFBvaW50ZXIgKHN0cmluZyBvciBhcnJheSlcbiAqIC8vIHtib29sZWFuID0gZmFsc2V9IHJldHVybkdyb3VwIC0gSWYgdHJ1ZSwgcmV0dXJuIGdyb3VwIGNvbnRhaW5pbmcgY29udHJvbFxuICogLy8ge2dyb3VwfSAtIExvY2F0ZWQgdmFsdWUgKG9yIG51bGwsIGlmIG5vIGNvbnRyb2wgZm91bmQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250cm9sKFxuICBmb3JtR3JvdXA6IGFueSwgZGF0YVBvaW50ZXI6IFBvaW50ZXIsIHJldHVybkdyb3VwID0gZmFsc2Vcbik6IGFueSB7XG4gIGlmICghaXNPYmplY3QoZm9ybUdyb3VwKSB8fCAhSnNvblBvaW50ZXIuaXNKc29uUG9pbnRlcihkYXRhUG9pbnRlcikpIHtcbiAgICBpZiAoIUpzb25Qb2ludGVyLmlzSnNvblBvaW50ZXIoZGF0YVBvaW50ZXIpKSB7XG4gICAgICAvLyBJZiBkYXRhUG9pbnRlciBpbnB1dCBpcyBub3QgYSB2YWxpZCBKU09OIHBvaW50ZXIsIGNoZWNrIHRvXG4gICAgICAvLyBzZWUgaWYgaXQgaXMgaW5zdGVhZCBhIHZhbGlkIG9iamVjdCBwYXRoLCB1c2luZyBkb3Qgbm90YWlvblxuICAgICAgaWYgKHR5cGVvZiBkYXRhUG9pbnRlciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3QgZm9ybUNvbnRyb2wgPSBmb3JtR3JvdXAuZ2V0KGRhdGFQb2ludGVyKTtcbiAgICAgICAgaWYgKGZvcm1Db250cm9sKSB7IHJldHVybiBmb3JtQ29udHJvbDsgfVxuICAgICAgfVxuICAgICAgY29uc29sZS5lcnJvcihgZ2V0Q29udHJvbCBlcnJvcjogSW52YWxpZCBKU09OIFBvaW50ZXI6ICR7ZGF0YVBvaW50ZXJ9YCk7XG4gICAgfVxuICAgIGlmICghaXNPYmplY3QoZm9ybUdyb3VwKSkge1xuICAgICAgY29uc29sZS5lcnJvcihgZ2V0Q29udHJvbCBlcnJvcjogSW52YWxpZCBmb3JtR3JvdXA6ICR7Zm9ybUdyb3VwfWApO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBsZXQgZGF0YVBvaW50ZXJBcnJheSA9IEpzb25Qb2ludGVyLnBhcnNlKGRhdGFQb2ludGVyKTtcbiAgaWYgKHJldHVybkdyb3VwKSB7IGRhdGFQb2ludGVyQXJyYXkgPSBkYXRhUG9pbnRlckFycmF5LnNsaWNlKDAsIC0xKTsgfVxuXG4gIC8vIElmIGZvcm1Hcm91cCBpbnB1dCBpcyBhIHJlYWwgZm9ybUdyb3VwIChub3QgYSBmb3JtR3JvdXAgdGVtcGxhdGUpXG4gIC8vIHRyeSB1c2luZyBmb3JtR3JvdXAuZ2V0KCkgdG8gcmV0dXJuIHRoZSBjb250cm9sXG4gIGlmICh0eXBlb2YgZm9ybUdyb3VwLmdldCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIGRhdGFQb2ludGVyQXJyYXkuZXZlcnkoa2V5ID0+IGtleS5pbmRleE9mKCcuJykgPT09IC0xKVxuICApIHtcbiAgICBjb25zdCBmb3JtQ29udHJvbCA9IGZvcm1Hcm91cC5nZXQoZGF0YVBvaW50ZXJBcnJheS5qb2luKCcuJykpO1xuICAgIGlmIChmb3JtQ29udHJvbCkgeyByZXR1cm4gZm9ybUNvbnRyb2w7IH1cbiAgfVxuXG4gIC8vIElmIGZvcm1Hcm91cCBpbnB1dCBpcyBhIGZvcm1Hcm91cCB0ZW1wbGF0ZSxcbiAgLy8gb3IgZm9ybUdyb3VwLmdldCgpIGZhaWxlZCB0byByZXR1cm4gdGhlIGNvbnRyb2wsXG4gIC8vIHNlYXJjaCB0aGUgZm9ybUdyb3VwIG9iamVjdCBmb3IgZGF0YVBvaW50ZXIncyBjb250cm9sXG4gIGxldCBzdWJHcm91cCA9IGZvcm1Hcm91cDtcbiAgZm9yIChjb25zdCBrZXkgb2YgZGF0YVBvaW50ZXJBcnJheSkge1xuICAgIGlmIChoYXNPd24oc3ViR3JvdXAsICdjb250cm9scycpKSB7IHN1Ykdyb3VwID0gc3ViR3JvdXAuY29udHJvbHM7IH1cbiAgICBpZiAoaXNBcnJheShzdWJHcm91cCkgJiYgKGtleSA9PT0gJy0nKSkge1xuICAgICAgc3ViR3JvdXAgPSBzdWJHcm91cFtzdWJHcm91cC5sZW5ndGggLSAxXTtcbiAgICB9IGVsc2UgaWYgKGhhc093bihzdWJHcm91cCwga2V5KSkge1xuICAgICAgc3ViR3JvdXAgPSBzdWJHcm91cFtrZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBnZXRDb250cm9sIGVycm9yOiBVbmFibGUgdG8gZmluZCBcIiR7a2V5fVwiIGl0ZW0gaW4gRm9ybUdyb3VwLmApO1xuICAgICAgY29uc29sZS5lcnJvcihkYXRhUG9pbnRlcik7XG4gICAgICBjb25zb2xlLmVycm9yKGZvcm1Hcm91cCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIHJldHVybiBzdWJHcm91cDtcbn1cbiJdfQ==