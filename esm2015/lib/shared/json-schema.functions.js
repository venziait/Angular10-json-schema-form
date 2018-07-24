import * as _ from 'lodash';
import { getType, hasValue, inArray, isArray, isNumber, isObject, isString } from './validator.functions';
import { forEach, hasOwn, mergeFilteredObject } from './utility.functions';
import { mergeSchemas } from './merge-schemas.function';
import { JsonPointer } from './jsonpointer.functions';
/**
 * JSON Schema function library:
 *
 * buildSchemaFromLayout:   TODO: Write this function
 *
 * buildSchemaFromData:
 *
 * getFromSchema:
 *
 * removeRecursiveReferences:
 *
 * getInputType:
 *
 * checkInlineType:
 *
 * isInputRequired:
 *
 * updateInputOptions:
 *
 * getTitleMapFromOneOf:
 *
 * getControlValidators:
 *
 * resolveSchemaReferences:
 *
 * getSubSchema:
 *
 * combineAllOf:
 *
 * fixRequiredArrayProperties:
 */
/**
 * 'buildSchemaFromLayout' function
 *
 * TODO: Build a JSON Schema from a JSON Form layout
 *
 * //   layout - The JSON Form layout
 * //  - The new JSON Schema
 */
export function buildSchemaFromLayout(layout) {
    return;
    // let newSchema: any = { };
    // const walkLayout = (layoutItems: any[], callback: Function): any[] => {
    //   let returnArray: any[] = [];
    //   for (let layoutItem of layoutItems) {
    //     const returnItem: any = callback(layoutItem);
    //     if (returnItem) { returnArray = returnArray.concat(callback(layoutItem)); }
    //     if (layoutItem.items) {
    //       returnArray = returnArray.concat(walkLayout(layoutItem.items, callback));
    //     }
    //   }
    //   return returnArray;
    // };
    // walkLayout(layout, layoutItem => {
    //   let itemKey: string;
    //   if (typeof layoutItem === 'string') {
    //     itemKey = layoutItem;
    //   } else if (layoutItem.key) {
    //     itemKey = layoutItem.key;
    //   }
    //   if (!itemKey) { return; }
    //   //
    // });
}
/**
 * 'buildSchemaFromData' function
 *
 * Build a JSON Schema from a data object
 *
 * //   data - The data object
 * //  { boolean = false } requireAllFields - Require all fields?
 * //  { boolean = true } isRoot - is root
 * //  - The new JSON Schema
 */
export function buildSchemaFromData(data, requireAllFields = false, isRoot = true) {
    const newSchema = {};
    const getFieldType = (value) => {
        const fieldType = getType(value, 'strict');
        return { integer: 'number', null: 'string' }[fieldType] || fieldType;
    };
    const buildSubSchema = (value) => buildSchemaFromData(value, requireAllFields, false);
    if (isRoot) {
        newSchema.$schema = 'http://json-schema.org/draft-06/schema#';
    }
    newSchema.type = getFieldType(data);
    if (newSchema.type === 'object') {
        newSchema.properties = {};
        if (requireAllFields) {
            newSchema.required = [];
        }
        for (const key of Object.keys(data)) {
            newSchema.properties[key] = buildSubSchema(data[key]);
            if (requireAllFields) {
                newSchema.required.push(key);
            }
        }
    }
    else if (newSchema.type === 'array') {
        newSchema.items = data.map(buildSubSchema);
        // If all items are the same type, use an object for items instead of an array
        if ((new Set(data.map(getFieldType))).size === 1) {
            newSchema.items = newSchema.items.reduce((a, b) => (Object.assign({}, a, b)), {});
        }
        if (requireAllFields) {
            newSchema.minItems = 1;
        }
    }
    return newSchema;
}
/**
 * 'getFromSchema' function
 *
 * Uses a JSON Pointer for a value within a data object to retrieve
 * the schema for that value within schema for the data object.
 *
 * The optional third parameter can also be set to return something else:
 * 'schema' (default): the schema for the value indicated by the data pointer
 * 'parentSchema': the schema for the value's parent object or array
 * 'schemaPointer': a pointer to the value's schema within the object's schema
 * 'parentSchemaPointer': a pointer to the schema for the value's parent object or array
 *
 * //   schema - The schema to get the sub-schema from
 * //  { Pointer } dataPointer - JSON Pointer (string or array)
 * //  { string = 'schema' } returnType - what to return?
 * //  - The located sub-schema
 */
export function getFromSchema(schema, dataPointer, returnType = 'schema') {
    const dataPointerArray = JsonPointer.parse(dataPointer);
    if (dataPointerArray === null) {
        console.error(`getFromSchema error: Invalid JSON Pointer: ${dataPointer}`);
        return null;
    }
    let subSchema = schema;
    const schemaPointer = [];
    const length = dataPointerArray.length;
    if (returnType.slice(0, 6) === 'parent') {
        dataPointerArray.length--;
    }
    for (let i = 0; i < length; ++i) {
        const parentSchema = subSchema;
        const key = dataPointerArray[i];
        let subSchemaFound = false;
        if (typeof subSchema !== 'object') {
            console.error(`getFromSchema error: Unable to find "${key}" key in schema.`);
            console.error(schema);
            console.error(dataPointer);
            return null;
        }
        if (subSchema.type === 'array' && (!isNaN(key) || key === '-')) {
            if (hasOwn(subSchema, 'items')) {
                if (isObject(subSchema.items)) {
                    subSchemaFound = true;
                    subSchema = subSchema.items;
                    schemaPointer.push('items');
                }
                else if (isArray(subSchema.items)) {
                    if (!isNaN(key) && subSchema.items.length >= +key) {
                        subSchemaFound = true;
                        subSchema = subSchema.items[+key];
                        schemaPointer.push('items', key);
                    }
                }
            }
            if (!subSchemaFound && isObject(subSchema.additionalItems)) {
                subSchemaFound = true;
                subSchema = subSchema.additionalItems;
                schemaPointer.push('additionalItems');
            }
            else if (subSchema.additionalItems !== false) {
                subSchemaFound = true;
                subSchema = {};
                schemaPointer.push('additionalItems');
            }
        }
        else if (subSchema.type === 'object') {
            if (isObject(subSchema.properties) && hasOwn(subSchema.properties, key)) {
                subSchemaFound = true;
                subSchema = subSchema.properties[key];
                schemaPointer.push('properties', key);
            }
            else if (isObject(subSchema.additionalProperties)) {
                subSchemaFound = true;
                subSchema = subSchema.additionalProperties;
                schemaPointer.push('additionalProperties');
            }
            else if (subSchema.additionalProperties !== false) {
                subSchemaFound = true;
                subSchema = {};
                schemaPointer.push('additionalProperties');
            }
        }
        if (!subSchemaFound) {
            console.error(`getFromSchema error: Unable to find "${key}" item in schema.`);
            console.error(schema);
            console.error(dataPointer);
            return;
        }
    }
    return returnType.slice(-7) === 'Pointer' ? schemaPointer : subSchema;
}
/**
 * 'removeRecursiveReferences' function
 *
 * Checks a JSON Pointer against a map of recursive references and returns
 * a JSON Pointer to the shallowest equivalent location in the same object.
 *
 * Using this functions enables an object to be constructed with unlimited
 * recursion, while maintaing a fixed set of metadata, such as field data types.
 * The object can grow as large as it wants, and deeply recursed nodes can
 * just refer to the metadata for their shallow equivalents, instead of having
 * to add additional redundant metadata for each recursively added node.
 *
 * Example:
 *
 * pointer:         '/stuff/and/more/and/more/and/more/and/more/stuff'
 * recursiveRefMap: [['/stuff/and/more/and/more', '/stuff/and/more/']]
 * returned:        '/stuff/and/more/stuff'
 *
 * //  { Pointer } pointer -
 * //  { Map<string, string> } recursiveRefMap -
 * //  { Map<string, number> = new Map() } arrayMap - optional
 * // { string } -
 */
export function removeRecursiveReferences(pointer, recursiveRefMap, arrayMap = new Map()) {
    if (!pointer) {
        return '';
    }
    let genericPointer = JsonPointer.toGenericPointer(JsonPointer.compile(pointer), arrayMap);
    if (genericPointer.indexOf('/') === -1) {
        return genericPointer;
    }
    let possibleReferences = true;
    while (possibleReferences) {
        possibleReferences = false;
        recursiveRefMap.forEach((toPointer, fromPointer) => {
            if (JsonPointer.isSubPointer(toPointer, fromPointer)) {
                while (JsonPointer.isSubPointer(fromPointer, genericPointer, true)) {
                    genericPointer = JsonPointer.toGenericPointer(toPointer + genericPointer.slice(fromPointer.length), arrayMap);
                    possibleReferences = true;
                }
            }
        });
    }
    return genericPointer;
}
/**
 * 'getInputType' function
 *
 * //   schema
 * //  { any = null } layoutNode
 * // { string }
 */
export function getInputType(schema, layoutNode = null) {
    // x-schema-form = Angular Schema Form compatibility
    // widget & component = React Jsonschema Form compatibility
    const controlType = JsonPointer.getFirst([
        [schema, '/x-schema-form/type'],
        [schema, '/x-schema-form/widget/component'],
        [schema, '/x-schema-form/widget'],
        [schema, '/widget/component'],
        [schema, '/widget']
    ]);
    if (isString(controlType)) {
        return checkInlineType(controlType, schema, layoutNode);
    }
    let schemaType = schema.type;
    if (schemaType) {
        if (isArray(schemaType)) {
            schemaType =
                inArray('object', schemaType) && hasOwn(schema, 'properties') ? 'object' :
                    inArray('array', schemaType) && hasOwn(schema, 'items') ? 'array' :
                        inArray('array', schemaType) && hasOwn(schema, 'additionalItems') ? 'array' :
                            inArray('string', schemaType) ? 'string' :
                                inArray('number', schemaType) ? 'number' :
                                    inArray('integer', schemaType) ? 'integer' :
                                        inArray('boolean', schemaType) ? 'boolean' : 'unknown';
        }
        if (schemaType === 'boolean') {
            return 'checkbox';
        }
        if (schemaType === 'object') {
            if (hasOwn(schema, 'properties') || hasOwn(schema, 'additionalProperties')) {
                return 'section';
            }
            // TODO: Figure out how to handle additionalProperties
            if (hasOwn(schema, '$ref')) {
                return '$ref';
            }
        }
        if (schemaType === 'array') {
            const itemsObject = JsonPointer.getFirst([
                [schema, '/items'],
                [schema, '/additionalItems']
            ]) || {};
            return hasOwn(itemsObject, 'enum') && schema.maxItems !== 1 ?
                checkInlineType('checkboxes', schema, layoutNode) : 'array';
        }
        if (schemaType === 'null') {
            return 'none';
        }
        if (JsonPointer.has(layoutNode, '/options/titleMap') ||
            hasOwn(schema, 'enum') || getTitleMapFromOneOf(schema, null, true)) {
            return 'select';
        }
        if (schemaType === 'number' || schemaType === 'integer') {
            return (schemaType === 'integer' || hasOwn(schema, 'multipleOf')) &&
                hasOwn(schema, 'maximum') && hasOwn(schema, 'minimum') ? 'range' : schemaType;
        }
        if (schemaType === 'string') {
            return {
                'color': 'color',
                'date': 'date',
                'date-time': 'datetime-local',
                'email': 'email',
                'uri': 'url',
            }[schema.format] || 'text';
        }
    }
    if (hasOwn(schema, '$ref')) {
        return '$ref';
    }
    if (isArray(schema.oneOf) || isArray(schema.anyOf)) {
        return 'one-of';
    }
    console.error(`getInputType error: Unable to determine input type for ${schemaType}`);
    console.error('schema', schema);
    if (layoutNode) {
        console.error('layoutNode', layoutNode);
    }
    return 'none';
}
/**
 * 'checkInlineType' function
 *
 * Checks layout and schema nodes for 'inline: true', and converts
 * 'radios' or 'checkboxes' to 'radios-inline' or 'checkboxes-inline'
 *
 * //  { string } controlType -
 * //   schema -
 * //  { any = null } layoutNode -
 * // { string }
 */
export function checkInlineType(controlType, schema, layoutNode = null) {
    if (!isString(controlType) || (controlType.slice(0, 8) !== 'checkbox' && controlType.slice(0, 5) !== 'radio')) {
        return controlType;
    }
    if (JsonPointer.getFirst([
        [layoutNode, '/inline'],
        [layoutNode, '/options/inline'],
        [schema, '/inline'],
        [schema, '/x-schema-form/inline'],
        [schema, '/x-schema-form/options/inline'],
        [schema, '/x-schema-form/widget/inline'],
        [schema, '/x-schema-form/widget/component/inline'],
        [schema, '/x-schema-form/widget/component/options/inline'],
        [schema, '/widget/inline'],
        [schema, '/widget/component/inline'],
        [schema, '/widget/component/options/inline'],
    ]) === true) {
        return controlType.slice(0, 5) === 'radio' ?
            'radios-inline' : 'checkboxes-inline';
    }
    else {
        return controlType;
    }
}
/**
 * 'isInputRequired' function
 *
 * Checks a JSON Schema to see if an item is required
 *
 * //   schema - the schema to check
 * //  { string } schemaPointer - the pointer to the item to check
 * // { boolean } - true if the item is required, false if not
 */
export function isInputRequired(schema, schemaPointer) {
    if (!isObject(schema)) {
        console.error('isInputRequired error: Input schema must be an object.');
        return false;
    }
    const listPointerArray = JsonPointer.parse(schemaPointer);
    if (isArray(listPointerArray)) {
        if (!listPointerArray.length) {
            return schema.required === true;
        }
        const keyName = listPointerArray.pop();
        const nextToLastKey = listPointerArray[listPointerArray.length - 1];
        if (['properties', 'additionalProperties', 'patternProperties', 'items', 'additionalItems']
            .includes(nextToLastKey)) {
            listPointerArray.pop();
        }
        const parentSchema = JsonPointer.get(schema, listPointerArray) || {};
        if (isArray(parentSchema.required)) {
            return parentSchema.required.includes(keyName);
        }
        if (parentSchema.type === 'array') {
            return hasOwn(parentSchema, 'minItems') &&
                isNumber(keyName) &&
                +parentSchema.minItems > +keyName;
        }
    }
    return false;
}
/**
 * 'updateInputOptions' function
 *
 * //   layoutNode
 * //   schema
 * //   jsf
 * // { void }
 */
export function updateInputOptions(layoutNode, schema, jsf) {
    if (!isObject(layoutNode) || !isObject(layoutNode.options)) {
        return;
    }
    // Set all option values in layoutNode.options
    const newOptions = {};
    const fixUiKeys = key => key.slice(0, 3).toLowerCase() === 'ui:' ? key.slice(3) : key;
    mergeFilteredObject(newOptions, jsf.formOptions.defautWidgetOptions, [], fixUiKeys);
    [[JsonPointer.get(schema, '/ui:widget/options'), []],
        [JsonPointer.get(schema, '/ui:widget'), []],
        [schema, [
                'additionalProperties', 'additionalItems', 'properties', 'items',
                'required', 'type', 'x-schema-form', '$ref'
            ]],
        [JsonPointer.get(schema, '/x-schema-form/options'), []],
        [JsonPointer.get(schema, '/x-schema-form'), ['items', 'options']],
        [layoutNode, [
                '_id', '$ref', 'arrayItem', 'arrayItemType', 'dataPointer', 'dataType',
                'items', 'key', 'name', 'options', 'recursiveReference', 'type', 'widget'
            ]],
        [layoutNode.options, []],
    ].forEach(([object, excludeKeys]) => mergeFilteredObject(newOptions, object, excludeKeys, fixUiKeys));
    if (!hasOwn(newOptions, 'titleMap')) {
        let newTitleMap = null;
        newTitleMap = getTitleMapFromOneOf(schema, newOptions.flatList);
        if (newTitleMap) {
            newOptions.titleMap = newTitleMap;
        }
        if (!hasOwn(newOptions, 'titleMap') && !hasOwn(newOptions, 'enum') && hasOwn(schema, 'items')) {
            if (JsonPointer.has(schema, '/items/titleMap')) {
                newOptions.titleMap = schema.items.titleMap;
            }
            else if (JsonPointer.has(schema, '/items/enum')) {
                newOptions.enum = schema.items.enum;
                if (!hasOwn(newOptions, 'enumNames') && JsonPointer.has(schema, '/items/enumNames')) {
                    newOptions.enumNames = schema.items.enumNames;
                }
            }
            else if (JsonPointer.has(schema, '/items/oneOf')) {
                newTitleMap = getTitleMapFromOneOf(schema.items, newOptions.flatList);
                if (newTitleMap) {
                    newOptions.titleMap = newTitleMap;
                }
            }
        }
    }
    // If schema type is integer, enforce by setting multipleOf = 1
    if (schema.type === 'integer' && !hasValue(newOptions.multipleOf)) {
        newOptions.multipleOf = 1;
    }
    // Copy any typeahead word lists to options.typeahead.source
    if (JsonPointer.has(newOptions, '/autocomplete/source')) {
        newOptions.typeahead = newOptions.autocomplete;
    }
    else if (JsonPointer.has(newOptions, '/tagsinput/source')) {
        newOptions.typeahead = newOptions.tagsinput;
    }
    else if (JsonPointer.has(newOptions, '/tagsinput/typeahead/source')) {
        newOptions.typeahead = newOptions.tagsinput.typeahead;
    }
    layoutNode.options = newOptions;
}
/**
 * 'getTitleMapFromOneOf' function
 *
 * //  { schema } schema
 * //  { boolean = null } flatList
 * //  { boolean = false } validateOnly
 * // { validators }
 */
export function getTitleMapFromOneOf(schema = {}, flatList = null, validateOnly = false) {
    let titleMap = null;
    const oneOf = schema.oneOf || schema.anyOf || null;
    if (isArray(oneOf) && oneOf.every(item => item.title)) {
        if (oneOf.every(item => isArray(item.enum) && item.enum.length === 1)) {
            if (validateOnly) {
                return true;
            }
            titleMap = oneOf.map(item => ({ name: item.title, value: item.enum[0] }));
        }
        else if (oneOf.every(item => item.const)) {
            if (validateOnly) {
                return true;
            }
            titleMap = oneOf.map(item => ({ name: item.title, value: item.const }));
        }
        // if flatList !== false and some items have colons, make grouped map
        if (flatList !== false && (titleMap || [])
            .filter(title => ((title || {}).name || '').indexOf(': ')).length > 1) {
            // Split name on first colon to create grouped map (name -> group: name)
            const newTitleMap = titleMap.map(title => {
                const [group, name] = title.name.split(/: (.+)/);
                return group && name ? Object.assign({}, title, { group, name }) : title;
            });
            // If flatList === true or at least one group has multiple items, use grouped map
            if (flatList === true || newTitleMap.some((title, index) => index &&
                hasOwn(title, 'group') && title.group === newTitleMap[index - 1].group)) {
                titleMap = newTitleMap;
            }
        }
    }
    return validateOnly ? false : titleMap;
}
/**
 * 'getControlValidators' function
 *
 * //  schema
 * // { validators }
 */
export function getControlValidators(schema) {
    if (!isObject(schema)) {
        return null;
    }
    const validators = {};
    if (hasOwn(schema, 'type')) {
        switch (schema.type) {
            case 'string':
                forEach(['pattern', 'format', 'minLength', 'maxLength'], (prop) => {
                    if (hasOwn(schema, prop)) {
                        validators[prop] = [schema[prop]];
                    }
                });
                break;
            case 'number':
            case 'integer':
                forEach(['Minimum', 'Maximum'], (ucLimit) => {
                    const eLimit = 'exclusive' + ucLimit;
                    const limit = ucLimit.toLowerCase();
                    if (hasOwn(schema, limit)) {
                        const exclusive = hasOwn(schema, eLimit) && schema[eLimit] === true;
                        validators[limit] = [schema[limit], exclusive];
                    }
                });
                forEach(['multipleOf', 'type'], (prop) => {
                    if (hasOwn(schema, prop)) {
                        validators[prop] = [schema[prop]];
                    }
                });
                break;
            case 'object':
                forEach(['minProperties', 'maxProperties', 'dependencies'], (prop) => {
                    if (hasOwn(schema, prop)) {
                        validators[prop] = [schema[prop]];
                    }
                });
                break;
            case 'array':
                forEach(['minItems', 'maxItems', 'uniqueItems'], (prop) => {
                    if (hasOwn(schema, prop)) {
                        validators[prop] = [schema[prop]];
                    }
                });
                break;
        }
    }
    if (hasOwn(schema, 'enum')) {
        validators.enum = [schema.enum];
    }
    return validators;
}
/**
 * 'resolveSchemaReferences' function
 *
 * Find all $ref links in schema and save links and referenced schemas in
 * schemaRefLibrary, schemaRecursiveRefMap, and dataRecursiveRefMap
 *
 * //  schema
 * //  schemaRefLibrary
 * // { Map<string, string> } schemaRecursiveRefMap
 * // { Map<string, string> } dataRecursiveRefMap
 * // { Map<string, number> } arrayMap
 * //
 */
export function resolveSchemaReferences(schema, schemaRefLibrary, schemaRecursiveRefMap, dataRecursiveRefMap, arrayMap) {
    if (!isObject(schema)) {
        console.error('resolveSchemaReferences error: schema must be an object.');
        return;
    }
    const refLinks = new Set();
    const refMapSet = new Set();
    const refMap = new Map();
    const recursiveRefMap = new Map();
    const refLibrary = {};
    // Search schema for all $ref links, and build full refLibrary
    JsonPointer.forEachDeep(schema, (subSchema, subSchemaPointer) => {
        if (hasOwn(subSchema, '$ref') && isString(subSchema['$ref'])) {
            const refPointer = JsonPointer.compile(subSchema['$ref']);
            refLinks.add(refPointer);
            refMapSet.add(subSchemaPointer + '~~' + refPointer);
            refMap.set(subSchemaPointer, refPointer);
        }
    });
    refLinks.forEach(ref => refLibrary[ref] = getSubSchema(schema, ref));
    // Follow all ref links and save in refMapSet,
    // to find any multi-link recursive refernces
    let checkRefLinks = true;
    while (checkRefLinks) {
        checkRefLinks = false;
        Array.from(refMap).forEach(([fromRef1, toRef1]) => Array.from(refMap)
            .filter(([fromRef2, toRef2]) => JsonPointer.isSubPointer(toRef1, fromRef2, true) &&
            !JsonPointer.isSubPointer(toRef2, toRef1, true) &&
            !refMapSet.has(fromRef1 + fromRef2.slice(toRef1.length) + '~~' + toRef2))
            .forEach(([fromRef2, toRef2]) => {
            refMapSet.add(fromRef1 + fromRef2.slice(toRef1.length) + '~~' + toRef2);
            checkRefLinks = true;
        }));
    }
    // Build full recursiveRefMap
    // First pass - save all internally recursive refs from refMapSet
    Array.from(refMapSet)
        .map(refLink => refLink.split('~~'))
        .filter(([fromRef, toRef]) => JsonPointer.isSubPointer(toRef, fromRef))
        .forEach(([fromRef, toRef]) => recursiveRefMap.set(fromRef, toRef));
    // Second pass - create recursive versions of any other refs that link to recursive refs
    Array.from(refMap)
        .filter(([fromRef1, toRef1]) => Array.from(recursiveRefMap.keys())
        .every(fromRef2 => !JsonPointer.isSubPointer(fromRef1, fromRef2, true)))
        .forEach(([fromRef1, toRef1]) => Array.from(recursiveRefMap)
        .filter(([fromRef2, toRef2]) => !recursiveRefMap.has(fromRef1 + fromRef2.slice(toRef1.length)) &&
        JsonPointer.isSubPointer(toRef1, fromRef2, true) &&
        !JsonPointer.isSubPointer(toRef1, fromRef1, true))
        .forEach(([fromRef2, toRef2]) => recursiveRefMap.set(fromRef1 + fromRef2.slice(toRef1.length), fromRef1 + toRef2.slice(toRef1.length))));
    // Create compiled schema by replacing all non-recursive $ref links with
    // thieir linked schemas and, where possible, combining schemas in allOf arrays.
    let compiledSchema = Object.assign({}, schema);
    delete compiledSchema.definitions;
    compiledSchema =
        getSubSchema(compiledSchema, '', refLibrary, recursiveRefMap);
    // Make sure all remaining schema $refs are recursive, and build final
    // schemaRefLibrary, schemaRecursiveRefMap, dataRecursiveRefMap, & arrayMap
    JsonPointer.forEachDeep(compiledSchema, (subSchema, subSchemaPointer) => {
        if (isString(subSchema['$ref'])) {
            let refPointer = JsonPointer.compile(subSchema['$ref']);
            if (!JsonPointer.isSubPointer(refPointer, subSchemaPointer, true)) {
                refPointer = removeRecursiveReferences(subSchemaPointer, recursiveRefMap);
                JsonPointer.set(compiledSchema, subSchemaPointer, { $ref: `#${refPointer}` });
            }
            if (!hasOwn(schemaRefLibrary, 'refPointer')) {
                schemaRefLibrary[refPointer] = !refPointer.length ? compiledSchema :
                    getSubSchema(compiledSchema, refPointer, schemaRefLibrary, recursiveRefMap);
            }
            if (!schemaRecursiveRefMap.has(subSchemaPointer)) {
                schemaRecursiveRefMap.set(subSchemaPointer, refPointer);
            }
            const fromDataRef = JsonPointer.toDataPointer(subSchemaPointer, compiledSchema);
            if (!dataRecursiveRefMap.has(fromDataRef)) {
                const toDataRef = JsonPointer.toDataPointer(refPointer, compiledSchema);
                dataRecursiveRefMap.set(fromDataRef, toDataRef);
            }
        }
        if (subSchema.type === 'array' &&
            (hasOwn(subSchema, 'items') || hasOwn(subSchema, 'additionalItems'))) {
            const dataPointer = JsonPointer.toDataPointer(subSchemaPointer, compiledSchema);
            if (!arrayMap.has(dataPointer)) {
                const tupleItems = isArray(subSchema.items) ? subSchema.items.length : 0;
                arrayMap.set(dataPointer, tupleItems);
            }
        }
    }, true);
    return compiledSchema;
}
/**
 * 'getSubSchema' function
 *
 * //   schema
 * //  { Pointer } pointer
 * //  { object } schemaRefLibrary
 * //  { Map<string, string> } schemaRecursiveRefMap
 * //  { string[] = [] } usedPointers
 * //
 */
export function getSubSchema(schema, pointer, schemaRefLibrary = null, schemaRecursiveRefMap = null, usedPointers = []) {
    if (!schemaRefLibrary || !schemaRecursiveRefMap) {
        return JsonPointer.getCopy(schema, pointer);
    }
    if (typeof pointer !== 'string') {
        pointer = JsonPointer.compile(pointer);
    }
    usedPointers = [...usedPointers, pointer];
    let newSchema = null;
    if (pointer === '') {
        newSchema = _.cloneDeep(schema);
    }
    else {
        const shortPointer = removeRecursiveReferences(pointer, schemaRecursiveRefMap);
        if (shortPointer !== pointer) {
            usedPointers = [...usedPointers, shortPointer];
        }
        newSchema = JsonPointer.getFirstCopy([
            [schemaRefLibrary, [shortPointer]],
            [schema, pointer],
            [schema, shortPointer]
        ]);
    }
    return JsonPointer.forEachDeepCopy(newSchema, (subSchema, subPointer) => {
        if (isObject(subSchema)) {
            // Replace non-recursive $ref links with referenced schemas
            if (isString(subSchema.$ref)) {
                const refPointer = JsonPointer.compile(subSchema.$ref);
                if (refPointer.length && usedPointers.every(ptr => !JsonPointer.isSubPointer(refPointer, ptr, true))) {
                    const refSchema = getSubSchema(schema, refPointer, schemaRefLibrary, schemaRecursiveRefMap, usedPointers);
                    if (Object.keys(subSchema).length === 1) {
                        return refSchema;
                    }
                    else {
                        const extraKeys = Object.assign({}, subSchema);
                        delete extraKeys.$ref;
                        return mergeSchemas(refSchema, extraKeys);
                    }
                }
            }
            // TODO: Convert schemas with 'type' arrays to 'oneOf'
            // Combine allOf subSchemas
            if (isArray(subSchema.allOf)) {
                return combineAllOf(subSchema);
            }
            // Fix incorrectly placed array object required lists
            if (subSchema.type === 'array' && isArray(subSchema.required)) {
                return fixRequiredArrayProperties(subSchema);
            }
        }
        return subSchema;
    }, true, pointer);
}
/**
 * 'combineAllOf' function
 *
 * Attempt to convert an allOf schema object into
 * a non-allOf schema object with equivalent rules.
 *
 * //   schema - allOf schema object
 * //  - converted schema object
 */
export function combineAllOf(schema) {
    if (!isObject(schema) || !isArray(schema.allOf)) {
        return schema;
    }
    let mergedSchema = mergeSchemas(...schema.allOf);
    if (Object.keys(schema).length > 1) {
        const extraKeys = Object.assign({}, schema);
        delete extraKeys.allOf;
        mergedSchema = mergeSchemas(mergedSchema, extraKeys);
    }
    return mergedSchema;
}
/**
 * 'fixRequiredArrayProperties' function
 *
 * Fixes an incorrectly placed required list inside an array schema, by moving
 * it into items.properties or additionalItems.properties, where it belongs.
 *
 * //   schema - allOf schema object
 * //  - converted schema object
 */
export function fixRequiredArrayProperties(schema) {
    if (schema.type === 'array' && isArray(schema.required)) {
        const itemsObject = hasOwn(schema.items, 'properties') ? 'items' :
            hasOwn(schema.additionalItems, 'properties') ? 'additionalItems' : null;
        if (itemsObject && !hasOwn(schema[itemsObject], 'required') && (hasOwn(schema[itemsObject], 'additionalProperties') ||
            schema.required.every(key => hasOwn(schema[itemsObject].properties, key)))) {
            schema = _.cloneDeep(schema);
            schema[itemsObject].required = schema.required;
            delete schema.required;
        }
    }
    return schema;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEuZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjYtanNvbi1zY2hlbWEtZm9ybS8iLCJzb3VyY2VzIjpbImxpYi9zaGFyZWQvanNvbi1zY2hlbWEuZnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxDQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTVCLE9BQU8sRUFDTCxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQXVCLFFBQVEsRUFBRSxRQUFRLEVBQzVFLFFBQVEsRUFDVCxNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFDTCxPQUFPLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixFQUNyQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdCLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsV0FBVyxFQUFXLE1BQU0seUJBQXlCLENBQUM7QUFHL0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUVIOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLGdDQUFnQyxNQUFNO0lBQzFDLE1BQU0sQ0FBQztJQUNQLDRCQUE0QjtJQUM1QiwwRUFBMEU7SUFDMUUsaUNBQWlDO0lBQ2pDLDBDQUEwQztJQUMxQyxvREFBb0Q7SUFDcEQsa0ZBQWtGO0lBQ2xGLDhCQUE4QjtJQUM5QixrRkFBa0Y7SUFDbEYsUUFBUTtJQUNSLE1BQU07SUFDTix3QkFBd0I7SUFDeEIsS0FBSztJQUNMLHFDQUFxQztJQUNyQyx5QkFBeUI7SUFDekIsMENBQTBDO0lBQzFDLDRCQUE0QjtJQUM1QixpQ0FBaUM7SUFDakMsZ0NBQWdDO0lBQ2hDLE1BQU07SUFDTiw4QkFBOEI7SUFDOUIsT0FBTztJQUNQLE1BQU07QUFDUixDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSw4QkFDSixJQUFJLEVBQUUsZ0JBQWdCLEdBQUcsS0FBSyxFQUFFLE1BQU0sR0FBRyxJQUFJO0lBRTdDLE1BQU0sU0FBUyxHQUFRLEVBQUUsQ0FBQztJQUMxQixNQUFNLFlBQVksR0FBRyxDQUFDLEtBQVUsRUFBVSxFQUFFO1FBQzFDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDM0MsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDO0lBQ3ZFLENBQUMsQ0FBQztJQUNGLE1BQU0sY0FBYyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDL0IsbUJBQW1CLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFBQyxTQUFTLENBQUMsT0FBTyxHQUFHLHlDQUF5QyxDQUFDO0lBQUMsQ0FBQztJQUM5RSxTQUFTLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDaEMsU0FBUyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDMUIsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFBQyxDQUFDO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RELEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUFDLENBQUM7UUFDekQsQ0FBQztJQUNILENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMzQyw4RUFBOEU7UUFDOUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRCxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsbUJBQU0sQ0FBQyxFQUFLLENBQUMsRUFBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFBQyxTQUFTLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUFDLENBQUM7SUFDbkQsQ0FBQztJQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbkIsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0gsTUFBTSx3QkFBd0IsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEdBQUcsUUFBUTtJQUN0RSxNQUFNLGdCQUFnQixHQUFVLFdBQVcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDL0QsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5QixPQUFPLENBQUMsS0FBSyxDQUFDLDhDQUE4QyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzNFLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUN6QixNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7SUFDdkMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztRQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQUMsQ0FBQztJQUN2RSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQztRQUMvQixNQUFNLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7UUFDM0IsRUFBRSxDQUFDLENBQUMsT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNsQyxPQUFPLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxHQUFHLGtCQUFrQixDQUFDLENBQUM7WUFDN0UsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0QixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxPQUFPLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9ELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUIsY0FBYyxHQUFHLElBQUksQ0FBQztvQkFDdEIsU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7b0JBQzVCLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzlCLENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ2xELGNBQWMsR0FBRyxJQUFJLENBQUM7d0JBQ3RCLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2xDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNuQyxDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNELGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLFNBQVMsR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDO2dCQUN0QyxhQUFhLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLFNBQVMsR0FBRyxFQUFHLENBQUM7Z0JBQ2hCLGFBQWEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN4QyxDQUFDO1FBQ0gsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDdkMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hFLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLFNBQVMsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BELGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLFNBQVMsR0FBRyxTQUFTLENBQUMsb0JBQW9CLENBQUM7Z0JBQzNDLGFBQWEsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUM3QyxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixTQUFTLEdBQUcsRUFBRyxDQUFDO2dCQUNoQixhQUFhLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDN0MsQ0FBQztRQUNILENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDO1lBQzlFLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMzQixNQUFNLENBQUM7UUFDVCxDQUFDO0lBQ0gsQ0FBQztJQUNELE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUN4RSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSCxNQUFNLG9DQUNKLE9BQU8sRUFBRSxlQUFlLEVBQUUsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFO0lBRTlDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFBQyxDQUFDO0lBQzVCLElBQUksY0FBYyxHQUNoQixXQUFXLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN2RSxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7SUFBQyxDQUFDO0lBQ2xFLElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0lBQzlCLE9BQU8sa0JBQWtCLEVBQUUsQ0FBQztRQUMxQixrQkFBa0IsR0FBRyxLQUFLLENBQUM7UUFDM0IsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsRUFBRTtZQUNqRCxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELE9BQU8sV0FBVyxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQ25FLGNBQWMsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLENBQzNDLFNBQVMsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLENBQy9ELENBQUM7b0JBQ0Ysa0JBQWtCLEdBQUcsSUFBSSxDQUFDO2dCQUM1QixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNELE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFDeEIsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sdUJBQXVCLE1BQU0sRUFBRSxhQUFrQixJQUFJO0lBQ3pELG9EQUFvRDtJQUNwRCwyREFBMkQ7SUFDM0QsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztRQUN2QyxDQUFDLE1BQU0sRUFBRSxxQkFBcUIsQ0FBQztRQUMvQixDQUFDLE1BQU0sRUFBRSxpQ0FBaUMsQ0FBQztRQUMzQyxDQUFDLE1BQU0sRUFBRSx1QkFBdUIsQ0FBQztRQUNqQyxDQUFDLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQztRQUM3QixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUM7S0FDcEIsQ0FBQyxDQUFDO0lBQ0gsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUFDLENBQUM7SUFDdkYsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztJQUM3QixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ2YsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixVQUFVO2dCQUNSLE9BQU8sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ25FLE9BQU8sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDN0UsT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7Z0NBQzFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29DQUMxQyxPQUFPLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3Q0FDNUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDM0QsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUFDLENBQUM7UUFDcEQsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDNUIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzRSxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ25CLENBQUM7WUFDRCxzREFBc0Q7WUFDdEQsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7Z0JBQ3ZDLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztnQkFDbEIsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUM7YUFDN0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNULE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzNELGVBQWUsQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDaEUsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUFDLENBQUM7UUFDN0MsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsbUJBQW1CLENBQUM7WUFDbEQsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FDbkUsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQUMsQ0FBQztRQUN0QixFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssUUFBUSxJQUFJLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDL0QsTUFBTSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUNsRixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDO2dCQUNMLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixNQUFNLEVBQUUsTUFBTTtnQkFDZCxXQUFXLEVBQUUsZ0JBQWdCO2dCQUM3QixPQUFPLEVBQUUsT0FBTztnQkFDaEIsS0FBSyxFQUFFLEtBQUs7YUFDYixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUM7UUFDN0IsQ0FBQztJQUNILENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFBQyxDQUFDO0lBQzlDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQUMsQ0FBQztJQUN4RSxPQUFPLENBQUMsS0FBSyxDQUFDLDBEQUEwRCxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ3RGLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUFDLENBQUM7SUFDNUQsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sMEJBQTBCLFdBQVcsRUFBRSxNQUFNLEVBQUUsYUFBa0IsSUFBSTtJQUN6RSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUM1QixXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxVQUFVLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUM5RSxDQUFDLENBQUMsQ0FBQztRQUNGLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDckIsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUNELFdBQVcsQ0FBQyxRQUFRLENBQUM7UUFDbkIsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO1FBQ3ZCLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDO1FBQy9CLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQztRQUNuQixDQUFDLE1BQU0sRUFBRSx1QkFBdUIsQ0FBQztRQUNqQyxDQUFDLE1BQU0sRUFBRSwrQkFBK0IsQ0FBQztRQUN6QyxDQUFDLE1BQU0sRUFBRSw4QkFBOEIsQ0FBQztRQUN4QyxDQUFDLE1BQU0sRUFBRSx3Q0FBd0MsQ0FBQztRQUNsRCxDQUFDLE1BQU0sRUFBRSxnREFBZ0QsQ0FBQztRQUMxRCxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQztRQUMxQixDQUFDLE1BQU0sRUFBRSwwQkFBMEIsQ0FBQztRQUNwQyxDQUFDLE1BQU0sRUFBRSxrQ0FBa0MsQ0FBQztLQUM3QyxDQUFDLEtBQUssSUFDVCxDQUFDLENBQUMsQ0FBQztRQUNELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUMsQ0FBQztZQUMxQyxlQUFlLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDO0lBQzFDLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDckIsQ0FBQztBQUNILENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sMEJBQTBCLE1BQU0sRUFBRSxhQUFhO0lBQ25ELEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixPQUFPLENBQUMsS0FBSyxDQUFDLHdEQUF3RCxDQUFDLENBQUM7UUFDeEUsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxNQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDMUQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQztRQUFDLENBQUM7UUFDbEUsTUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkMsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLHNCQUFzQixFQUFFLG1CQUFtQixFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQzthQUN4RixRQUFRLENBQUMsYUFBYSxDQUN6QixDQUFDLENBQUMsQ0FBQztZQUNELGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUM7Z0JBQ3JDLFFBQVEsQ0FBQyxPQUFPLENBQUM7Z0JBQ2pCLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxDQUFDLE9BQU8sQ0FBQztRQUN0QyxDQUFDO0lBQ0gsQ0FBQztJQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sNkJBQTZCLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRztJQUN4RCxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQUMsQ0FBQztJQUV2RSw4Q0FBOEM7SUFDOUMsTUFBTSxVQUFVLEdBQVEsRUFBRyxDQUFDO0lBQzVCLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDdEYsbUJBQW1CLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3BGLENBQUUsQ0FBRSxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxFQUFFLEVBQUUsQ0FBRTtRQUNyRCxDQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBRTtRQUM3QyxDQUFFLE1BQU0sRUFBRTtnQkFDUixzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsT0FBTztnQkFDaEUsVUFBVSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsTUFBTTthQUM1QyxDQUFFO1FBQ0gsQ0FBRSxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSx3QkFBd0IsQ0FBQyxFQUFFLEVBQUUsQ0FBRTtRQUN6RCxDQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUU7UUFDbkUsQ0FBRSxVQUFVLEVBQUU7Z0JBQ1osS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxVQUFVO2dCQUN0RSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLFFBQVE7YUFDMUUsQ0FBRTtRQUNILENBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUU7S0FDM0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFFLE1BQU0sRUFBRSxXQUFXLENBQUUsRUFBRSxFQUFFLENBQ3BDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUNoRSxDQUFDO0lBQ0YsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQyxJQUFJLFdBQVcsR0FBUSxJQUFJLENBQUM7UUFDNUIsV0FBVyxHQUFHLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUFDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDO1FBQUMsQ0FBQztRQUN2RCxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlGLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxVQUFVLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQzlDLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxVQUFVLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNwQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BGLFVBQVUsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7Z0JBQ2hELENBQUM7WUFDSCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkQsV0FBVyxHQUFHLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN0RSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUFDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDO2dCQUFDLENBQUM7WUFDekQsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsK0RBQStEO0lBQy9ELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEUsVUFBVSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELDREQUE0RDtJQUM1RCxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxVQUFVLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7SUFDakQsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RCxVQUFVLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7SUFDOUMsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RSxVQUFVLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0lBQ3hELENBQUM7SUFFRCxVQUFVLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQztBQUNsQyxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sK0JBQ0osU0FBYyxFQUFFLEVBQUUsV0FBb0IsSUFBSSxFQUFFLFlBQVksR0FBRyxLQUFLO0lBRWhFLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztJQUNwQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO0lBQ25ELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEUsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQUMsQ0FBQztZQUNsQyxRQUFRLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUFDLENBQUM7WUFDbEMsUUFBUSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVELHFFQUFxRTtRQUNyRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQzthQUN2QyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FDdEUsQ0FBQyxDQUFDLENBQUM7WUFFRCx3RUFBd0U7WUFDeEUsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdkMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDakQsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxtQkFBTSxLQUFLLElBQUUsS0FBSyxFQUFFLElBQUksSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQzNELENBQUMsQ0FBQyxDQUFDO1lBRUgsaUZBQWlGO1lBQ2pGLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUs7Z0JBQy9ELE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FDdkUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0YsUUFBUSxHQUFHLFdBQVcsQ0FBQztZQUN6QixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUN6QyxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLCtCQUErQixNQUFNO0lBQ3pDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFBQyxDQUFDO0lBQ3ZDLE1BQU0sVUFBVSxHQUFRLEVBQUcsQ0FBQztJQUM1QixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwQixLQUFLLFFBQVE7Z0JBQ1gsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDaEUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQUMsQ0FBQztnQkFDbEUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsS0FBSyxDQUFDO1lBQ04sS0FBSyxRQUFRLENBQUM7WUFBQyxLQUFLLFNBQVM7Z0JBQzNCLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUMxQyxNQUFNLE1BQU0sR0FBRyxXQUFXLEdBQUcsT0FBTyxDQUFDO29CQUNyQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMxQixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLENBQUM7d0JBQ3BFLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDakQsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztnQkFDSCxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDdkMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQUMsQ0FBQztnQkFDbEUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsS0FBSyxDQUFDO1lBQ04sS0FBSyxRQUFRO2dCQUNYLE9BQU8sQ0FBQyxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsY0FBYyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDbkUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQUMsQ0FBQztnQkFDbEUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsS0FBSyxDQUFDO1lBQ04sS0FBSyxPQUFPO2dCQUNWLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsYUFBYSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDeEQsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQUMsQ0FBQztnQkFDbEUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsS0FBSyxDQUFDO1FBQ1IsQ0FBQztJQUNILENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQ2hFLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDcEIsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sa0NBQ0osTUFBTSxFQUFFLGdCQUFnQixFQUFFLHFCQUFxQixFQUFFLG1CQUFtQixFQUFFLFFBQVE7SUFFOUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sQ0FBQyxLQUFLLENBQUMsMERBQTBELENBQUMsQ0FBQztRQUMxRSxNQUFNLENBQUM7SUFDVCxDQUFDO0lBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUNuQyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0lBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBQ3pDLE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBQ2xELE1BQU0sVUFBVSxHQUFRLEVBQUUsQ0FBQztJQUUzQiw4REFBOEQ7SUFDOUQsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRTtRQUM5RCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMxRCxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pCLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDM0MsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFckUsOENBQThDO0lBQzlDLDZDQUE2QztJQUM3QyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUM7SUFDekIsT0FBTyxhQUFhLEVBQUUsQ0FBQztRQUNyQixhQUFhLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ2xFLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FDN0IsV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQztZQUNoRCxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUM7WUFDL0MsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQ3pFO2FBQ0EsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRTtZQUM5QixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDeEUsYUFBYSxHQUFHLElBQUksQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQztJQUVELDZCQUE2QjtJQUM3QixpRUFBaUU7SUFDakUsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7U0FDbEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDdEUsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEUsd0ZBQXdGO0lBQ3hGLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1NBQ2YsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQy9ELEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQ3hFO1NBQ0EsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO1NBQ3pELE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FDN0IsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5RCxXQUFXLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDO1FBQ2hELENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUNsRDtTQUNBLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUNsRCxRQUFRLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQ3hDLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDdkMsQ0FBQyxDQUNILENBQUM7SUFFSix3RUFBd0U7SUFDeEUsZ0ZBQWdGO0lBQ2hGLElBQUksY0FBYyxxQkFBUSxNQUFNLENBQUUsQ0FBQztJQUNuQyxPQUFPLGNBQWMsQ0FBQyxXQUFXLENBQUM7SUFDbEMsY0FBYztRQUNaLFlBQVksQ0FBQyxjQUFjLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUVoRSxzRUFBc0U7SUFDdEUsMkVBQTJFO0lBQzNFLFdBQVcsQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLEVBQUU7UUFDdEUsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3hELEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxVQUFVLEdBQUcseUJBQXlCLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLENBQUM7Z0JBQzFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2hGLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ2xFLFlBQVksQ0FBQyxjQUFjLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ2hGLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakQscUJBQXFCLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzFELENBQUM7WUFDRCxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2hGLEVBQUUsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUMsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQ3hFLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDbEQsQ0FBQztRQUNILENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFLLE9BQU87WUFDNUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FDckUsQ0FBQyxDQUFDLENBQUM7WUFDRCxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2hGLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pFLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3hDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1QsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUN4QixDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSx1QkFDSixNQUFNLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixHQUFHLElBQUksRUFDeEMsd0JBQTZDLElBQUksRUFBRSxlQUF5QixFQUFFO0lBRTlFLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7UUFDaEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQzVFLFlBQVksR0FBRyxDQUFFLEdBQUcsWUFBWSxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQzVDLElBQUksU0FBUyxHQUFRLElBQUksQ0FBQztJQUMxQixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuQixTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixNQUFNLFlBQVksR0FBRyx5QkFBeUIsQ0FBQyxPQUFPLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUMvRSxFQUFFLENBQUMsQ0FBQyxZQUFZLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztZQUFDLFlBQVksR0FBRyxDQUFFLEdBQUcsWUFBWSxFQUFFLFlBQVksQ0FBRSxDQUFDO1FBQUMsQ0FBQztRQUNuRixTQUFTLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQztZQUNuQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO1lBQ2pCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQztTQUN2QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxFQUFFO1FBQ3RFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFeEIsMkRBQTJEO1lBQzNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdkQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQ2hELENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUNqRCxDQUFDLENBQUMsQ0FBQztvQkFDRixNQUFNLFNBQVMsR0FBRyxZQUFZLENBQzVCLE1BQU0sRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUscUJBQXFCLEVBQUUsWUFBWSxDQUMxRSxDQUFDO29CQUNGLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hDLE1BQU0sQ0FBQyxTQUFTLENBQUM7b0JBQ25CLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ04sTUFBTSxTQUFTLHFCQUFRLFNBQVMsQ0FBRSxDQUFDO3dCQUNuQyxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUM7d0JBQ3RCLE1BQU0sQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUM1QyxDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1lBRUQsc0RBQXNEO1lBRXRELDJCQUEyQjtZQUMzQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUVqRSxxREFBcUQ7WUFDckQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxPQUFPLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlELE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvQyxDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDbkIsQ0FBQyxFQUFFLElBQUksRUFBVSxPQUFPLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLHVCQUF1QixNQUFNO0lBQ2pDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQUMsQ0FBQztJQUNuRSxJQUFJLFlBQVksR0FBRyxZQUFZLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakQsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxNQUFNLFNBQVMscUJBQVEsTUFBTSxDQUFFLENBQUM7UUFDaEMsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQ3ZCLFlBQVksR0FBRyxZQUFZLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3RCLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0scUNBQXFDLE1BQU07SUFDL0MsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzFFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FDN0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxzQkFBc0IsQ0FBQztZQUNuRCxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQzFFLENBQUMsQ0FBQyxDQUFDO1lBQ0YsTUFBTSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQy9DLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDO0lBQ0gsQ0FBQztJQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcblxuaW1wb3J0IHtcbiAgZ2V0VHlwZSwgaGFzVmFsdWUsIGluQXJyYXksIGlzQXJyYXksIGlzRW1wdHksIGlzRnVuY3Rpb24sIGlzTnVtYmVyLCBpc09iamVjdCxcbiAgaXNTdHJpbmdcbn0gZnJvbSAnLi92YWxpZGF0b3IuZnVuY3Rpb25zJztcbmltcG9ydCB7XG4gIGZvckVhY2gsIGhhc093biwgbWVyZ2VGaWx0ZXJlZE9iamVjdCwgdW5pcXVlSXRlbXMsIGNvbW1vbkl0ZW1zXG59IGZyb20gJy4vdXRpbGl0eS5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgbWVyZ2VTY2hlbWFzIH0gZnJvbSAnLi9tZXJnZS1zY2hlbWFzLmZ1bmN0aW9uJztcbmltcG9ydCB7IEpzb25Qb2ludGVyLCBQb2ludGVyIH0gZnJvbSAnLi9qc29ucG9pbnRlci5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgSnNvblZhbGlkYXRvcnMgfSBmcm9tICcuL2pzb24udmFsaWRhdG9ycyc7XG5cbi8qKlxuICogSlNPTiBTY2hlbWEgZnVuY3Rpb24gbGlicmFyeTpcbiAqXG4gKiBidWlsZFNjaGVtYUZyb21MYXlvdXQ6ICAgVE9ETzogV3JpdGUgdGhpcyBmdW5jdGlvblxuICpcbiAqIGJ1aWxkU2NoZW1hRnJvbURhdGE6XG4gKlxuICogZ2V0RnJvbVNjaGVtYTpcbiAqXG4gKiByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzOlxuICpcbiAqIGdldElucHV0VHlwZTpcbiAqXG4gKiBjaGVja0lubGluZVR5cGU6XG4gKlxuICogaXNJbnB1dFJlcXVpcmVkOlxuICpcbiAqIHVwZGF0ZUlucHV0T3B0aW9uczpcbiAqXG4gKiBnZXRUaXRsZU1hcEZyb21PbmVPZjpcbiAqXG4gKiBnZXRDb250cm9sVmFsaWRhdG9yczpcbiAqXG4gKiByZXNvbHZlU2NoZW1hUmVmZXJlbmNlczpcbiAqXG4gKiBnZXRTdWJTY2hlbWE6XG4gKlxuICogY29tYmluZUFsbE9mOlxuICpcbiAqIGZpeFJlcXVpcmVkQXJyYXlQcm9wZXJ0aWVzOlxuICovXG5cbi8qKlxuICogJ2J1aWxkU2NoZW1hRnJvbUxheW91dCcgZnVuY3Rpb25cbiAqXG4gKiBUT0RPOiBCdWlsZCBhIEpTT04gU2NoZW1hIGZyb20gYSBKU09OIEZvcm0gbGF5b3V0XG4gKlxuICogLy8gICBsYXlvdXQgLSBUaGUgSlNPTiBGb3JtIGxheW91dFxuICogLy8gIC0gVGhlIG5ldyBKU09OIFNjaGVtYVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRTY2hlbWFGcm9tTGF5b3V0KGxheW91dCkge1xuICByZXR1cm47XG4gIC8vIGxldCBuZXdTY2hlbWE6IGFueSA9IHsgfTtcbiAgLy8gY29uc3Qgd2Fsa0xheW91dCA9IChsYXlvdXRJdGVtczogYW55W10sIGNhbGxiYWNrOiBGdW5jdGlvbik6IGFueVtdID0+IHtcbiAgLy8gICBsZXQgcmV0dXJuQXJyYXk6IGFueVtdID0gW107XG4gIC8vICAgZm9yIChsZXQgbGF5b3V0SXRlbSBvZiBsYXlvdXRJdGVtcykge1xuICAvLyAgICAgY29uc3QgcmV0dXJuSXRlbTogYW55ID0gY2FsbGJhY2sobGF5b3V0SXRlbSk7XG4gIC8vICAgICBpZiAocmV0dXJuSXRlbSkgeyByZXR1cm5BcnJheSA9IHJldHVybkFycmF5LmNvbmNhdChjYWxsYmFjayhsYXlvdXRJdGVtKSk7IH1cbiAgLy8gICAgIGlmIChsYXlvdXRJdGVtLml0ZW1zKSB7XG4gIC8vICAgICAgIHJldHVybkFycmF5ID0gcmV0dXJuQXJyYXkuY29uY2F0KHdhbGtMYXlvdXQobGF5b3V0SXRlbS5pdGVtcywgY2FsbGJhY2spKTtcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8vICAgcmV0dXJuIHJldHVybkFycmF5O1xuICAvLyB9O1xuICAvLyB3YWxrTGF5b3V0KGxheW91dCwgbGF5b3V0SXRlbSA9PiB7XG4gIC8vICAgbGV0IGl0ZW1LZXk6IHN0cmluZztcbiAgLy8gICBpZiAodHlwZW9mIGxheW91dEl0ZW0gPT09ICdzdHJpbmcnKSB7XG4gIC8vICAgICBpdGVtS2V5ID0gbGF5b3V0SXRlbTtcbiAgLy8gICB9IGVsc2UgaWYgKGxheW91dEl0ZW0ua2V5KSB7XG4gIC8vICAgICBpdGVtS2V5ID0gbGF5b3V0SXRlbS5rZXk7XG4gIC8vICAgfVxuICAvLyAgIGlmICghaXRlbUtleSkgeyByZXR1cm47IH1cbiAgLy8gICAvL1xuICAvLyB9KTtcbn1cblxuLyoqXG4gKiAnYnVpbGRTY2hlbWFGcm9tRGF0YScgZnVuY3Rpb25cbiAqXG4gKiBCdWlsZCBhIEpTT04gU2NoZW1hIGZyb20gYSBkYXRhIG9iamVjdFxuICpcbiAqIC8vICAgZGF0YSAtIFRoZSBkYXRhIG9iamVjdFxuICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gcmVxdWlyZUFsbEZpZWxkcyAtIFJlcXVpcmUgYWxsIGZpZWxkcz9cbiAqIC8vICB7IGJvb2xlYW4gPSB0cnVlIH0gaXNSb290IC0gaXMgcm9vdFxuICogLy8gIC0gVGhlIG5ldyBKU09OIFNjaGVtYVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRTY2hlbWFGcm9tRGF0YShcbiAgZGF0YSwgcmVxdWlyZUFsbEZpZWxkcyA9IGZhbHNlLCBpc1Jvb3QgPSB0cnVlXG4pIHtcbiAgY29uc3QgbmV3U2NoZW1hOiBhbnkgPSB7fTtcbiAgY29uc3QgZ2V0RmllbGRUeXBlID0gKHZhbHVlOiBhbnkpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IGZpZWxkVHlwZSA9IGdldFR5cGUodmFsdWUsICdzdHJpY3QnKTtcbiAgICByZXR1cm4geyBpbnRlZ2VyOiAnbnVtYmVyJywgbnVsbDogJ3N0cmluZycgfVtmaWVsZFR5cGVdIHx8IGZpZWxkVHlwZTtcbiAgfTtcbiAgY29uc3QgYnVpbGRTdWJTY2hlbWEgPSAodmFsdWUpID0+XG4gICAgYnVpbGRTY2hlbWFGcm9tRGF0YSh2YWx1ZSwgcmVxdWlyZUFsbEZpZWxkcywgZmFsc2UpO1xuICBpZiAoaXNSb290KSB7IG5ld1NjaGVtYS4kc2NoZW1hID0gJ2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDYvc2NoZW1hIyc7IH1cbiAgbmV3U2NoZW1hLnR5cGUgPSBnZXRGaWVsZFR5cGUoZGF0YSk7XG4gIGlmIChuZXdTY2hlbWEudHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBuZXdTY2hlbWEucHJvcGVydGllcyA9IHt9O1xuICAgIGlmIChyZXF1aXJlQWxsRmllbGRzKSB7IG5ld1NjaGVtYS5yZXF1aXJlZCA9IFtdOyB9XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZGF0YSkpIHtcbiAgICAgIG5ld1NjaGVtYS5wcm9wZXJ0aWVzW2tleV0gPSBidWlsZFN1YlNjaGVtYShkYXRhW2tleV0pO1xuICAgICAgaWYgKHJlcXVpcmVBbGxGaWVsZHMpIHsgbmV3U2NoZW1hLnJlcXVpcmVkLnB1c2goa2V5KTsgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChuZXdTY2hlbWEudHlwZSA9PT0gJ2FycmF5Jykge1xuICAgIG5ld1NjaGVtYS5pdGVtcyA9IGRhdGEubWFwKGJ1aWxkU3ViU2NoZW1hKTtcbiAgICAvLyBJZiBhbGwgaXRlbXMgYXJlIHRoZSBzYW1lIHR5cGUsIHVzZSBhbiBvYmplY3QgZm9yIGl0ZW1zIGluc3RlYWQgb2YgYW4gYXJyYXlcbiAgICBpZiAoKG5ldyBTZXQoZGF0YS5tYXAoZ2V0RmllbGRUeXBlKSkpLnNpemUgPT09IDEpIHtcbiAgICAgIG5ld1NjaGVtYS5pdGVtcyA9IG5ld1NjaGVtYS5pdGVtcy5yZWR1Y2UoKGEsIGIpID0+ICh7IC4uLmEsIC4uLmIgfSksIHt9KTtcbiAgICB9XG4gICAgaWYgKHJlcXVpcmVBbGxGaWVsZHMpIHsgbmV3U2NoZW1hLm1pbkl0ZW1zID0gMTsgfVxuICB9XG4gIHJldHVybiBuZXdTY2hlbWE7XG59XG5cbi8qKlxuICogJ2dldEZyb21TY2hlbWEnIGZ1bmN0aW9uXG4gKlxuICogVXNlcyBhIEpTT04gUG9pbnRlciBmb3IgYSB2YWx1ZSB3aXRoaW4gYSBkYXRhIG9iamVjdCB0byByZXRyaWV2ZVxuICogdGhlIHNjaGVtYSBmb3IgdGhhdCB2YWx1ZSB3aXRoaW4gc2NoZW1hIGZvciB0aGUgZGF0YSBvYmplY3QuXG4gKlxuICogVGhlIG9wdGlvbmFsIHRoaXJkIHBhcmFtZXRlciBjYW4gYWxzbyBiZSBzZXQgdG8gcmV0dXJuIHNvbWV0aGluZyBlbHNlOlxuICogJ3NjaGVtYScgKGRlZmF1bHQpOiB0aGUgc2NoZW1hIGZvciB0aGUgdmFsdWUgaW5kaWNhdGVkIGJ5IHRoZSBkYXRhIHBvaW50ZXJcbiAqICdwYXJlbnRTY2hlbWEnOiB0aGUgc2NoZW1hIGZvciB0aGUgdmFsdWUncyBwYXJlbnQgb2JqZWN0IG9yIGFycmF5XG4gKiAnc2NoZW1hUG9pbnRlcic6IGEgcG9pbnRlciB0byB0aGUgdmFsdWUncyBzY2hlbWEgd2l0aGluIHRoZSBvYmplY3QncyBzY2hlbWFcbiAqICdwYXJlbnRTY2hlbWFQb2ludGVyJzogYSBwb2ludGVyIHRvIHRoZSBzY2hlbWEgZm9yIHRoZSB2YWx1ZSdzIHBhcmVudCBvYmplY3Qgb3IgYXJyYXlcbiAqXG4gKiAvLyAgIHNjaGVtYSAtIFRoZSBzY2hlbWEgdG8gZ2V0IHRoZSBzdWItc2NoZW1hIGZyb21cbiAqIC8vICB7IFBvaW50ZXIgfSBkYXRhUG9pbnRlciAtIEpTT04gUG9pbnRlciAoc3RyaW5nIG9yIGFycmF5KVxuICogLy8gIHsgc3RyaW5nID0gJ3NjaGVtYScgfSByZXR1cm5UeXBlIC0gd2hhdCB0byByZXR1cm4/XG4gKiAvLyAgLSBUaGUgbG9jYXRlZCBzdWItc2NoZW1hXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGcm9tU2NoZW1hKHNjaGVtYSwgZGF0YVBvaW50ZXIsIHJldHVyblR5cGUgPSAnc2NoZW1hJykge1xuICBjb25zdCBkYXRhUG9pbnRlckFycmF5OiBhbnlbXSA9IEpzb25Qb2ludGVyLnBhcnNlKGRhdGFQb2ludGVyKTtcbiAgaWYgKGRhdGFQb2ludGVyQXJyYXkgPT09IG51bGwpIHtcbiAgICBjb25zb2xlLmVycm9yKGBnZXRGcm9tU2NoZW1hIGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlcjogJHtkYXRhUG9pbnRlcn1gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBsZXQgc3ViU2NoZW1hID0gc2NoZW1hO1xuICBjb25zdCBzY2hlbWFQb2ludGVyID0gW107XG4gIGNvbnN0IGxlbmd0aCA9IGRhdGFQb2ludGVyQXJyYXkubGVuZ3RoO1xuICBpZiAocmV0dXJuVHlwZS5zbGljZSgwLCA2KSA9PT0gJ3BhcmVudCcpIHsgZGF0YVBvaW50ZXJBcnJheS5sZW5ndGgtLTsgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgY29uc3QgcGFyZW50U2NoZW1hID0gc3ViU2NoZW1hO1xuICAgIGNvbnN0IGtleSA9IGRhdGFQb2ludGVyQXJyYXlbaV07XG4gICAgbGV0IHN1YlNjaGVtYUZvdW5kID0gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiBzdWJTY2hlbWEgIT09ICdvYmplY3QnKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBnZXRGcm9tU2NoZW1hIGVycm9yOiBVbmFibGUgdG8gZmluZCBcIiR7a2V5fVwiIGtleSBpbiBzY2hlbWEuYCk7XG4gICAgICBjb25zb2xlLmVycm9yKHNjaGVtYSk7XG4gICAgICBjb25zb2xlLmVycm9yKGRhdGFQb2ludGVyKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoc3ViU2NoZW1hLnR5cGUgPT09ICdhcnJheScgJiYgKCFpc05hTihrZXkpIHx8IGtleSA9PT0gJy0nKSkge1xuICAgICAgaWYgKGhhc093bihzdWJTY2hlbWEsICdpdGVtcycpKSB7XG4gICAgICAgIGlmIChpc09iamVjdChzdWJTY2hlbWEuaXRlbXMpKSB7XG4gICAgICAgICAgc3ViU2NoZW1hRm91bmQgPSB0cnVlO1xuICAgICAgICAgIHN1YlNjaGVtYSA9IHN1YlNjaGVtYS5pdGVtcztcbiAgICAgICAgICBzY2hlbWFQb2ludGVyLnB1c2goJ2l0ZW1zJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShzdWJTY2hlbWEuaXRlbXMpKSB7XG4gICAgICAgICAgaWYgKCFpc05hTihrZXkpICYmIHN1YlNjaGVtYS5pdGVtcy5sZW5ndGggPj0gK2tleSkge1xuICAgICAgICAgICAgc3ViU2NoZW1hRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgc3ViU2NoZW1hID0gc3ViU2NoZW1hLml0ZW1zWytrZXldO1xuICAgICAgICAgICAgc2NoZW1hUG9pbnRlci5wdXNoKCdpdGVtcycsIGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIXN1YlNjaGVtYUZvdW5kICYmIGlzT2JqZWN0KHN1YlNjaGVtYS5hZGRpdGlvbmFsSXRlbXMpKSB7XG4gICAgICAgIHN1YlNjaGVtYUZvdW5kID0gdHJ1ZTtcbiAgICAgICAgc3ViU2NoZW1hID0gc3ViU2NoZW1hLmFkZGl0aW9uYWxJdGVtcztcbiAgICAgICAgc2NoZW1hUG9pbnRlci5wdXNoKCdhZGRpdGlvbmFsSXRlbXMnKTtcbiAgICAgIH0gZWxzZSBpZiAoc3ViU2NoZW1hLmFkZGl0aW9uYWxJdGVtcyAhPT0gZmFsc2UpIHtcbiAgICAgICAgc3ViU2NoZW1hRm91bmQgPSB0cnVlO1xuICAgICAgICBzdWJTY2hlbWEgPSB7IH07XG4gICAgICAgIHNjaGVtYVBvaW50ZXIucHVzaCgnYWRkaXRpb25hbEl0ZW1zJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChzdWJTY2hlbWEudHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChpc09iamVjdChzdWJTY2hlbWEucHJvcGVydGllcykgJiYgaGFzT3duKHN1YlNjaGVtYS5wcm9wZXJ0aWVzLCBrZXkpKSB7XG4gICAgICAgIHN1YlNjaGVtYUZvdW5kID0gdHJ1ZTtcbiAgICAgICAgc3ViU2NoZW1hID0gc3ViU2NoZW1hLnByb3BlcnRpZXNba2V5XTtcbiAgICAgICAgc2NoZW1hUG9pbnRlci5wdXNoKCdwcm9wZXJ0aWVzJywga2V5KTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qoc3ViU2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKSkge1xuICAgICAgICBzdWJTY2hlbWFGb3VuZCA9IHRydWU7XG4gICAgICAgIHN1YlNjaGVtYSA9IHN1YlNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcztcbiAgICAgICAgc2NoZW1hUG9pbnRlci5wdXNoKCdhZGRpdGlvbmFsUHJvcGVydGllcycpO1xuICAgICAgfSBlbHNlIGlmIChzdWJTY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMgIT09IGZhbHNlKSB7XG4gICAgICAgIHN1YlNjaGVtYUZvdW5kID0gdHJ1ZTtcbiAgICAgICAgc3ViU2NoZW1hID0geyB9O1xuICAgICAgICBzY2hlbWFQb2ludGVyLnB1c2goJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghc3ViU2NoZW1hRm91bmQpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYGdldEZyb21TY2hlbWEgZXJyb3I6IFVuYWJsZSB0byBmaW5kIFwiJHtrZXl9XCIgaXRlbSBpbiBzY2hlbWEuYCk7XG4gICAgICBjb25zb2xlLmVycm9yKHNjaGVtYSk7XG4gICAgICBjb25zb2xlLmVycm9yKGRhdGFQb2ludGVyKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJldHVyblR5cGUuc2xpY2UoLTcpID09PSAnUG9pbnRlcicgPyBzY2hlbWFQb2ludGVyIDogc3ViU2NoZW1hO1xufVxuXG4vKipcbiAqICdyZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzJyBmdW5jdGlvblxuICpcbiAqIENoZWNrcyBhIEpTT04gUG9pbnRlciBhZ2FpbnN0IGEgbWFwIG9mIHJlY3Vyc2l2ZSByZWZlcmVuY2VzIGFuZCByZXR1cm5zXG4gKiBhIEpTT04gUG9pbnRlciB0byB0aGUgc2hhbGxvd2VzdCBlcXVpdmFsZW50IGxvY2F0aW9uIGluIHRoZSBzYW1lIG9iamVjdC5cbiAqXG4gKiBVc2luZyB0aGlzIGZ1bmN0aW9ucyBlbmFibGVzIGFuIG9iamVjdCB0byBiZSBjb25zdHJ1Y3RlZCB3aXRoIHVubGltaXRlZFxuICogcmVjdXJzaW9uLCB3aGlsZSBtYWludGFpbmcgYSBmaXhlZCBzZXQgb2YgbWV0YWRhdGEsIHN1Y2ggYXMgZmllbGQgZGF0YSB0eXBlcy5cbiAqIFRoZSBvYmplY3QgY2FuIGdyb3cgYXMgbGFyZ2UgYXMgaXQgd2FudHMsIGFuZCBkZWVwbHkgcmVjdXJzZWQgbm9kZXMgY2FuXG4gKiBqdXN0IHJlZmVyIHRvIHRoZSBtZXRhZGF0YSBmb3IgdGhlaXIgc2hhbGxvdyBlcXVpdmFsZW50cywgaW5zdGVhZCBvZiBoYXZpbmdcbiAqIHRvIGFkZCBhZGRpdGlvbmFsIHJlZHVuZGFudCBtZXRhZGF0YSBmb3IgZWFjaCByZWN1cnNpdmVseSBhZGRlZCBub2RlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogcG9pbnRlcjogICAgICAgICAnL3N0dWZmL2FuZC9tb3JlL2FuZC9tb3JlL2FuZC9tb3JlL2FuZC9tb3JlL3N0dWZmJ1xuICogcmVjdXJzaXZlUmVmTWFwOiBbWycvc3R1ZmYvYW5kL21vcmUvYW5kL21vcmUnLCAnL3N0dWZmL2FuZC9tb3JlLyddXVxuICogcmV0dXJuZWQ6ICAgICAgICAnL3N0dWZmL2FuZC9tb3JlL3N0dWZmJ1xuICpcbiAqIC8vICB7IFBvaW50ZXIgfSBwb2ludGVyIC1cbiAqIC8vICB7IE1hcDxzdHJpbmcsIHN0cmluZz4gfSByZWN1cnNpdmVSZWZNYXAgLVxuICogLy8gIHsgTWFwPHN0cmluZywgbnVtYmVyPiA9IG5ldyBNYXAoKSB9IGFycmF5TWFwIC0gb3B0aW9uYWxcbiAqIC8vIHsgc3RyaW5nIH0gLVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgcG9pbnRlciwgcmVjdXJzaXZlUmVmTWFwLCBhcnJheU1hcCA9IG5ldyBNYXAoKVxuKSB7XG4gIGlmICghcG9pbnRlcikgeyByZXR1cm4gJyc7IH1cbiAgbGV0IGdlbmVyaWNQb2ludGVyID1cbiAgICBKc29uUG9pbnRlci50b0dlbmVyaWNQb2ludGVyKEpzb25Qb2ludGVyLmNvbXBpbGUocG9pbnRlciksIGFycmF5TWFwKTtcbiAgaWYgKGdlbmVyaWNQb2ludGVyLmluZGV4T2YoJy8nKSA9PT0gLTEpIHsgcmV0dXJuIGdlbmVyaWNQb2ludGVyOyB9XG4gIGxldCBwb3NzaWJsZVJlZmVyZW5jZXMgPSB0cnVlO1xuICB3aGlsZSAocG9zc2libGVSZWZlcmVuY2VzKSB7XG4gICAgcG9zc2libGVSZWZlcmVuY2VzID0gZmFsc2U7XG4gICAgcmVjdXJzaXZlUmVmTWFwLmZvckVhY2goKHRvUG9pbnRlciwgZnJvbVBvaW50ZXIpID0+IHtcbiAgICAgIGlmIChKc29uUG9pbnRlci5pc1N1YlBvaW50ZXIodG9Qb2ludGVyLCBmcm9tUG9pbnRlcikpIHtcbiAgICAgICAgd2hpbGUgKEpzb25Qb2ludGVyLmlzU3ViUG9pbnRlcihmcm9tUG9pbnRlciwgZ2VuZXJpY1BvaW50ZXIsIHRydWUpKSB7XG4gICAgICAgICAgZ2VuZXJpY1BvaW50ZXIgPSBKc29uUG9pbnRlci50b0dlbmVyaWNQb2ludGVyKFxuICAgICAgICAgICAgdG9Qb2ludGVyICsgZ2VuZXJpY1BvaW50ZXIuc2xpY2UoZnJvbVBvaW50ZXIubGVuZ3RoKSwgYXJyYXlNYXBcbiAgICAgICAgICApO1xuICAgICAgICAgIHBvc3NpYmxlUmVmZXJlbmNlcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZ2VuZXJpY1BvaW50ZXI7XG59XG5cbi8qKlxuICogJ2dldElucHV0VHlwZScgZnVuY3Rpb25cbiAqXG4gKiAvLyAgIHNjaGVtYVxuICogLy8gIHsgYW55ID0gbnVsbCB9IGxheW91dE5vZGVcbiAqIC8vIHsgc3RyaW5nIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldElucHV0VHlwZShzY2hlbWEsIGxheW91dE5vZGU6IGFueSA9IG51bGwpIHtcbiAgLy8geC1zY2hlbWEtZm9ybSA9IEFuZ3VsYXIgU2NoZW1hIEZvcm0gY29tcGF0aWJpbGl0eVxuICAvLyB3aWRnZXQgJiBjb21wb25lbnQgPSBSZWFjdCBKc29uc2NoZW1hIEZvcm0gY29tcGF0aWJpbGl0eVxuICBjb25zdCBjb250cm9sVHlwZSA9IEpzb25Qb2ludGVyLmdldEZpcnN0KFtcbiAgICBbc2NoZW1hLCAnL3gtc2NoZW1hLWZvcm0vdHlwZSddLFxuICAgIFtzY2hlbWEsICcveC1zY2hlbWEtZm9ybS93aWRnZXQvY29tcG9uZW50J10sXG4gICAgW3NjaGVtYSwgJy94LXNjaGVtYS1mb3JtL3dpZGdldCddLFxuICAgIFtzY2hlbWEsICcvd2lkZ2V0L2NvbXBvbmVudCddLFxuICAgIFtzY2hlbWEsICcvd2lkZ2V0J11cbiAgXSk7XG4gIGlmIChpc1N0cmluZyhjb250cm9sVHlwZSkpIHsgcmV0dXJuIGNoZWNrSW5saW5lVHlwZShjb250cm9sVHlwZSwgc2NoZW1hLCBsYXlvdXROb2RlKTsgfVxuICBsZXQgc2NoZW1hVHlwZSA9IHNjaGVtYS50eXBlO1xuICBpZiAoc2NoZW1hVHlwZSkge1xuICAgIGlmIChpc0FycmF5KHNjaGVtYVR5cGUpKSB7IC8vIElmIG11bHRpcGxlIHR5cGVzIGxpc3RlZCwgdXNlIG1vc3QgaW5jbHVzaXZlIHR5cGVcbiAgICAgIHNjaGVtYVR5cGUgPVxuICAgICAgICBpbkFycmF5KCdvYmplY3QnLCBzY2hlbWFUeXBlKSAmJiBoYXNPd24oc2NoZW1hLCAncHJvcGVydGllcycpID8gJ29iamVjdCcgOlxuICAgICAgICBpbkFycmF5KCdhcnJheScsIHNjaGVtYVR5cGUpICYmIGhhc093bihzY2hlbWEsICdpdGVtcycpID8gJ2FycmF5JyA6XG4gICAgICAgIGluQXJyYXkoJ2FycmF5Jywgc2NoZW1hVHlwZSkgJiYgaGFzT3duKHNjaGVtYSwgJ2FkZGl0aW9uYWxJdGVtcycpID8gJ2FycmF5JyA6XG4gICAgICAgIGluQXJyYXkoJ3N0cmluZycsIHNjaGVtYVR5cGUpID8gJ3N0cmluZycgOlxuICAgICAgICBpbkFycmF5KCdudW1iZXInLCBzY2hlbWFUeXBlKSA/ICdudW1iZXInIDpcbiAgICAgICAgaW5BcnJheSgnaW50ZWdlcicsIHNjaGVtYVR5cGUpID8gJ2ludGVnZXInIDpcbiAgICAgICAgaW5BcnJheSgnYm9vbGVhbicsIHNjaGVtYVR5cGUpID8gJ2Jvb2xlYW4nIDogJ3Vua25vd24nO1xuICAgIH1cbiAgICBpZiAoc2NoZW1hVHlwZSA9PT0gJ2Jvb2xlYW4nKSB7IHJldHVybiAnY2hlY2tib3gnOyB9XG4gICAgaWYgKHNjaGVtYVR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaGFzT3duKHNjaGVtYSwgJ3Byb3BlcnRpZXMnKSB8fCBoYXNPd24oc2NoZW1hLCAnYWRkaXRpb25hbFByb3BlcnRpZXMnKSkge1xuICAgICAgICByZXR1cm4gJ3NlY3Rpb24nO1xuICAgICAgfVxuICAgICAgLy8gVE9ETzogRmlndXJlIG91dCBob3cgdG8gaGFuZGxlIGFkZGl0aW9uYWxQcm9wZXJ0aWVzXG4gICAgICBpZiAoaGFzT3duKHNjaGVtYSwgJyRyZWYnKSkgeyByZXR1cm4gJyRyZWYnOyB9XG4gICAgfVxuICAgIGlmIChzY2hlbWFUeXBlID09PSAnYXJyYXknKSB7XG4gICAgICBjb25zdCBpdGVtc09iamVjdCA9IEpzb25Qb2ludGVyLmdldEZpcnN0KFtcbiAgICAgICAgW3NjaGVtYSwgJy9pdGVtcyddLFxuICAgICAgICBbc2NoZW1hLCAnL2FkZGl0aW9uYWxJdGVtcyddXG4gICAgICBdKSB8fCB7fTtcbiAgICAgIHJldHVybiBoYXNPd24oaXRlbXNPYmplY3QsICdlbnVtJykgJiYgc2NoZW1hLm1heEl0ZW1zICE9PSAxID9cbiAgICAgICAgY2hlY2tJbmxpbmVUeXBlKCdjaGVja2JveGVzJywgc2NoZW1hLCBsYXlvdXROb2RlKSA6ICdhcnJheSc7XG4gICAgfVxuICAgIGlmIChzY2hlbWFUeXBlID09PSAnbnVsbCcpIHsgcmV0dXJuICdub25lJzsgfVxuICAgIGlmIChKc29uUG9pbnRlci5oYXMobGF5b3V0Tm9kZSwgJy9vcHRpb25zL3RpdGxlTWFwJykgfHxcbiAgICAgIGhhc093bihzY2hlbWEsICdlbnVtJykgfHwgZ2V0VGl0bGVNYXBGcm9tT25lT2Yoc2NoZW1hLCBudWxsLCB0cnVlKVxuICAgICkgeyByZXR1cm4gJ3NlbGVjdCc7IH1cbiAgICBpZiAoc2NoZW1hVHlwZSA9PT0gJ251bWJlcicgfHwgc2NoZW1hVHlwZSA9PT0gJ2ludGVnZXInKSB7XG4gICAgICByZXR1cm4gKHNjaGVtYVR5cGUgPT09ICdpbnRlZ2VyJyB8fCBoYXNPd24oc2NoZW1hLCAnbXVsdGlwbGVPZicpKSAmJlxuICAgICAgICBoYXNPd24oc2NoZW1hLCAnbWF4aW11bScpICYmIGhhc093bihzY2hlbWEsICdtaW5pbXVtJykgPyAncmFuZ2UnIDogc2NoZW1hVHlwZTtcbiAgICB9XG4gICAgaWYgKHNjaGVtYVR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAnY29sb3InOiAnY29sb3InLFxuICAgICAgICAnZGF0ZSc6ICdkYXRlJyxcbiAgICAgICAgJ2RhdGUtdGltZSc6ICdkYXRldGltZS1sb2NhbCcsXG4gICAgICAgICdlbWFpbCc6ICdlbWFpbCcsXG4gICAgICAgICd1cmknOiAndXJsJyxcbiAgICAgIH1bc2NoZW1hLmZvcm1hdF0gfHwgJ3RleHQnO1xuICAgIH1cbiAgfVxuICBpZiAoaGFzT3duKHNjaGVtYSwgJyRyZWYnKSkgeyByZXR1cm4gJyRyZWYnOyB9XG4gIGlmIChpc0FycmF5KHNjaGVtYS5vbmVPZikgfHwgaXNBcnJheShzY2hlbWEuYW55T2YpKSB7IHJldHVybiAnb25lLW9mJzsgfVxuICBjb25zb2xlLmVycm9yKGBnZXRJbnB1dFR5cGUgZXJyb3I6IFVuYWJsZSB0byBkZXRlcm1pbmUgaW5wdXQgdHlwZSBmb3IgJHtzY2hlbWFUeXBlfWApO1xuICBjb25zb2xlLmVycm9yKCdzY2hlbWEnLCBzY2hlbWEpO1xuICBpZiAobGF5b3V0Tm9kZSkgeyBjb25zb2xlLmVycm9yKCdsYXlvdXROb2RlJywgbGF5b3V0Tm9kZSk7IH1cbiAgcmV0dXJuICdub25lJztcbn1cblxuLyoqXG4gKiAnY2hlY2tJbmxpbmVUeXBlJyBmdW5jdGlvblxuICpcbiAqIENoZWNrcyBsYXlvdXQgYW5kIHNjaGVtYSBub2RlcyBmb3IgJ2lubGluZTogdHJ1ZScsIGFuZCBjb252ZXJ0c1xuICogJ3JhZGlvcycgb3IgJ2NoZWNrYm94ZXMnIHRvICdyYWRpb3MtaW5saW5lJyBvciAnY2hlY2tib3hlcy1pbmxpbmUnXG4gKlxuICogLy8gIHsgc3RyaW5nIH0gY29udHJvbFR5cGUgLVxuICogLy8gICBzY2hlbWEgLVxuICogLy8gIHsgYW55ID0gbnVsbCB9IGxheW91dE5vZGUgLVxuICogLy8geyBzdHJpbmcgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tJbmxpbmVUeXBlKGNvbnRyb2xUeXBlLCBzY2hlbWEsIGxheW91dE5vZGU6IGFueSA9IG51bGwpIHtcbiAgaWYgKCFpc1N0cmluZyhjb250cm9sVHlwZSkgfHwgKFxuICAgIGNvbnRyb2xUeXBlLnNsaWNlKDAsIDgpICE9PSAnY2hlY2tib3gnICYmIGNvbnRyb2xUeXBlLnNsaWNlKDAsIDUpICE9PSAncmFkaW8nXG4gICkpIHtcbiAgICByZXR1cm4gY29udHJvbFR5cGU7XG4gIH1cbiAgaWYgKFxuICAgIEpzb25Qb2ludGVyLmdldEZpcnN0KFtcbiAgICAgIFtsYXlvdXROb2RlLCAnL2lubGluZSddLFxuICAgICAgW2xheW91dE5vZGUsICcvb3B0aW9ucy9pbmxpbmUnXSxcbiAgICAgIFtzY2hlbWEsICcvaW5saW5lJ10sXG4gICAgICBbc2NoZW1hLCAnL3gtc2NoZW1hLWZvcm0vaW5saW5lJ10sXG4gICAgICBbc2NoZW1hLCAnL3gtc2NoZW1hLWZvcm0vb3B0aW9ucy9pbmxpbmUnXSxcbiAgICAgIFtzY2hlbWEsICcveC1zY2hlbWEtZm9ybS93aWRnZXQvaW5saW5lJ10sXG4gICAgICBbc2NoZW1hLCAnL3gtc2NoZW1hLWZvcm0vd2lkZ2V0L2NvbXBvbmVudC9pbmxpbmUnXSxcbiAgICAgIFtzY2hlbWEsICcveC1zY2hlbWEtZm9ybS93aWRnZXQvY29tcG9uZW50L29wdGlvbnMvaW5saW5lJ10sXG4gICAgICBbc2NoZW1hLCAnL3dpZGdldC9pbmxpbmUnXSxcbiAgICAgIFtzY2hlbWEsICcvd2lkZ2V0L2NvbXBvbmVudC9pbmxpbmUnXSxcbiAgICAgIFtzY2hlbWEsICcvd2lkZ2V0L2NvbXBvbmVudC9vcHRpb25zL2lubGluZSddLFxuICAgIF0pID09PSB0cnVlXG4gICkge1xuICAgIHJldHVybiBjb250cm9sVHlwZS5zbGljZSgwLCA1KSA9PT0gJ3JhZGlvJyA/XG4gICAgICAncmFkaW9zLWlubGluZScgOiAnY2hlY2tib3hlcy1pbmxpbmUnO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb250cm9sVHlwZTtcbiAgfVxufVxuXG4vKipcbiAqICdpc0lucHV0UmVxdWlyZWQnIGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIGEgSlNPTiBTY2hlbWEgdG8gc2VlIGlmIGFuIGl0ZW0gaXMgcmVxdWlyZWRcbiAqXG4gKiAvLyAgIHNjaGVtYSAtIHRoZSBzY2hlbWEgdG8gY2hlY2tcbiAqIC8vICB7IHN0cmluZyB9IHNjaGVtYVBvaW50ZXIgLSB0aGUgcG9pbnRlciB0byB0aGUgaXRlbSB0byBjaGVja1xuICogLy8geyBib29sZWFuIH0gLSB0cnVlIGlmIHRoZSBpdGVtIGlzIHJlcXVpcmVkLCBmYWxzZSBpZiBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSW5wdXRSZXF1aXJlZChzY2hlbWEsIHNjaGVtYVBvaW50ZXIpIHtcbiAgaWYgKCFpc09iamVjdChzY2hlbWEpKSB7XG4gICAgY29uc29sZS5lcnJvcignaXNJbnB1dFJlcXVpcmVkIGVycm9yOiBJbnB1dCBzY2hlbWEgbXVzdCBiZSBhbiBvYmplY3QuJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IGxpc3RQb2ludGVyQXJyYXkgPSBKc29uUG9pbnRlci5wYXJzZShzY2hlbWFQb2ludGVyKTtcbiAgaWYgKGlzQXJyYXkobGlzdFBvaW50ZXJBcnJheSkpIHtcbiAgICBpZiAoIWxpc3RQb2ludGVyQXJyYXkubGVuZ3RoKSB7IHJldHVybiBzY2hlbWEucmVxdWlyZWQgPT09IHRydWU7IH1cbiAgICBjb25zdCBrZXlOYW1lID0gbGlzdFBvaW50ZXJBcnJheS5wb3AoKTtcbiAgICBjb25zdCBuZXh0VG9MYXN0S2V5ID0gbGlzdFBvaW50ZXJBcnJheVtsaXN0UG9pbnRlckFycmF5Lmxlbmd0aCAtIDFdO1xuICAgIGlmIChbJ3Byb3BlcnRpZXMnLCAnYWRkaXRpb25hbFByb3BlcnRpZXMnLCAncGF0dGVyblByb3BlcnRpZXMnLCAnaXRlbXMnLCAnYWRkaXRpb25hbEl0ZW1zJ11cbiAgICAgIC5pbmNsdWRlcyhuZXh0VG9MYXN0S2V5KVxuICAgICkge1xuICAgICAgbGlzdFBvaW50ZXJBcnJheS5wb3AoKTtcbiAgICB9XG4gICAgY29uc3QgcGFyZW50U2NoZW1hID0gSnNvblBvaW50ZXIuZ2V0KHNjaGVtYSwgbGlzdFBvaW50ZXJBcnJheSkgfHwge307XG4gICAgaWYgKGlzQXJyYXkocGFyZW50U2NoZW1hLnJlcXVpcmVkKSkge1xuICAgICAgcmV0dXJuIHBhcmVudFNjaGVtYS5yZXF1aXJlZC5pbmNsdWRlcyhrZXlOYW1lKTtcbiAgICB9XG4gICAgaWYgKHBhcmVudFNjaGVtYS50eXBlID09PSAnYXJyYXknKSB7XG4gICAgICByZXR1cm4gaGFzT3duKHBhcmVudFNjaGVtYSwgJ21pbkl0ZW1zJykgJiZcbiAgICAgICAgaXNOdW1iZXIoa2V5TmFtZSkgJiZcbiAgICAgICAgK3BhcmVudFNjaGVtYS5taW5JdGVtcyA+ICtrZXlOYW1lO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogJ3VwZGF0ZUlucHV0T3B0aW9ucycgZnVuY3Rpb25cbiAqXG4gKiAvLyAgIGxheW91dE5vZGVcbiAqIC8vICAgc2NoZW1hXG4gKiAvLyAgIGpzZlxuICogLy8geyB2b2lkIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUlucHV0T3B0aW9ucyhsYXlvdXROb2RlLCBzY2hlbWEsIGpzZikge1xuICBpZiAoIWlzT2JqZWN0KGxheW91dE5vZGUpIHx8ICFpc09iamVjdChsYXlvdXROb2RlLm9wdGlvbnMpKSB7IHJldHVybjsgfVxuXG4gIC8vIFNldCBhbGwgb3B0aW9uIHZhbHVlcyBpbiBsYXlvdXROb2RlLm9wdGlvbnNcbiAgY29uc3QgbmV3T3B0aW9uczogYW55ID0geyB9O1xuICBjb25zdCBmaXhVaUtleXMgPSBrZXkgPT4ga2V5LnNsaWNlKDAsIDMpLnRvTG93ZXJDYXNlKCkgPT09ICd1aTonID8ga2V5LnNsaWNlKDMpIDoga2V5O1xuICBtZXJnZUZpbHRlcmVkT2JqZWN0KG5ld09wdGlvbnMsIGpzZi5mb3JtT3B0aW9ucy5kZWZhdXRXaWRnZXRPcHRpb25zLCBbXSwgZml4VWlLZXlzKTtcbiAgWyBbIEpzb25Qb2ludGVyLmdldChzY2hlbWEsICcvdWk6d2lkZ2V0L29wdGlvbnMnKSwgW10gXSxcbiAgICBbIEpzb25Qb2ludGVyLmdldChzY2hlbWEsICcvdWk6d2lkZ2V0JyksIFtdIF0sXG4gICAgWyBzY2hlbWEsIFtcbiAgICAgICdhZGRpdGlvbmFsUHJvcGVydGllcycsICdhZGRpdGlvbmFsSXRlbXMnLCAncHJvcGVydGllcycsICdpdGVtcycsXG4gICAgICAncmVxdWlyZWQnLCAndHlwZScsICd4LXNjaGVtYS1mb3JtJywgJyRyZWYnXG4gICAgXSBdLFxuICAgIFsgSnNvblBvaW50ZXIuZ2V0KHNjaGVtYSwgJy94LXNjaGVtYS1mb3JtL29wdGlvbnMnKSwgW10gXSxcbiAgICBbIEpzb25Qb2ludGVyLmdldChzY2hlbWEsICcveC1zY2hlbWEtZm9ybScpLCBbJ2l0ZW1zJywgJ29wdGlvbnMnXSBdLFxuICAgIFsgbGF5b3V0Tm9kZSwgW1xuICAgICAgJ19pZCcsICckcmVmJywgJ2FycmF5SXRlbScsICdhcnJheUl0ZW1UeXBlJywgJ2RhdGFQb2ludGVyJywgJ2RhdGFUeXBlJyxcbiAgICAgICdpdGVtcycsICdrZXknLCAnbmFtZScsICdvcHRpb25zJywgJ3JlY3Vyc2l2ZVJlZmVyZW5jZScsICd0eXBlJywgJ3dpZGdldCdcbiAgICBdIF0sXG4gICAgWyBsYXlvdXROb2RlLm9wdGlvbnMsIFtdIF0sXG4gIF0uZm9yRWFjaCgoWyBvYmplY3QsIGV4Y2x1ZGVLZXlzIF0pID0+XG4gICAgbWVyZ2VGaWx0ZXJlZE9iamVjdChuZXdPcHRpb25zLCBvYmplY3QsIGV4Y2x1ZGVLZXlzLCBmaXhVaUtleXMpXG4gICk7XG4gIGlmICghaGFzT3duKG5ld09wdGlvbnMsICd0aXRsZU1hcCcpKSB7XG4gICAgbGV0IG5ld1RpdGxlTWFwOiBhbnkgPSBudWxsO1xuICAgIG5ld1RpdGxlTWFwID0gZ2V0VGl0bGVNYXBGcm9tT25lT2Yoc2NoZW1hLCBuZXdPcHRpb25zLmZsYXRMaXN0KTtcbiAgICBpZiAobmV3VGl0bGVNYXApIHsgbmV3T3B0aW9ucy50aXRsZU1hcCA9IG5ld1RpdGxlTWFwOyB9XG4gICAgaWYgKCFoYXNPd24obmV3T3B0aW9ucywgJ3RpdGxlTWFwJykgJiYgIWhhc093bihuZXdPcHRpb25zLCAnZW51bScpICYmIGhhc093bihzY2hlbWEsICdpdGVtcycpKSB7XG4gICAgICBpZiAoSnNvblBvaW50ZXIuaGFzKHNjaGVtYSwgJy9pdGVtcy90aXRsZU1hcCcpKSB7XG4gICAgICAgIG5ld09wdGlvbnMudGl0bGVNYXAgPSBzY2hlbWEuaXRlbXMudGl0bGVNYXA7XG4gICAgICB9IGVsc2UgaWYgKEpzb25Qb2ludGVyLmhhcyhzY2hlbWEsICcvaXRlbXMvZW51bScpKSB7XG4gICAgICAgIG5ld09wdGlvbnMuZW51bSA9IHNjaGVtYS5pdGVtcy5lbnVtO1xuICAgICAgICBpZiAoIWhhc093bihuZXdPcHRpb25zLCAnZW51bU5hbWVzJykgJiYgSnNvblBvaW50ZXIuaGFzKHNjaGVtYSwgJy9pdGVtcy9lbnVtTmFtZXMnKSkge1xuICAgICAgICAgIG5ld09wdGlvbnMuZW51bU5hbWVzID0gc2NoZW1hLml0ZW1zLmVudW1OYW1lcztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChKc29uUG9pbnRlci5oYXMoc2NoZW1hLCAnL2l0ZW1zL29uZU9mJykpIHtcbiAgICAgICAgbmV3VGl0bGVNYXAgPSBnZXRUaXRsZU1hcEZyb21PbmVPZihzY2hlbWEuaXRlbXMsIG5ld09wdGlvbnMuZmxhdExpc3QpO1xuICAgICAgICBpZiAobmV3VGl0bGVNYXApIHsgbmV3T3B0aW9ucy50aXRsZU1hcCA9IG5ld1RpdGxlTWFwOyB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgc2NoZW1hIHR5cGUgaXMgaW50ZWdlciwgZW5mb3JjZSBieSBzZXR0aW5nIG11bHRpcGxlT2YgPSAxXG4gIGlmIChzY2hlbWEudHlwZSA9PT0gJ2ludGVnZXInICYmICFoYXNWYWx1ZShuZXdPcHRpb25zLm11bHRpcGxlT2YpKSB7XG4gICAgbmV3T3B0aW9ucy5tdWx0aXBsZU9mID0gMTtcbiAgfVxuXG4gIC8vIENvcHkgYW55IHR5cGVhaGVhZCB3b3JkIGxpc3RzIHRvIG9wdGlvbnMudHlwZWFoZWFkLnNvdXJjZVxuICBpZiAoSnNvblBvaW50ZXIuaGFzKG5ld09wdGlvbnMsICcvYXV0b2NvbXBsZXRlL3NvdXJjZScpKSB7XG4gICAgbmV3T3B0aW9ucy50eXBlYWhlYWQgPSBuZXdPcHRpb25zLmF1dG9jb21wbGV0ZTtcbiAgfSBlbHNlIGlmIChKc29uUG9pbnRlci5oYXMobmV3T3B0aW9ucywgJy90YWdzaW5wdXQvc291cmNlJykpIHtcbiAgICBuZXdPcHRpb25zLnR5cGVhaGVhZCA9IG5ld09wdGlvbnMudGFnc2lucHV0O1xuICB9IGVsc2UgaWYgKEpzb25Qb2ludGVyLmhhcyhuZXdPcHRpb25zLCAnL3RhZ3NpbnB1dC90eXBlYWhlYWQvc291cmNlJykpIHtcbiAgICBuZXdPcHRpb25zLnR5cGVhaGVhZCA9IG5ld09wdGlvbnMudGFnc2lucHV0LnR5cGVhaGVhZDtcbiAgfVxuXG4gIGxheW91dE5vZGUub3B0aW9ucyA9IG5ld09wdGlvbnM7XG59XG5cbi8qKlxuICogJ2dldFRpdGxlTWFwRnJvbU9uZU9mJyBmdW5jdGlvblxuICpcbiAqIC8vICB7IHNjaGVtYSB9IHNjaGVtYVxuICogLy8gIHsgYm9vbGVhbiA9IG51bGwgfSBmbGF0TGlzdFxuICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gdmFsaWRhdGVPbmx5XG4gKiAvLyB7IHZhbGlkYXRvcnMgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGl0bGVNYXBGcm9tT25lT2YoXG4gIHNjaGVtYTogYW55ID0ge30sIGZsYXRMaXN0OiBib29sZWFuID0gbnVsbCwgdmFsaWRhdGVPbmx5ID0gZmFsc2Vcbikge1xuICBsZXQgdGl0bGVNYXAgPSBudWxsO1xuICBjb25zdCBvbmVPZiA9IHNjaGVtYS5vbmVPZiB8fCBzY2hlbWEuYW55T2YgfHwgbnVsbDtcbiAgaWYgKGlzQXJyYXkob25lT2YpICYmIG9uZU9mLmV2ZXJ5KGl0ZW0gPT4gaXRlbS50aXRsZSkpIHtcbiAgICBpZiAob25lT2YuZXZlcnkoaXRlbSA9PiBpc0FycmF5KGl0ZW0uZW51bSkgJiYgaXRlbS5lbnVtLmxlbmd0aCA9PT0gMSkpIHtcbiAgICAgIGlmICh2YWxpZGF0ZU9ubHkpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgIHRpdGxlTWFwID0gb25lT2YubWFwKGl0ZW0gPT4gKHsgbmFtZTogaXRlbS50aXRsZSwgdmFsdWU6IGl0ZW0uZW51bVswXSB9KSk7XG4gICAgfSBlbHNlIGlmIChvbmVPZi5ldmVyeShpdGVtID0+IGl0ZW0uY29uc3QpKSB7XG4gICAgICBpZiAodmFsaWRhdGVPbmx5KSB7IHJldHVybiB0cnVlOyB9XG4gICAgICB0aXRsZU1hcCA9IG9uZU9mLm1hcChpdGVtID0+ICh7IG5hbWU6IGl0ZW0udGl0bGUsIHZhbHVlOiBpdGVtLmNvbnN0IH0pKTtcbiAgICB9XG5cbiAgICAvLyBpZiBmbGF0TGlzdCAhPT0gZmFsc2UgYW5kIHNvbWUgaXRlbXMgaGF2ZSBjb2xvbnMsIG1ha2UgZ3JvdXBlZCBtYXBcbiAgICBpZiAoZmxhdExpc3QgIT09IGZhbHNlICYmICh0aXRsZU1hcCB8fCBbXSlcbiAgICAgIC5maWx0ZXIodGl0bGUgPT4gKCh0aXRsZSB8fCB7fSkubmFtZSB8fCAnJykuaW5kZXhPZignOiAnKSkubGVuZ3RoID4gMVxuICAgICkge1xuXG4gICAgICAvLyBTcGxpdCBuYW1lIG9uIGZpcnN0IGNvbG9uIHRvIGNyZWF0ZSBncm91cGVkIG1hcCAobmFtZSAtPiBncm91cDogbmFtZSlcbiAgICAgIGNvbnN0IG5ld1RpdGxlTWFwID0gdGl0bGVNYXAubWFwKHRpdGxlID0+IHtcbiAgICAgICAgY29uc3QgW2dyb3VwLCBuYW1lXSA9IHRpdGxlLm5hbWUuc3BsaXQoLzogKC4rKS8pO1xuICAgICAgICByZXR1cm4gZ3JvdXAgJiYgbmFtZSA/IHsgLi4udGl0bGUsIGdyb3VwLCBuYW1lIH0gOiB0aXRsZTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBJZiBmbGF0TGlzdCA9PT0gdHJ1ZSBvciBhdCBsZWFzdCBvbmUgZ3JvdXAgaGFzIG11bHRpcGxlIGl0ZW1zLCB1c2UgZ3JvdXBlZCBtYXBcbiAgICAgIGlmIChmbGF0TGlzdCA9PT0gdHJ1ZSB8fCBuZXdUaXRsZU1hcC5zb21lKCh0aXRsZSwgaW5kZXgpID0+IGluZGV4ICYmXG4gICAgICAgIGhhc093bih0aXRsZSwgJ2dyb3VwJykgJiYgdGl0bGUuZ3JvdXAgPT09IG5ld1RpdGxlTWFwW2luZGV4IC0gMV0uZ3JvdXBcbiAgICAgICkpIHtcbiAgICAgICAgdGl0bGVNYXAgPSBuZXdUaXRsZU1hcDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbGlkYXRlT25seSA/IGZhbHNlIDogdGl0bGVNYXA7XG59XG5cbi8qKlxuICogJ2dldENvbnRyb2xWYWxpZGF0b3JzJyBmdW5jdGlvblxuICpcbiAqIC8vICBzY2hlbWFcbiAqIC8vIHsgdmFsaWRhdG9ycyB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250cm9sVmFsaWRhdG9ycyhzY2hlbWEpIHtcbiAgaWYgKCFpc09iamVjdChzY2hlbWEpKSB7IHJldHVybiBudWxsOyB9XG4gIGNvbnN0IHZhbGlkYXRvcnM6IGFueSA9IHsgfTtcbiAgaWYgKGhhc093bihzY2hlbWEsICd0eXBlJykpIHtcbiAgICBzd2l0Y2ggKHNjaGVtYS50eXBlKSB7XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICBmb3JFYWNoKFsncGF0dGVybicsICdmb3JtYXQnLCAnbWluTGVuZ3RoJywgJ21heExlbmd0aCddLCAocHJvcCkgPT4ge1xuICAgICAgICAgIGlmIChoYXNPd24oc2NoZW1hLCBwcm9wKSkgeyB2YWxpZGF0b3JzW3Byb3BdID0gW3NjaGVtYVtwcm9wXV07IH1cbiAgICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgJ251bWJlcic6IGNhc2UgJ2ludGVnZXInOlxuICAgICAgICBmb3JFYWNoKFsnTWluaW11bScsICdNYXhpbXVtJ10sICh1Y0xpbWl0KSA9PiB7XG4gICAgICAgICAgY29uc3QgZUxpbWl0ID0gJ2V4Y2x1c2l2ZScgKyB1Y0xpbWl0O1xuICAgICAgICAgIGNvbnN0IGxpbWl0ID0gdWNMaW1pdC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmIChoYXNPd24oc2NoZW1hLCBsaW1pdCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4Y2x1c2l2ZSA9IGhhc093bihzY2hlbWEsIGVMaW1pdCkgJiYgc2NoZW1hW2VMaW1pdF0gPT09IHRydWU7XG4gICAgICAgICAgICB2YWxpZGF0b3JzW2xpbWl0XSA9IFtzY2hlbWFbbGltaXRdLCBleGNsdXNpdmVdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZvckVhY2goWydtdWx0aXBsZU9mJywgJ3R5cGUnXSwgKHByb3ApID0+IHtcbiAgICAgICAgICBpZiAoaGFzT3duKHNjaGVtYSwgcHJvcCkpIHsgdmFsaWRhdG9yc1twcm9wXSA9IFtzY2hlbWFbcHJvcF1dOyB9XG4gICAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICBmb3JFYWNoKFsnbWluUHJvcGVydGllcycsICdtYXhQcm9wZXJ0aWVzJywgJ2RlcGVuZGVuY2llcyddLCAocHJvcCkgPT4ge1xuICAgICAgICAgIGlmIChoYXNPd24oc2NoZW1hLCBwcm9wKSkgeyB2YWxpZGF0b3JzW3Byb3BdID0gW3NjaGVtYVtwcm9wXV07IH1cbiAgICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgICAgZm9yRWFjaChbJ21pbkl0ZW1zJywgJ21heEl0ZW1zJywgJ3VuaXF1ZUl0ZW1zJ10sIChwcm9wKSA9PiB7XG4gICAgICAgICAgaWYgKGhhc093bihzY2hlbWEsIHByb3ApKSB7IHZhbGlkYXRvcnNbcHJvcF0gPSBbc2NoZW1hW3Byb3BdXTsgfVxuICAgICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoaGFzT3duKHNjaGVtYSwgJ2VudW0nKSkgeyB2YWxpZGF0b3JzLmVudW0gPSBbc2NoZW1hLmVudW1dOyB9XG4gIHJldHVybiB2YWxpZGF0b3JzO1xufVxuXG4vKipcbiAqICdyZXNvbHZlU2NoZW1hUmVmZXJlbmNlcycgZnVuY3Rpb25cbiAqXG4gKiBGaW5kIGFsbCAkcmVmIGxpbmtzIGluIHNjaGVtYSBhbmQgc2F2ZSBsaW5rcyBhbmQgcmVmZXJlbmNlZCBzY2hlbWFzIGluXG4gKiBzY2hlbWFSZWZMaWJyYXJ5LCBzY2hlbWFSZWN1cnNpdmVSZWZNYXAsIGFuZCBkYXRhUmVjdXJzaXZlUmVmTWFwXG4gKlxuICogLy8gIHNjaGVtYVxuICogLy8gIHNjaGVtYVJlZkxpYnJhcnlcbiAqIC8vIHsgTWFwPHN0cmluZywgc3RyaW5nPiB9IHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcFxuICogLy8geyBNYXA8c3RyaW5nLCBzdHJpbmc+IH0gZGF0YVJlY3Vyc2l2ZVJlZk1hcFxuICogLy8geyBNYXA8c3RyaW5nLCBudW1iZXI+IH0gYXJyYXlNYXBcbiAqIC8vXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlU2NoZW1hUmVmZXJlbmNlcyhcbiAgc2NoZW1hLCBzY2hlbWFSZWZMaWJyYXJ5LCBzY2hlbWFSZWN1cnNpdmVSZWZNYXAsIGRhdGFSZWN1cnNpdmVSZWZNYXAsIGFycmF5TWFwXG4pIHtcbiAgaWYgKCFpc09iamVjdChzY2hlbWEpKSB7XG4gICAgY29uc29sZS5lcnJvcigncmVzb2x2ZVNjaGVtYVJlZmVyZW5jZXMgZXJyb3I6IHNjaGVtYSBtdXN0IGJlIGFuIG9iamVjdC4nKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcmVmTGlua3MgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgcmVmTWFwU2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHJlZk1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIGNvbnN0IHJlY3Vyc2l2ZVJlZk1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIGNvbnN0IHJlZkxpYnJhcnk6IGFueSA9IHt9O1xuXG4gIC8vIFNlYXJjaCBzY2hlbWEgZm9yIGFsbCAkcmVmIGxpbmtzLCBhbmQgYnVpbGQgZnVsbCByZWZMaWJyYXJ5XG4gIEpzb25Qb2ludGVyLmZvckVhY2hEZWVwKHNjaGVtYSwgKHN1YlNjaGVtYSwgc3ViU2NoZW1hUG9pbnRlcikgPT4ge1xuICAgIGlmIChoYXNPd24oc3ViU2NoZW1hLCAnJHJlZicpICYmIGlzU3RyaW5nKHN1YlNjaGVtYVsnJHJlZiddKSkge1xuICAgICAgY29uc3QgcmVmUG9pbnRlciA9IEpzb25Qb2ludGVyLmNvbXBpbGUoc3ViU2NoZW1hWyckcmVmJ10pO1xuICAgICAgcmVmTGlua3MuYWRkKHJlZlBvaW50ZXIpO1xuICAgICAgcmVmTWFwU2V0LmFkZChzdWJTY2hlbWFQb2ludGVyICsgJ35+JyArIHJlZlBvaW50ZXIpO1xuICAgICAgcmVmTWFwLnNldChzdWJTY2hlbWFQb2ludGVyLCByZWZQb2ludGVyKTtcbiAgICB9XG4gIH0pO1xuICByZWZMaW5rcy5mb3JFYWNoKHJlZiA9PiByZWZMaWJyYXJ5W3JlZl0gPSBnZXRTdWJTY2hlbWEoc2NoZW1hLCByZWYpKTtcblxuICAvLyBGb2xsb3cgYWxsIHJlZiBsaW5rcyBhbmQgc2F2ZSBpbiByZWZNYXBTZXQsXG4gIC8vIHRvIGZpbmQgYW55IG11bHRpLWxpbmsgcmVjdXJzaXZlIHJlZmVybmNlc1xuICBsZXQgY2hlY2tSZWZMaW5rcyA9IHRydWU7XG4gIHdoaWxlIChjaGVja1JlZkxpbmtzKSB7XG4gICAgY2hlY2tSZWZMaW5rcyA9IGZhbHNlO1xuICAgIEFycmF5LmZyb20ocmVmTWFwKS5mb3JFYWNoKChbZnJvbVJlZjEsIHRvUmVmMV0pID0+IEFycmF5LmZyb20ocmVmTWFwKVxuICAgICAgLmZpbHRlcigoW2Zyb21SZWYyLCB0b1JlZjJdKSA9PlxuICAgICAgICBKc29uUG9pbnRlci5pc1N1YlBvaW50ZXIodG9SZWYxLCBmcm9tUmVmMiwgdHJ1ZSkgJiZcbiAgICAgICAgIUpzb25Qb2ludGVyLmlzU3ViUG9pbnRlcih0b1JlZjIsIHRvUmVmMSwgdHJ1ZSkgJiZcbiAgICAgICAgIXJlZk1hcFNldC5oYXMoZnJvbVJlZjEgKyBmcm9tUmVmMi5zbGljZSh0b1JlZjEubGVuZ3RoKSArICd+ficgKyB0b1JlZjIpXG4gICAgICApXG4gICAgICAuZm9yRWFjaCgoW2Zyb21SZWYyLCB0b1JlZjJdKSA9PiB7XG4gICAgICAgIHJlZk1hcFNldC5hZGQoZnJvbVJlZjEgKyBmcm9tUmVmMi5zbGljZSh0b1JlZjEubGVuZ3RoKSArICd+ficgKyB0b1JlZjIpO1xuICAgICAgICBjaGVja1JlZkxpbmtzID0gdHJ1ZTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8vIEJ1aWxkIGZ1bGwgcmVjdXJzaXZlUmVmTWFwXG4gIC8vIEZpcnN0IHBhc3MgLSBzYXZlIGFsbCBpbnRlcm5hbGx5IHJlY3Vyc2l2ZSByZWZzIGZyb20gcmVmTWFwU2V0XG4gIEFycmF5LmZyb20ocmVmTWFwU2V0KVxuICAgIC5tYXAocmVmTGluayA9PiByZWZMaW5rLnNwbGl0KCd+ficpKVxuICAgIC5maWx0ZXIoKFtmcm9tUmVmLCB0b1JlZl0pID0+IEpzb25Qb2ludGVyLmlzU3ViUG9pbnRlcih0b1JlZiwgZnJvbVJlZikpXG4gICAgLmZvckVhY2goKFtmcm9tUmVmLCB0b1JlZl0pID0+IHJlY3Vyc2l2ZVJlZk1hcC5zZXQoZnJvbVJlZiwgdG9SZWYpKTtcbiAgLy8gU2Vjb25kIHBhc3MgLSBjcmVhdGUgcmVjdXJzaXZlIHZlcnNpb25zIG9mIGFueSBvdGhlciByZWZzIHRoYXQgbGluayB0byByZWN1cnNpdmUgcmVmc1xuICBBcnJheS5mcm9tKHJlZk1hcClcbiAgICAuZmlsdGVyKChbZnJvbVJlZjEsIHRvUmVmMV0pID0+IEFycmF5LmZyb20ocmVjdXJzaXZlUmVmTWFwLmtleXMoKSlcbiAgICAgIC5ldmVyeShmcm9tUmVmMiA9PiAhSnNvblBvaW50ZXIuaXNTdWJQb2ludGVyKGZyb21SZWYxLCBmcm9tUmVmMiwgdHJ1ZSkpXG4gICAgKVxuICAgIC5mb3JFYWNoKChbZnJvbVJlZjEsIHRvUmVmMV0pID0+IEFycmF5LmZyb20ocmVjdXJzaXZlUmVmTWFwKVxuICAgICAgLmZpbHRlcigoW2Zyb21SZWYyLCB0b1JlZjJdKSA9PlxuICAgICAgICAhcmVjdXJzaXZlUmVmTWFwLmhhcyhmcm9tUmVmMSArIGZyb21SZWYyLnNsaWNlKHRvUmVmMS5sZW5ndGgpKSAmJlxuICAgICAgICBKc29uUG9pbnRlci5pc1N1YlBvaW50ZXIodG9SZWYxLCBmcm9tUmVmMiwgdHJ1ZSkgJiZcbiAgICAgICAgIUpzb25Qb2ludGVyLmlzU3ViUG9pbnRlcih0b1JlZjEsIGZyb21SZWYxLCB0cnVlKVxuICAgICAgKVxuICAgICAgLmZvckVhY2goKFtmcm9tUmVmMiwgdG9SZWYyXSkgPT4gcmVjdXJzaXZlUmVmTWFwLnNldChcbiAgICAgICAgZnJvbVJlZjEgKyBmcm9tUmVmMi5zbGljZSh0b1JlZjEubGVuZ3RoKSxcbiAgICAgICAgZnJvbVJlZjEgKyB0b1JlZjIuc2xpY2UodG9SZWYxLmxlbmd0aClcbiAgICAgICkpXG4gICAgKTtcblxuICAvLyBDcmVhdGUgY29tcGlsZWQgc2NoZW1hIGJ5IHJlcGxhY2luZyBhbGwgbm9uLXJlY3Vyc2l2ZSAkcmVmIGxpbmtzIHdpdGhcbiAgLy8gdGhpZWlyIGxpbmtlZCBzY2hlbWFzIGFuZCwgd2hlcmUgcG9zc2libGUsIGNvbWJpbmluZyBzY2hlbWFzIGluIGFsbE9mIGFycmF5cy5cbiAgbGV0IGNvbXBpbGVkU2NoZW1hID0geyAuLi5zY2hlbWEgfTtcbiAgZGVsZXRlIGNvbXBpbGVkU2NoZW1hLmRlZmluaXRpb25zO1xuICBjb21waWxlZFNjaGVtYSA9XG4gICAgZ2V0U3ViU2NoZW1hKGNvbXBpbGVkU2NoZW1hLCAnJywgcmVmTGlicmFyeSwgcmVjdXJzaXZlUmVmTWFwKTtcblxuICAvLyBNYWtlIHN1cmUgYWxsIHJlbWFpbmluZyBzY2hlbWEgJHJlZnMgYXJlIHJlY3Vyc2l2ZSwgYW5kIGJ1aWxkIGZpbmFsXG4gIC8vIHNjaGVtYVJlZkxpYnJhcnksIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCwgZGF0YVJlY3Vyc2l2ZVJlZk1hcCwgJiBhcnJheU1hcFxuICBKc29uUG9pbnRlci5mb3JFYWNoRGVlcChjb21waWxlZFNjaGVtYSwgKHN1YlNjaGVtYSwgc3ViU2NoZW1hUG9pbnRlcikgPT4ge1xuICAgIGlmIChpc1N0cmluZyhzdWJTY2hlbWFbJyRyZWYnXSkpIHtcbiAgICAgIGxldCByZWZQb2ludGVyID0gSnNvblBvaW50ZXIuY29tcGlsZShzdWJTY2hlbWFbJyRyZWYnXSk7XG4gICAgICBpZiAoIUpzb25Qb2ludGVyLmlzU3ViUG9pbnRlcihyZWZQb2ludGVyLCBzdWJTY2hlbWFQb2ludGVyLCB0cnVlKSkge1xuICAgICAgICByZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhzdWJTY2hlbWFQb2ludGVyLCByZWN1cnNpdmVSZWZNYXApO1xuICAgICAgICBKc29uUG9pbnRlci5zZXQoY29tcGlsZWRTY2hlbWEsIHN1YlNjaGVtYVBvaW50ZXIsIHsgJHJlZjogYCMke3JlZlBvaW50ZXJ9YCB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghaGFzT3duKHNjaGVtYVJlZkxpYnJhcnksICdyZWZQb2ludGVyJykpIHtcbiAgICAgICAgc2NoZW1hUmVmTGlicmFyeVtyZWZQb2ludGVyXSA9ICFyZWZQb2ludGVyLmxlbmd0aCA/IGNvbXBpbGVkU2NoZW1hIDpcbiAgICAgICAgICBnZXRTdWJTY2hlbWEoY29tcGlsZWRTY2hlbWEsIHJlZlBvaW50ZXIsIHNjaGVtYVJlZkxpYnJhcnksIHJlY3Vyc2l2ZVJlZk1hcCk7XG4gICAgICB9XG4gICAgICBpZiAoIXNjaGVtYVJlY3Vyc2l2ZVJlZk1hcC5oYXMoc3ViU2NoZW1hUG9pbnRlcikpIHtcbiAgICAgICAgc2NoZW1hUmVjdXJzaXZlUmVmTWFwLnNldChzdWJTY2hlbWFQb2ludGVyLCByZWZQb2ludGVyKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZyb21EYXRhUmVmID0gSnNvblBvaW50ZXIudG9EYXRhUG9pbnRlcihzdWJTY2hlbWFQb2ludGVyLCBjb21waWxlZFNjaGVtYSk7XG4gICAgICBpZiAoIWRhdGFSZWN1cnNpdmVSZWZNYXAuaGFzKGZyb21EYXRhUmVmKSkge1xuICAgICAgICBjb25zdCB0b0RhdGFSZWYgPSBKc29uUG9pbnRlci50b0RhdGFQb2ludGVyKHJlZlBvaW50ZXIsIGNvbXBpbGVkU2NoZW1hKTtcbiAgICAgICAgZGF0YVJlY3Vyc2l2ZVJlZk1hcC5zZXQoZnJvbURhdGFSZWYsIHRvRGF0YVJlZik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzdWJTY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJlxuICAgICAgKGhhc093bihzdWJTY2hlbWEsICdpdGVtcycpIHx8IGhhc093bihzdWJTY2hlbWEsICdhZGRpdGlvbmFsSXRlbXMnKSlcbiAgICApIHtcbiAgICAgIGNvbnN0IGRhdGFQb2ludGVyID0gSnNvblBvaW50ZXIudG9EYXRhUG9pbnRlcihzdWJTY2hlbWFQb2ludGVyLCBjb21waWxlZFNjaGVtYSk7XG4gICAgICBpZiAoIWFycmF5TWFwLmhhcyhkYXRhUG9pbnRlcikpIHtcbiAgICAgICAgY29uc3QgdHVwbGVJdGVtcyA9IGlzQXJyYXkoc3ViU2NoZW1hLml0ZW1zKSA/IHN1YlNjaGVtYS5pdGVtcy5sZW5ndGggOiAwO1xuICAgICAgICBhcnJheU1hcC5zZXQoZGF0YVBvaW50ZXIsIHR1cGxlSXRlbXMpO1xuICAgICAgfVxuICAgIH1cbiAgfSwgdHJ1ZSk7XG4gIHJldHVybiBjb21waWxlZFNjaGVtYTtcbn1cblxuLyoqXG4gKiAnZ2V0U3ViU2NoZW1hJyBmdW5jdGlvblxuICpcbiAqIC8vICAgc2NoZW1hXG4gKiAvLyAgeyBQb2ludGVyIH0gcG9pbnRlclxuICogLy8gIHsgb2JqZWN0IH0gc2NoZW1hUmVmTGlicmFyeVxuICogLy8gIHsgTWFwPHN0cmluZywgc3RyaW5nPiB9IHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcFxuICogLy8gIHsgc3RyaW5nW10gPSBbXSB9IHVzZWRQb2ludGVyc1xuICogLy9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN1YlNjaGVtYShcbiAgc2NoZW1hLCBwb2ludGVyLCBzY2hlbWFSZWZMaWJyYXJ5ID0gbnVsbCxcbiAgc2NoZW1hUmVjdXJzaXZlUmVmTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbnVsbCwgdXNlZFBvaW50ZXJzOiBzdHJpbmdbXSA9IFtdXG4pIHtcbiAgaWYgKCFzY2hlbWFSZWZMaWJyYXJ5IHx8ICFzY2hlbWFSZWN1cnNpdmVSZWZNYXApIHtcbiAgICByZXR1cm4gSnNvblBvaW50ZXIuZ2V0Q29weShzY2hlbWEsIHBvaW50ZXIpO1xuICB9XG4gIGlmICh0eXBlb2YgcG9pbnRlciAhPT0gJ3N0cmluZycpIHsgcG9pbnRlciA9IEpzb25Qb2ludGVyLmNvbXBpbGUocG9pbnRlcik7IH1cbiAgdXNlZFBvaW50ZXJzID0gWyAuLi51c2VkUG9pbnRlcnMsIHBvaW50ZXIgXTtcbiAgbGV0IG5ld1NjaGVtYTogYW55ID0gbnVsbDtcbiAgaWYgKHBvaW50ZXIgPT09ICcnKSB7XG4gICAgbmV3U2NoZW1hID0gXy5jbG9uZURlZXAoc2NoZW1hKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBzaG9ydFBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKHBvaW50ZXIsIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCk7XG4gICAgaWYgKHNob3J0UG9pbnRlciAhPT0gcG9pbnRlcikgeyB1c2VkUG9pbnRlcnMgPSBbIC4uLnVzZWRQb2ludGVycywgc2hvcnRQb2ludGVyIF07IH1cbiAgICBuZXdTY2hlbWEgPSBKc29uUG9pbnRlci5nZXRGaXJzdENvcHkoW1xuICAgICAgW3NjaGVtYVJlZkxpYnJhcnksIFtzaG9ydFBvaW50ZXJdXSxcbiAgICAgIFtzY2hlbWEsIHBvaW50ZXJdLFxuICAgICAgW3NjaGVtYSwgc2hvcnRQb2ludGVyXVxuICAgIF0pO1xuICB9XG4gIHJldHVybiBKc29uUG9pbnRlci5mb3JFYWNoRGVlcENvcHkobmV3U2NoZW1hLCAoc3ViU2NoZW1hLCBzdWJQb2ludGVyKSA9PiB7XG4gICAgaWYgKGlzT2JqZWN0KHN1YlNjaGVtYSkpIHtcblxuICAgICAgLy8gUmVwbGFjZSBub24tcmVjdXJzaXZlICRyZWYgbGlua3Mgd2l0aCByZWZlcmVuY2VkIHNjaGVtYXNcbiAgICAgIGlmIChpc1N0cmluZyhzdWJTY2hlbWEuJHJlZikpIHtcbiAgICAgICAgY29uc3QgcmVmUG9pbnRlciA9IEpzb25Qb2ludGVyLmNvbXBpbGUoc3ViU2NoZW1hLiRyZWYpO1xuICAgICAgICBpZiAocmVmUG9pbnRlci5sZW5ndGggJiYgdXNlZFBvaW50ZXJzLmV2ZXJ5KHB0ciA9PlxuICAgICAgICAgICFKc29uUG9pbnRlci5pc1N1YlBvaW50ZXIocmVmUG9pbnRlciwgcHRyLCB0cnVlKVxuICAgICAgICApKSB7XG4gICAgICAgICAgY29uc3QgcmVmU2NoZW1hID0gZ2V0U3ViU2NoZW1hKFxuICAgICAgICAgICAgc2NoZW1hLCByZWZQb2ludGVyLCBzY2hlbWFSZWZMaWJyYXJ5LCBzY2hlbWFSZWN1cnNpdmVSZWZNYXAsIHVzZWRQb2ludGVyc1xuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHN1YlNjaGVtYSkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVmU2NoZW1hO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBleHRyYUtleXMgPSB7IC4uLnN1YlNjaGVtYSB9O1xuICAgICAgICAgICAgZGVsZXRlIGV4dHJhS2V5cy4kcmVmO1xuICAgICAgICAgICAgcmV0dXJuIG1lcmdlU2NoZW1hcyhyZWZTY2hlbWEsIGV4dHJhS2V5cyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IENvbnZlcnQgc2NoZW1hcyB3aXRoICd0eXBlJyBhcnJheXMgdG8gJ29uZU9mJ1xuXG4gICAgICAvLyBDb21iaW5lIGFsbE9mIHN1YlNjaGVtYXNcbiAgICAgIGlmIChpc0FycmF5KHN1YlNjaGVtYS5hbGxPZikpIHsgcmV0dXJuIGNvbWJpbmVBbGxPZihzdWJTY2hlbWEpOyB9XG5cbiAgICAgIC8vIEZpeCBpbmNvcnJlY3RseSBwbGFjZWQgYXJyYXkgb2JqZWN0IHJlcXVpcmVkIGxpc3RzXG4gICAgICBpZiAoc3ViU2NoZW1hLnR5cGUgPT09ICdhcnJheScgJiYgaXNBcnJheShzdWJTY2hlbWEucmVxdWlyZWQpKSB7XG4gICAgICAgIHJldHVybiBmaXhSZXF1aXJlZEFycmF5UHJvcGVydGllcyhzdWJTY2hlbWEpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3ViU2NoZW1hO1xuICB9LCB0cnVlLCA8c3RyaW5nPnBvaW50ZXIpO1xufVxuXG4vKipcbiAqICdjb21iaW5lQWxsT2YnIGZ1bmN0aW9uXG4gKlxuICogQXR0ZW1wdCB0byBjb252ZXJ0IGFuIGFsbE9mIHNjaGVtYSBvYmplY3QgaW50b1xuICogYSBub24tYWxsT2Ygc2NoZW1hIG9iamVjdCB3aXRoIGVxdWl2YWxlbnQgcnVsZXMuXG4gKlxuICogLy8gICBzY2hlbWEgLSBhbGxPZiBzY2hlbWEgb2JqZWN0XG4gKiAvLyAgLSBjb252ZXJ0ZWQgc2NoZW1hIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZUFsbE9mKHNjaGVtYSkge1xuICBpZiAoIWlzT2JqZWN0KHNjaGVtYSkgfHwgIWlzQXJyYXkoc2NoZW1hLmFsbE9mKSkgeyByZXR1cm4gc2NoZW1hOyB9XG4gIGxldCBtZXJnZWRTY2hlbWEgPSBtZXJnZVNjaGVtYXMoLi4uc2NoZW1hLmFsbE9mKTtcbiAgaWYgKE9iamVjdC5rZXlzKHNjaGVtYSkubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IGV4dHJhS2V5cyA9IHsgLi4uc2NoZW1hIH07XG4gICAgZGVsZXRlIGV4dHJhS2V5cy5hbGxPZjtcbiAgICBtZXJnZWRTY2hlbWEgPSBtZXJnZVNjaGVtYXMobWVyZ2VkU2NoZW1hLCBleHRyYUtleXMpO1xuICB9XG4gIHJldHVybiBtZXJnZWRTY2hlbWE7XG59XG5cbi8qKlxuICogJ2ZpeFJlcXVpcmVkQXJyYXlQcm9wZXJ0aWVzJyBmdW5jdGlvblxuICpcbiAqIEZpeGVzIGFuIGluY29ycmVjdGx5IHBsYWNlZCByZXF1aXJlZCBsaXN0IGluc2lkZSBhbiBhcnJheSBzY2hlbWEsIGJ5IG1vdmluZ1xuICogaXQgaW50byBpdGVtcy5wcm9wZXJ0aWVzIG9yIGFkZGl0aW9uYWxJdGVtcy5wcm9wZXJ0aWVzLCB3aGVyZSBpdCBiZWxvbmdzLlxuICpcbiAqIC8vICAgc2NoZW1hIC0gYWxsT2Ygc2NoZW1hIG9iamVjdFxuICogLy8gIC0gY29udmVydGVkIHNjaGVtYSBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpeFJlcXVpcmVkQXJyYXlQcm9wZXJ0aWVzKHNjaGVtYSkge1xuICBpZiAoc2NoZW1hLnR5cGUgPT09ICdhcnJheScgJiYgaXNBcnJheShzY2hlbWEucmVxdWlyZWQpKSB7XG4gICAgY29uc3QgaXRlbXNPYmplY3QgPSBoYXNPd24oc2NoZW1hLml0ZW1zLCAncHJvcGVydGllcycpID8gJ2l0ZW1zJyA6XG4gICAgICBoYXNPd24oc2NoZW1hLmFkZGl0aW9uYWxJdGVtcywgJ3Byb3BlcnRpZXMnKSA/ICdhZGRpdGlvbmFsSXRlbXMnIDogbnVsbDtcbiAgICBpZiAoaXRlbXNPYmplY3QgJiYgIWhhc093bihzY2hlbWFbaXRlbXNPYmplY3RdLCAncmVxdWlyZWQnKSAmJiAoXG4gICAgICBoYXNPd24oc2NoZW1hW2l0ZW1zT2JqZWN0XSwgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJykgfHxcbiAgICAgIHNjaGVtYS5yZXF1aXJlZC5ldmVyeShrZXkgPT4gaGFzT3duKHNjaGVtYVtpdGVtc09iamVjdF0ucHJvcGVydGllcywga2V5KSlcbiAgICApKSB7XG4gICAgICBzY2hlbWEgPSBfLmNsb25lRGVlcChzY2hlbWEpO1xuICAgICAgc2NoZW1hW2l0ZW1zT2JqZWN0XS5yZXF1aXJlZCA9IHNjaGVtYS5yZXF1aXJlZDtcbiAgICAgIGRlbGV0ZSBzY2hlbWEucmVxdWlyZWQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBzY2hlbWE7XG59XG4iXX0=