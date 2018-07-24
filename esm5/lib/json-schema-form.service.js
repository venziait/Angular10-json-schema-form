import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as Ajv from 'ajv';
import * as _ from 'lodash';
import { hasValue, isArray, isDefined, isEmpty, isObject } from './shared/validator.functions';
import { fixTitle, forEach, hasOwn, toTitleCase } from './shared/utility.functions';
import { JsonPointer } from './shared/jsonpointer.functions';
import { buildSchemaFromData, buildSchemaFromLayout, removeRecursiveReferences } from './shared/json-schema.functions';
import { buildFormGroup, buildFormGroupTemplate, formatFormData, getControl } from './shared/form-group.functions';
import { buildLayout, getLayoutNode } from './shared/layout.functions';
import { enValidationMessages } from './locale/en-validation-messages';
import { frValidationMessages } from './locale/fr-validation-messages';
var JsonSchemaFormService = /** @class */ (function () {
    function JsonSchemaFormService() {
        this.JsonFormCompatibility = false;
        this.ReactJsonSchemaFormCompatibility = false;
        this.AngularSchemaFormCompatibility = false;
        this.tpldata = {};
        this.ajvOptions = { allErrors: true, jsonPointers: true, unknownFormats: 'ignore' };
        this.ajv = new Ajv(this.ajvOptions); // AJV: Another JSON Schema Validator
        this.validateFormData = null; // Compiled AJV function to validate active form's schema
        this.formValues = {}; // Internal form data (may not have correct types)
        this.data = {}; // Output form data (formValues, formatted with correct data types)
        this.schema = {}; // Internal JSON Schema
        this.layout = []; // Internal form layout
        this.formGroupTemplate = {}; // Template used to create formGroup
        this.formGroup = null; // Angular formGroup, which powers the reactive form
        this.framework = null; // Active framework component
        this.validData = null; // Valid form data (or null) (=== isValid ? data : null)
        this.isValid = null; // Is current form data valid?
        this.ajvErrors = null; // Ajv errors for current data
        this.validationErrors = null; // Any validation errors for current data
        this.dataErrors = new Map(); //
        this.formValueSubscription = null; // Subscription to formGroup.valueChanges observable (for un- and re-subscribing)
        this.dataChanges = new Subject(); // Form data observable
        this.isValidChanges = new Subject(); // isValid observable
        this.validationErrorChanges = new Subject(); // validationErrors observable
        this.arrayMap = new Map(); // Maps arrays in data object and number of tuple values
        this.dataMap = new Map(); // Maps paths in form data to schema and formGroup paths
        this.dataRecursiveRefMap = new Map(); // Maps recursive reference points in form data
        this.schemaRecursiveRefMap = new Map(); // Maps recursive reference points in schema
        this.schemaRefLibrary = {}; // Library of schemas for resolving schema $refs
        this.layoutRefLibrary = { '': null }; // Library of layout nodes for adding to form
        this.templateRefLibrary = {}; // Library of formGroup templates for adding to form
        this.hasRootReference = false; // Does the form include a recursive reference to itself?
        this.language = 'en-US'; // Does the form include a recursive reference to itself?
        // Default global form options
        this.defaultFormOptions = {
            addSubmit: 'auto',
            // for addSubmit: true = always, false = never,
            // 'auto' = only if layout is undefined (form is built from schema alone)
            debug: false,
            disableInvalidSubmit: true,
            formDisabled: false,
            formReadonly: false,
            fieldsRequired: false,
            framework: 'no-framework',
            loadExternalAssets: false,
            pristine: { errors: true, success: true },
            supressPropertyTitles: false,
            setSchemaDefaults: 'auto',
            // true = always set (unless overridden by layout default or formValues)
            // false = never set
            // 'auto' = set in addable components, and everywhere if formValues not set
            setLayoutDefaults: 'auto',
            // true = always set (unless overridden by formValues)
            // false = never set
            // 'auto' = set in addable components, and everywhere if formValues not set
            validateOnRender: 'auto',
            // true = validate all fields immediately
            // false = only validate fields after they are touched by user
            // 'auto' = validate fields with values immediately, empty fields after they are touched
            widgets: {},
            defautWidgetOptions: {
                listItems: 1,
                addable: true,
                orderable: true,
                removable: true,
                enableErrorState: true,
                // disableErrorState: false, // Don't apply 'has-error' class when field fails validation?
                enableSuccessState: true,
                // disableSuccessState: false, // Don't apply 'has-success' class when field validates?
                feedback: false,
                feedbackOnRender: false,
                notitle: false,
                disabled: false,
                readonly: false,
                returnEmptyFields: true,
                validationMessages: {} // set by setLanguage()
            },
        };
        this.setLanguage(this.language);
    }
    JsonSchemaFormService.prototype.setLanguage = function (language) {
        if (language === void 0) { language = 'en-US'; }
        this.language = language;
        var validationMessages = language.slice(0, 2) === 'fr' ?
            frValidationMessages : enValidationMessages;
        this.defaultFormOptions.defautWidgetOptions.validationMessages =
            _.cloneDeep(validationMessages);
    };
    JsonSchemaFormService.prototype.getData = function () { return this.data; };
    JsonSchemaFormService.prototype.getSchema = function () { return this.schema; };
    JsonSchemaFormService.prototype.getLayout = function () { return this.layout; };
    JsonSchemaFormService.prototype.resetAllValues = function () {
        this.JsonFormCompatibility = false;
        this.ReactJsonSchemaFormCompatibility = false;
        this.AngularSchemaFormCompatibility = false;
        this.tpldata = {};
        this.validateFormData = null;
        this.formValues = {};
        this.schema = {};
        this.layout = [];
        this.formGroupTemplate = {};
        this.formGroup = null;
        this.framework = null;
        this.data = {};
        this.validData = null;
        this.isValid = null;
        this.validationErrors = null;
        this.arrayMap = new Map();
        this.dataMap = new Map();
        this.dataRecursiveRefMap = new Map();
        this.schemaRecursiveRefMap = new Map();
        this.layoutRefLibrary = {};
        this.schemaRefLibrary = {};
        this.templateRefLibrary = {};
        this.formOptions = _.cloneDeep(this.defaultFormOptions);
    };
    /**
     * 'buildRemoteError' function
     *
     * Example errors:
     * {
     *   last_name: [ {
     *     message: 'Last name must by start with capital letter.',
     *     code: 'capital_letter'
     *   } ],
     *   email: [ {
     *     message: 'Email must be from example.com domain.',
     *     code: 'special_domain'
     *   }, {
     *     message: 'Email must contain an @ symbol.',
     *     code: 'at_symbol'
     *   } ]
     * }
     * //{ErrorMessages} errors
     */
    JsonSchemaFormService.prototype.buildRemoteError = function (errors) {
        var _this = this;
        forEach(errors, function (value, key) {
            if (key in _this.formGroup.controls) {
                try {
                    for (var value_1 = tslib_1.__values(value), value_1_1 = value_1.next(); !value_1_1.done; value_1_1 = value_1.next()) {
                        var error = value_1_1.value;
                        var err = {};
                        err[error['code']] = error['message'];
                        _this.formGroup.get(key).setErrors(err, { emitEvent: true });
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (value_1_1 && !value_1_1.done && (_a = value_1.return)) _a.call(value_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            var e_1, _a;
        });
    };
    JsonSchemaFormService.prototype.validateData = function (newValue, updateSubscriptions) {
        if (updateSubscriptions === void 0) { updateSubscriptions = true; }
        // Format raw form data to correct data types
        this.data = formatFormData(newValue, this.dataMap, this.dataRecursiveRefMap, this.arrayMap, this.formOptions.returnEmptyFields);
        this.isValid = this.validateFormData(this.data);
        this.validData = this.isValid ? this.data : null;
        var compileErrors = function (errors) {
            var compiledErrors = {};
            (errors || []).forEach(function (error) {
                if (!compiledErrors[error.dataPath]) {
                    compiledErrors[error.dataPath] = [];
                }
                compiledErrors[error.dataPath].push(error.message);
            });
            return compiledErrors;
        };
        this.ajvErrors = this.validateFormData.errors;
        this.validationErrors = compileErrors(this.validateFormData.errors);
        if (updateSubscriptions) {
            this.dataChanges.next(this.data);
            this.isValidChanges.next(this.isValid);
            this.validationErrorChanges.next(this.ajvErrors);
        }
    };
    JsonSchemaFormService.prototype.buildFormGroupTemplate = function (formValues, setValues) {
        if (formValues === void 0) { formValues = null; }
        if (setValues === void 0) { setValues = true; }
        this.formGroupTemplate = buildFormGroupTemplate(this, formValues, setValues);
    };
    JsonSchemaFormService.prototype.buildFormGroup = function () {
        var _this = this;
        this.formGroup = buildFormGroup(this.formGroupTemplate);
        if (this.formGroup) {
            this.compileAjvSchema();
            this.validateData(this.formGroup.value);
            // Set up observables to emit data and validation info when form data changes
            if (this.formValueSubscription) {
                this.formValueSubscription.unsubscribe();
            }
            this.formValueSubscription = this.formGroup.valueChanges
                .subscribe(function (formValue) { return _this.validateData(formValue); });
        }
    };
    JsonSchemaFormService.prototype.buildLayout = function (widgetLibrary) {
        this.layout = buildLayout(this, widgetLibrary);
    };
    JsonSchemaFormService.prototype.setOptions = function (newOptions) {
        if (isObject(newOptions)) {
            var addOptions = _.cloneDeep(newOptions);
            // Backward compatibility for 'defaultOptions' (renamed 'defautWidgetOptions')
            if (isObject(addOptions.defaultOptions)) {
                Object.assign(this.formOptions.defautWidgetOptions, addOptions.defaultOptions);
                delete addOptions.defaultOptions;
            }
            if (isObject(addOptions.defautWidgetOptions)) {
                Object.assign(this.formOptions.defautWidgetOptions, addOptions.defautWidgetOptions);
                delete addOptions.defautWidgetOptions;
            }
            Object.assign(this.formOptions, addOptions);
            // convert disableErrorState / disableSuccessState to enable...
            var globalDefaults_1 = this.formOptions.defautWidgetOptions;
            ['ErrorState', 'SuccessState']
                .filter(function (suffix) { return hasOwn(globalDefaults_1, 'disable' + suffix); })
                .forEach(function (suffix) {
                globalDefaults_1['enable' + suffix] = !globalDefaults_1['disable' + suffix];
                delete globalDefaults_1['disable' + suffix];
            });
        }
    };
    JsonSchemaFormService.prototype.compileAjvSchema = function () {
        if (!this.validateFormData) {
            // if 'ui:order' exists in properties, move it to root before compiling with ajv
            if (Array.isArray(this.schema.properties['ui:order'])) {
                this.schema['ui:order'] = this.schema.properties['ui:order'];
                delete this.schema.properties['ui:order'];
            }
            this.ajv.removeSchema(this.schema);
            this.validateFormData = this.ajv.compile(this.schema);
        }
    };
    JsonSchemaFormService.prototype.buildSchemaFromData = function (data, requireAllFields) {
        if (requireAllFields === void 0) { requireAllFields = false; }
        if (data) {
            return buildSchemaFromData(data, requireAllFields);
        }
        this.schema = buildSchemaFromData(this.formValues, requireAllFields);
    };
    JsonSchemaFormService.prototype.buildSchemaFromLayout = function (layout) {
        if (layout) {
            return buildSchemaFromLayout(layout);
        }
        this.schema = buildSchemaFromLayout(this.layout);
    };
    JsonSchemaFormService.prototype.setTpldata = function (newTpldata) {
        if (newTpldata === void 0) { newTpldata = {}; }
        this.tpldata = newTpldata;
    };
    JsonSchemaFormService.prototype.parseText = function (text, value, values, key) {
        var _this = this;
        if (text === void 0) { text = ''; }
        if (value === void 0) { value = {}; }
        if (values === void 0) { values = {}; }
        if (key === void 0) { key = null; }
        if (!text || !/{{.+?}}/.test(text)) {
            return text;
        }
        return text.replace(/{{(.+?)}}/g, function () {
            var a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                a[_i] = arguments[_i];
            }
            return _this.parseExpression(a[1], value, values, key, _this.tpldata);
        });
    };
    JsonSchemaFormService.prototype.parseExpression = function (expression, value, values, key, tpldata) {
        var _this = this;
        if (expression === void 0) { expression = ''; }
        if (value === void 0) { value = {}; }
        if (values === void 0) { values = {}; }
        if (key === void 0) { key = null; }
        if (tpldata === void 0) { tpldata = null; }
        if (typeof expression !== 'string') {
            return '';
        }
        var index = typeof key === 'number' ? (key + 1) + '' : (key || '');
        expression = expression.trim();
        if ((expression[0] === '\'' || expression[0] === '"') &&
            expression[0] === expression[expression.length - 1] &&
            expression.slice(1, expression.length - 1).indexOf(expression[0]) === -1) {
            return expression.slice(1, expression.length - 1);
        }
        if (expression === 'idx' || expression === '$index') {
            return index;
        }
        if (expression === 'value' && !hasOwn(values, 'value')) {
            return value;
        }
        if (['"', '\'', ' ', '||', '&&', '+'].every(function (delim) { return expression.indexOf(delim) === -1; })) {
            var pointer = JsonPointer.parseObjectPath(expression);
            return pointer[0] === 'value' && JsonPointer.has(value, pointer.slice(1)) ?
                JsonPointer.get(value, pointer.slice(1)) :
                pointer[0] === 'values' && JsonPointer.has(values, pointer.slice(1)) ?
                    JsonPointer.get(values, pointer.slice(1)) :
                    pointer[0] === 'tpldata' && JsonPointer.has(tpldata, pointer.slice(1)) ?
                        JsonPointer.get(tpldata, pointer.slice(1)) :
                        JsonPointer.has(values, pointer) ? JsonPointer.get(values, pointer) : '';
        }
        if (expression.indexOf('[idx]') > -1) {
            expression = expression.replace(/\[idx\]/g, index);
        }
        if (expression.indexOf('[$index]') > -1) {
            expression = expression.replace(/\[$index\]/g, index);
        }
        // TODO: Improve expression evaluation by parsing quoted strings first
        // let expressionArray = expression.match(/([^"']+|"[^"]+"|'[^']+')/g);
        if (expression.indexOf('||') > -1) {
            return expression.split('||').reduce(function (all, term) {
                return all || _this.parseExpression(term, value, values, key, tpldata);
            }, '');
        }
        if (expression.indexOf('&&') > -1) {
            return expression.split('&&').reduce(function (all, term) {
                return all && _this.parseExpression(term, value, values, key, tpldata);
            }, ' ').trim();
        }
        if (expression.indexOf('+') > -1) {
            return expression.split('+')
                .map(function (term) { return _this.parseExpression(term, value, values, key, tpldata); })
                .join('');
        }
        return '';
    };
    JsonSchemaFormService.prototype.setArrayItemTitle = function (parentCtx, childNode, index) {
        if (parentCtx === void 0) { parentCtx = {}; }
        if (childNode === void 0) { childNode = null; }
        if (index === void 0) { index = null; }
        var parentNode = parentCtx.layoutNode;
        var parentValues = this.getFormControlValue(parentCtx);
        var isArrayItem = (parentNode.type || '').slice(-5) === 'array' && isArray(parentValues);
        var text = JsonPointer.getFirst(isArrayItem && childNode.type !== '$ref' ? [
            [childNode, '/options/legend'],
            [childNode, '/options/title'],
            [parentNode, '/options/title'],
            [parentNode, '/options/legend'],
        ] : [
            [childNode, '/options/title'],
            [childNode, '/options/legend'],
            [parentNode, '/options/title'],
            [parentNode, '/options/legend']
        ]);
        if (!text) {
            return text;
        }
        var childValue = isArray(parentValues) && index < parentValues.length ?
            parentValues[index] : parentValues;
        return this.parseText(text, childValue, parentValues, index);
    };
    JsonSchemaFormService.prototype.setItemTitle = function (ctx) {
        return !ctx.options.title && /^(\d+|-)$/.test(ctx.layoutNode.name) ?
            null :
            this.parseText(ctx.options.title || toTitleCase(ctx.layoutNode.name), this.getFormControlValue(this), (this.getFormControlGroup(this) || {}).value, ctx.dataIndex[ctx.dataIndex.length - 1]);
    };
    JsonSchemaFormService.prototype.evaluateCondition = function (layoutNode, dataIndex) {
        var arrayIndex = dataIndex && dataIndex[dataIndex.length - 1];
        var result = true;
        if (hasValue((layoutNode.options || {}).condition)) {
            if (typeof layoutNode.options.condition === 'string') {
                var pointer = layoutNode.options.condition;
                if (hasValue(arrayIndex)) {
                    pointer = pointer.replace('[arrayIndex]', "[" + arrayIndex + "]");
                }
                pointer = JsonPointer.parseObjectPath(pointer);
                result = !!JsonPointer.get(this.data, pointer);
                if (!result && pointer[0] === 'model') {
                    result = !!JsonPointer.get({ model: this.data }, pointer);
                }
            }
            else if (typeof layoutNode.options.condition === 'function') {
                result = layoutNode.options.condition(this.data);
            }
            else if (typeof layoutNode.options.condition.functionBody === 'string') {
                try {
                    var dynFn = new Function('model', 'arrayIndices', layoutNode.options.condition.functionBody);
                    result = dynFn(this.data, dataIndex);
                }
                catch (e) {
                    result = true;
                    console.error('condition functionBody errored out on evaluation: ' + layoutNode.options.condition.functionBody);
                }
            }
        }
        return result;
    };
    JsonSchemaFormService.prototype.initializeControl = function (ctx, bind) {
        var _this = this;
        if (bind === void 0) { bind = true; }
        if (!isObject(ctx)) {
            return false;
        }
        if (isEmpty(ctx.options)) {
            ctx.options = !isEmpty((ctx.layoutNode || {}).options) ?
                ctx.layoutNode.options : _.cloneDeep(this.formOptions);
        }
        ctx.formControl = this.getFormControl(ctx);
        ctx.boundControl = bind && !!ctx.formControl;
        if (ctx.formControl) {
            ctx.controlName = this.getFormControlName(ctx);
            ctx.controlValue = ctx.formControl.value;
            ctx.controlDisabled = ctx.formControl.disabled;
            ctx.options.errorMessage = ctx.formControl.status === 'VALID' ? null :
                this.formatErrors(ctx.formControl.errors, ctx.options.validationMessages);
            ctx.options.showErrors = this.formOptions.validateOnRender === true ||
                (this.formOptions.validateOnRender === 'auto' && hasValue(ctx.controlValue));
            ctx.formControl.statusChanges.subscribe(function (status) {
                return ctx.options.errorMessage = status === 'VALID' ? null :
                    _this.formatErrors(ctx.formControl.errors, ctx.options.validationMessages);
            });
            ctx.formControl.valueChanges.subscribe(function (value) {
                if (!_.isEqual(ctx.controlValue, value)) {
                    ctx.controlValue = value;
                }
            });
        }
        else {
            ctx.controlName = ctx.layoutNode.name;
            ctx.controlValue = ctx.layoutNode.value || null;
            var dataPointer = this.getDataPointer(ctx);
            if (bind && dataPointer) {
                console.error("warning: control \"" + dataPointer + "\" is not bound to the Angular FormGroup.");
            }
        }
        return ctx.boundControl;
    };
    JsonSchemaFormService.prototype.formatErrors = function (errors, validationMessages) {
        if (validationMessages === void 0) { validationMessages = {}; }
        if (isEmpty(errors)) {
            return null;
        }
        if (!isObject(validationMessages)) {
            validationMessages = {};
        }
        var addSpaces = function (string) { return string[0].toUpperCase() + (string.slice(1) || '')
            .replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' '); };
        var formatError = function (error) { return typeof error === 'object' ?
            Object.keys(error).map(function (key) {
                return error[key] === true ? addSpaces(key) :
                    error[key] === false ? 'Not ' + addSpaces(key) :
                        addSpaces(key) + ': ' + formatError(error[key]);
            }).join(', ') :
            addSpaces(error.toString()); };
        var messages = [];
        return Object.keys(errors)
            .filter(function (errorKey) { return errorKey !== 'required' || Object.keys(errors).length === 1; })
            .map(function (errorKey) {
            // If validationMessages is a string, return it
            return typeof validationMessages === 'string' ? validationMessages :
                // If custom error message is a function, return function result
                typeof validationMessages[errorKey] === 'function' ?
                    validationMessages[errorKey](errors[errorKey]) :
                    // If custom error message is a string, replace placeholders and return
                    typeof validationMessages[errorKey] === 'string' ?
                        // Does error message have any {{property}} placeholders?
                        !/{{.+?}}/.test(validationMessages[errorKey]) ?
                            validationMessages[errorKey] :
                            // Replace {{property}} placeholders with values
                            Object.keys(errors[errorKey])
                                .reduce(function (errorMessage, errorProperty) { return errorMessage.replace(new RegExp('{{' + errorProperty + '}}', 'g'), errors[errorKey][errorProperty]); }, validationMessages[errorKey]) :
                        // If no custom error message, return formatted error data instead
                        addSpaces(errorKey) + ' Error: ' + formatError(errors[errorKey]);
        }).join('<br>');
    };
    JsonSchemaFormService.prototype.updateValue = function (ctx, value) {
        // Set value of current control
        ctx.controlValue = value;
        if (ctx.boundControl) {
            ctx.formControl.setValue(value);
            ctx.formControl.markAsDirty();
        }
        ctx.layoutNode.value = value;
        // Set values of any related controls in copyValueTo array
        if (isArray(ctx.options.copyValueTo)) {
            try {
                for (var _a = tslib_1.__values(ctx.options.copyValueTo), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var item = _b.value;
                    var targetControl = getControl(this.formGroup, item);
                    if (isObject(targetControl) && typeof targetControl.setValue === 'function') {
                        targetControl.setValue(value);
                        targetControl.markAsDirty();
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        var e_2, _c;
    };
    JsonSchemaFormService.prototype.updateArrayCheckboxList = function (ctx, checkboxList) {
        var formArray = this.getFormControl(ctx);
        // Remove all existing items
        while (formArray.value.length) {
            formArray.removeAt(0);
        }
        // Re-add an item for each checked box
        var refPointer = removeRecursiveReferences(ctx.layoutNode.dataPointer + '/-', this.dataRecursiveRefMap, this.arrayMap);
        try {
            for (var checkboxList_1 = tslib_1.__values(checkboxList), checkboxList_1_1 = checkboxList_1.next(); !checkboxList_1_1.done; checkboxList_1_1 = checkboxList_1.next()) {
                var checkboxItem = checkboxList_1_1.value;
                if (checkboxItem.checked) {
                    var newFormControl = buildFormGroup(this.templateRefLibrary[refPointer]);
                    newFormControl.setValue(checkboxItem.value);
                    formArray.push(newFormControl);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (checkboxList_1_1 && !checkboxList_1_1.done && (_a = checkboxList_1.return)) _a.call(checkboxList_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        formArray.markAsDirty();
        var e_3, _a;
    };
    JsonSchemaFormService.prototype.getFormControl = function (ctx) {
        if (!ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) ||
            ctx.layoutNode.type === '$ref') {
            return null;
        }
        return getControl(this.formGroup, this.getDataPointer(ctx));
    };
    JsonSchemaFormService.prototype.getFormControlValue = function (ctx) {
        if (!ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) ||
            ctx.layoutNode.type === '$ref') {
            return null;
        }
        var control = getControl(this.formGroup, this.getDataPointer(ctx));
        return control ? control.value : null;
    };
    JsonSchemaFormService.prototype.getFormControlGroup = function (ctx) {
        if (!ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer)) {
            return null;
        }
        return getControl(this.formGroup, this.getDataPointer(ctx), true);
    };
    JsonSchemaFormService.prototype.getFormControlName = function (ctx) {
        if (!ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) || !hasValue(ctx.dataIndex)) {
            return null;
        }
        return JsonPointer.toKey(this.getDataPointer(ctx));
    };
    JsonSchemaFormService.prototype.getLayoutArray = function (ctx) {
        return JsonPointer.get(this.layout, this.getLayoutPointer(ctx), 0, -1);
    };
    JsonSchemaFormService.prototype.getParentNode = function (ctx) {
        return JsonPointer.get(this.layout, this.getLayoutPointer(ctx), 0, -2);
    };
    JsonSchemaFormService.prototype.getDataPointer = function (ctx) {
        if (!ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) || !hasValue(ctx.dataIndex)) {
            return null;
        }
        return JsonPointer.toIndexedPointer(ctx.layoutNode.dataPointer, ctx.dataIndex, this.arrayMap);
    };
    JsonSchemaFormService.prototype.getLayoutPointer = function (ctx) {
        if (!hasValue(ctx.layoutIndex)) {
            return null;
        }
        return '/' + ctx.layoutIndex.join('/items/');
    };
    JsonSchemaFormService.prototype.isControlBound = function (ctx) {
        if (!ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) || !hasValue(ctx.dataIndex)) {
            return false;
        }
        var controlGroup = this.getFormControlGroup(ctx);
        var name = this.getFormControlName(ctx);
        return controlGroup ? hasOwn(controlGroup.controls, name) : false;
    };
    JsonSchemaFormService.prototype.addItem = function (ctx, name) {
        if (!ctx.layoutNode || !isDefined(ctx.layoutNode.$ref) ||
            !hasValue(ctx.dataIndex) || !hasValue(ctx.layoutIndex)) {
            return false;
        }
        // Create a new Angular form control from a template in templateRefLibrary
        var newFormGroup = buildFormGroup(this.templateRefLibrary[ctx.layoutNode.$ref]);
        // Add the new form control to the parent formArray or formGroup
        if (ctx.layoutNode.arrayItem) {
            this.getFormControlGroup(ctx).push(newFormGroup);
        }
        else {
            this.getFormControlGroup(ctx)
                .addControl(name || this.getFormControlName(ctx), newFormGroup);
        }
        // Copy a new layoutNode from layoutRefLibrary
        var newLayoutNode = getLayoutNode(ctx.layoutNode, this);
        newLayoutNode.arrayItem = ctx.layoutNode.arrayItem;
        if (ctx.layoutNode.arrayItemType) {
            newLayoutNode.arrayItemType = ctx.layoutNode.arrayItemType;
        }
        else {
            delete newLayoutNode.arrayItemType;
        }
        if (name) {
            newLayoutNode.name = name;
            newLayoutNode.dataPointer += '/' + JsonPointer.escape(name);
            newLayoutNode.options.title = fixTitle(name);
        }
        // Add the new layoutNode to the form layout
        JsonPointer.insert(this.layout, this.getLayoutPointer(ctx), newLayoutNode);
        return true;
    };
    JsonSchemaFormService.prototype.moveArrayItem = function (ctx, oldIndex, newIndex) {
        if (!ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex) || !hasValue(ctx.layoutIndex) ||
            !isDefined(oldIndex) || !isDefined(newIndex) || oldIndex === newIndex) {
            return false;
        }
        // Move item in the formArray
        var formArray = this.getFormControlGroup(ctx);
        var arrayItem = formArray.at(oldIndex);
        formArray.removeAt(oldIndex);
        formArray.insert(newIndex, arrayItem);
        formArray.updateValueAndValidity();
        // Move layout item
        var layoutArray = this.getLayoutArray(ctx);
        layoutArray.splice(newIndex, 0, layoutArray.splice(oldIndex, 1)[0]);
        return true;
    };
    JsonSchemaFormService.prototype.removeItem = function (ctx) {
        if (!ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex) || !hasValue(ctx.layoutIndex)) {
            return false;
        }
        // Remove the Angular form control from the parent formArray or formGroup
        if (ctx.layoutNode.arrayItem) {
            this.getFormControlGroup(ctx)
                .removeAt(ctx.dataIndex[ctx.dataIndex.length - 1]);
        }
        else {
            this.getFormControlGroup(ctx)
                .removeControl(this.getFormControlName(ctx));
        }
        // Remove layoutNode from layout
        JsonPointer.remove(this.layout, this.getLayoutPointer(ctx));
        return true;
    };
    JsonSchemaFormService = tslib_1.__decorate([
        Injectable(),
        tslib_1.__metadata("design:paramtypes", [])
    ], JsonSchemaFormService);
    return JsonSchemaFormService;
}());
export { JsonSchemaFormService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjYtanNvbi1zY2hlbWEtZm9ybS8iLCJzb3VyY2VzIjpbImxpYi9qc29uLXNjaGVtYS1mb3JtLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHM0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUUvQixPQUFPLEtBQUssR0FBRyxNQUFNLEtBQUssQ0FBQztBQUMzQixPQUFPLEtBQUssQ0FBQyxNQUFNLFFBQVEsQ0FBQztBQUU1QixPQUFPLEVBQ0wsUUFBUSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFDaEQsTUFBTSw4QkFBOEIsQ0FBQztBQUN0QyxPQUFPLEVBQ0wsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUN2QyxNQUFNLDRCQUE0QixDQUFDO0FBQ3BDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUM3RCxPQUFPLEVBQ0wsbUJBQW1CLEVBQUUscUJBQXFCLEVBQUUseUJBQXlCLEVBRXRFLE1BQU0sZ0NBQWdDLENBQUM7QUFDeEMsT0FBTyxFQUNMLGNBQWMsRUFBRSxzQkFBc0IsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUNuRSxNQUFNLCtCQUErQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdkUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDdkUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFXdkU7SUFzRkU7UUFyRkEsMEJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBQzlCLHFDQUFnQyxHQUFHLEtBQUssQ0FBQztRQUN6QyxtQ0FBOEIsR0FBRyxLQUFL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RUFBRTs7T0FDQSxxQkFBcUIsQ0ErbkJqQztJQUFELDRCQUFDO0NBQUEsQUEvbkJELElBK25CQztTQS9uQlkscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWJzdHJhY3RDb250cm9sLCBGb3JtQXJyYXksIEZvcm1Hcm91cCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IGZpbHRlciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0ICogYXMgQWp2IGZyb20gJ2Fqdic7XG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCB7XG4gIGhhc1ZhbHVlLCBpc0FycmF5LCBpc0RlZmluZWQsIGlzRW1wdHksIGlzT2JqZWN0LCBpc1N0cmluZ1xufSBmcm9tICcuL3NoYXJlZC92YWxpZGF0b3IuZnVuY3Rpb25zJztcbmltcG9ydCB7XG4gIGZpeFRpdGxlLCBmb3JFYWNoLCBoYXNPd24sIHRvVGl0bGVDYXNlXG59IGZyb20gJy4vc2hhcmVkL3V0aWxpdHkuZnVuY3Rpb25zJztcbmltcG9ydCB7IEpzb25Qb2ludGVyIH0gZnJvbSAnLi9zaGFyZWQvanNvbnBvaW50ZXIuZnVuY3Rpb25zJztcbmltcG9ydCB7XG4gIGJ1aWxkU2NoZW1hRnJvbURhdGEsIGJ1aWxkU2NoZW1hRnJvbUxheW91dCwgcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyxcbiAgcmVzb2x2ZVNjaGVtYVJlZmVyZW5jZXNcbn0gZnJvbSAnLi9zaGFyZWQvanNvbi1zY2hlbWEuZnVuY3Rpb25zJztcbmltcG9ydCB7XG4gIGJ1aWxkRm9ybUdyb3VwLCBidWlsZEZvcm1Hcm91cFRlbXBsYXRlLCBmb3JtYXRGb3JtRGF0YSwgZ2V0Q29udHJvbFxufSBmcm9tICcuL3NoYXJlZC9mb3JtLWdyb3VwLmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBidWlsZExheW91dCwgZ2V0TGF5b3V0Tm9kZSB9IGZyb20gJy4vc2hhcmVkL2xheW91dC5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgZW5WYWxpZGF0aW9uTWVzc2FnZXMgfSBmcm9tICcuL2xvY2FsZS9lbi12YWxpZGF0aW9uLW1lc3NhZ2VzJztcbmltcG9ydCB7IGZyVmFsaWRhdGlvbk1lc3NhZ2VzIH0gZnJvbSAnLi9sb2NhbGUvZnItdmFsaWRhdGlvbi1tZXNzYWdlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGl0bGVNYXBJdGVtIHtcbiAgbmFtZT86IHN0cmluZzsgdmFsdWU/OiBhbnk7IGNoZWNrZWQ/OiBib29sZWFuOyBncm91cD86IHN0cmluZzsgaXRlbXM/OiBUaXRsZU1hcEl0ZW1bXTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRXJyb3JNZXNzYWdlcyB7XG4gIFtjb250cm9sX25hbWU6IHN0cmluZ106IHsgbWVzc2FnZTogc3RyaW5nfEZ1bmN0aW9ufE9iamVjdCwgY29kZTogc3RyaW5nIH1bXTtcbn1cblxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIHtcbiAgSnNvbkZvcm1Db21wYXRpYmlsaXR5ID0gZmFsc2U7XG4gIFJlYWN0SnNvblNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gZmFsc2U7XG4gIEFuZ3VsYXJTY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IGZhbHNlO1xuICB0cGxkYXRhOiBhbnkgPSB7fTtcblxuICBhanZPcHRpb25zOiBhbnkgPSB7IGFsbEVycm9yczogdHJ1ZSwganNvblBvaW50ZXJzOiB0cnVlLCB1bmtub3duRm9ybWF0czogJ2lnbm9yZScgfTtcbiAgYWp2OiBhbnkgPSBuZXcgQWp2KHRoaXMuYWp2T3B0aW9ucyk7IC8vIEFKVjogQW5vdGhlciBKU09OIFNjaGVtYSBWYWxpZGF0b3JcbiAgdmFsaWRhdGVGb3JtRGF0YTogYW55ID0gbnVsbDsgLy8gQ29tcGlsZWQgQUpWIGZ1bmN0aW9uIHRvIHZhbGlkYXRlIGFjdGl2ZSBmb3JtJ3Mgc2NoZW1hXG5cbiAgZm9ybVZhbHVlczogYW55ID0ge307IC8vIEludGVybmFsIGZvcm0gZGF0YSAobWF5IG5vdCBoYXZlIGNvcnJlY3QgdHlwZXMpXG4gIGRhdGE6IGFueSA9IHt9OyAvLyBPdXRwdXQgZm9ybSBkYXRhIChmb3JtVmFsdWVzLCBmb3JtYXR0ZWQgd2l0aCBjb3JyZWN0IGRhdGEgdHlwZXMpXG4gIHNjaGVtYTogYW55ID0ge307IC8vIEludGVybmFsIEpTT04gU2NoZW1hXG4gIGxheW91dDogYW55W10gPSBbXTsgLy8gSW50ZXJuYWwgZm9ybSBsYXlvdXRcbiAgZm9ybUdyb3VwVGVtcGxhdGU6IGFueSA9IHt9OyAvLyBUZW1wbGF0ZSB1c2VkIHRvIGNyZWF0ZSBmb3JtR3JvdXBcbiAgZm9ybUdyb3VwOiBhbnkgPSBudWxsOyAvLyBBbmd1bGFyIGZvcm1Hcm91cCwgd2hpY2ggcG93ZXJzIHRoZSByZWFjdGl2ZSBmb3JtXG4gIGZyYW1ld29yazogYW55ID0gbnVsbDsgLy8gQWN0aXZlIGZyYW1ld29yayBjb21wb25lbnRcbiAgZm9ybU9wdGlvbnM6IGFueTsgLy8gQWN0aXZlIG9wdGlvbnMsIHVzZWQgdG8gY29uZmlndXJlIHRoZSBmb3JtXG5cbiAgdmFsaWREYXRhOiBhbnkgPSBudWxsOyAvLyBWYWxpZCBmb3JtIGRhdGEgKG9yIG51bGwpICg9PT0gaXNWYWxpZCA/IGRhdGEgOiBudWxsKVxuICBpc1ZhbGlkOiBib29sZWFuID0gbnVsbDsgLy8gSXMgY3VycmVudCBmb3JtIGRhdGEgdmFsaWQ/XG4gIGFqdkVycm9yczogYW55ID0gbnVsbDsgLy8gQWp2IGVycm9ycyBmb3IgY3VycmVudCBkYXRhXG4gIHZhbGlkYXRpb25FcnJvcnM6IGFueSA9IG51bGw7IC8vIEFueSB2YWxpZGF0aW9uIGVycm9ycyBmb3IgY3VycmVudCBkYXRhXG4gIGRhdGFFcnJvcnM6IGFueSA9IG5ldyBNYXAoKTsgLy9cbiAgZm9ybVZhbHVlU3Vic2NyaXB0aW9uOiBhbnkgPSBudWxsOyAvLyBTdWJzY3JpcHRpb24gdG8gZm9ybUdyb3VwLnZhbHVlQ2hhbmdlcyBvYnNlcnZhYmxlIChmb3IgdW4tIGFuZCByZS1zdWJzY3JpYmluZylcbiAgZGF0YUNoYW5nZXM6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0KCk7IC8vIEZvcm0gZGF0YSBvYnNlcnZhYmxlXG4gIGlzVmFsaWRDaGFuZ2VzOiBTdWJqZWN0PGFueT4gPSBuZXcgU3ViamVjdCgpOyAvLyBpc1ZhbGlkIG9ic2VydmFibGVcbiAgdmFsaWRhdGlvbkVycm9yQ2hhbmdlczogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3QoKTsgLy8gdmFsaWRhdGlvbkVycm9ycyBvYnNlcnZhYmxlXG5cbiAgYXJyYXlNYXA6IE1hcDxzdHJpbmcsIG51bWJlcj4gPSBuZXcgTWFwKCk7IC8vIE1hcHMgYXJyYXlzIGluIGRhdGEgb2JqZWN0IGFuZCBudW1iZXIgb2YgdHVwbGUgdmFsdWVzXG4gIGRhdGFNYXA6IE1hcDxzdHJpbmcsIGFueT4gPSBuZXcgTWFwKCk7IC8vIE1hcHMgcGF0aHMgaW4gZm9ybSBkYXRhIHRvIHNjaGVtYSBhbmQgZm9ybUdyb3VwIHBhdGhzXG4gIGRhdGFSZWN1cnNpdmVSZWZNYXA6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7IC8vIE1hcHMgcmVjdXJzaXZlIHJlZmVyZW5jZSBwb2ludHMgaW4gZm9ybSBkYXRhXG4gIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcDogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKTsgLy8gTWFwcyByZWN1cnNpdmUgcmVmZXJlbmNlIHBvaW50cyBpbiBzY2hlbWFcbiAgc2NoZW1hUmVmTGlicmFyeTogYW55ID0ge307IC8vIExpYnJhcnkgb2Ygc2NoZW1hcyBmb3IgcmVzb2x2aW5nIHNjaGVtYSAkcmVmc1xuICBsYXlvdXRSZWZMaWJyYXJ5OiBhbnkgPSB7ICcnOiBudWxsIH07IC8vIExpYnJhcnkgb2YgbGF5b3V0IG5vZGVzIGZvciBhZGRpbmcgdG8gZm9ybVxuICB0ZW1wbGF0ZVJlZkxpYnJhcnk6IGFueSA9IHt9OyAvLyBMaWJyYXJ5IG9mIGZvcm1Hcm91cCB0ZW1wbGF0ZXMgZm9yIGFkZGluZyB0byBmb3JtXG4gIGhhc1Jvb3RSZWZlcmVuY2UgPSBmYWxzZTsgLy8gRG9lcyB0aGUgZm9ybSBpbmNsdWRlIGEgcmVjdXJzaXZlIHJlZmVyZW5jZSB0byBpdHNlbGY/XG5cbiAgbGFuZ3VhZ2UgPSAnZW4tVVMnOyAvLyBEb2VzIHRoZSBmb3JtIGluY2x1ZGUgYSByZWN1cnNpdmUgcmVmZXJlbmNlIHRvIGl0c2VsZj9cblxuICAvLyBEZWZhdWx0IGdsb2JhbCBmb3JtIG9wdGlvbnNcbiAgZGVmYXVsdEZvcm1PcHRpb25zOiBhbnkgPSB7XG4gICAgYWRkU3VibWl0OiAnYXV0bycsIC8vIEFkZCBhIHN1Ym1pdCBidXR0b24gaWYgbGF5b3V0IGRvZXMgbm90IGhhdmUgb25lP1xuICAgICAgLy8gZm9yIGFkZFN1Ym1pdDogdHJ1ZSA9IGFsd2F5cywgZmFsc2UgPSBuZXZlcixcbiAgICAgIC8vICdhdXRvJyA9IG9ubHkgaWYgbGF5b3V0IGlzIHVuZGVmaW5lZCAoZm9ybSBpcyBidWlsdCBmcm9tIHNjaGVtYSBhbG9uZSlcbiAgICBkZWJ1ZzogZmFsc2UsIC8vIFNob3cgZGVidWdnaW5nIG91dHB1dD9cbiAgICBkaXNhYmxlSW52YWxpZFN1Ym1pdDogdHJ1ZSwgLy8gRGlzYWJsZSBzdWJtaXQgaWYgZm9ybSBpbnZhbGlkP1xuICAgIGZvcm1EaXNhYmxlZDogZmFsc2UsIC8vIFNldCBlbnRpcmUgZm9ybSBhcyBkaXNhYmxlZD8gKG5vdCBlZGl0YWJsZSwgYW5kIGRpc2FibGVzIG91dHB1dHMpXG4gICAgZm9ybVJlYWRvbmx5OiBmYWxzZSwgLy8gU2V0IGVudGlyZSBmb3JtIGFzIHJlYWQgb25seT8gKG5vdCBlZGl0YWJsZSwgYnV0IG91dHB1dHMgc3RpbGwgZW5hYmxlZClcbiAgICBmaWVsZHNSZXF1aXJlZDogZmFsc2UsIC8vIChzZXQgYXV0b21hdGljYWxseSkgQXJlIHRoZXJlIGFueSByZXF1aXJlZCBmaWVsZHMgaW4gdGhlIGZvcm0/XG4gICAgZnJhbWV3b3JrOiAnbm8tZnJhbWV3b3JrJywgLy8gVGhlIGZyYW1ld29yayB0byBsb2FkXG4gICAgbG9hZEV4dGVybmFsQXNzZXRzOiBmYWxzZSwgLy8gTG9hZCBleHRlcm5hbCBjc3MgYW5kIEphdmFTY3JpcHQgZm9yIGZyYW1ld29yaz9cbiAgICBwcmlzdGluZTogeyBlcnJvcnM6IHRydWUsIHN1Y2Nlc3M6IHRydWUgfSxcbiAgICBzdXByZXNzUHJvcGVydHlUaXRsZXM6IGZhbHNlLFxuICAgIHNldFNjaGVtYURlZmF1bHRzOiAnYXV0bycsIC8vIFNldCBmZWZhdWx0IHZhbHVlcyBmcm9tIHNjaGVtYT9cbiAgICAgIC8vIHRydWUgPSBhbHdheXMgc2V0ICh1bmxlc3Mgb3ZlcnJpZGRlbiBieSBsYXlvdXQgZGVmYXVsdCBvciBmb3JtVmFsdWVzKVxuICAgICAgLy8gZmFsc2UgPSBuZXZlciBzZXRcbiAgICAgIC8vICdhdXRvJyA9IHNldCBpbiBhZGRhYmxlIGNvbXBvbmVudHMsIGFuZCBldmVyeXdoZXJlIGlmIGZvcm1WYWx1ZXMgbm90IHNldFxuICAgIHNldExheW91dERlZmF1bHRzOiAnYXV0bycsIC8vIFNldCBmZWZhdWx0IHZhbHVlcyBmcm9tIGxheW91dD9cbiAgICAgIC8vIHRydWUgPSBhbHdheXMgc2V0ICh1bmxlc3Mgb3ZlcnJpZGRlbiBieSBmb3JtVmFsdWVzKVxuICAgICAgLy8gZmFsc2UgPSBuZXZlciBzZXRcbiAgICAgIC8vICdhdXRvJyA9IHNldCBpbiBhZGRhYmxlIGNvbXBvbmVudHMsIGFuZCBldmVyeXdoZXJlIGlmIGZvcm1WYWx1ZXMgbm90IHNldFxuICAgIHZhbGlkYXRlT25SZW5kZXI6ICdhdXRvJywgLy8gVmFsaWRhdGUgZmllbGRzIGltbWVkaWF0ZWx5LCBiZWZvcmUgdGhleSBhcmUgdG91Y2hlZD9cbiAgICAgIC8vIHRydWUgPSB2YWxpZGF0ZSBhbGwgZmllbGRzIGltbWVkaWF0ZWx5XG4gICAgICAvLyBmYWxzZSA9IG9ubHkgdmFsaWRhdGUgZmllbGRzIGFmdGVyIHRoZXkgYXJlIHRvdWNoZWQgYnkgdXNlclxuICAgICAgLy8gJ2F1dG8nID0gdmFsaWRhdGUgZmllbGRzIHdpdGggdmFsdWVzIGltbWVkaWF0ZWx5LCBlbXB0eSBmaWVsZHMgYWZ0ZXIgdGhleSBhcmUgdG91Y2hlZFxuICAgIHdpZGdldHM6IHt9LCAvLyBBbnkgY3VzdG9tIHdpZGdldHMgdG8gbG9hZFxuICAgIGRlZmF1dFdpZGdldE9wdGlvbnM6IHsgLy8gRGVmYXVsdCBvcHRpb25zIGZvciBmb3JtIGNvbnRyb2wgd2lkZ2V0c1xuICAgICAgbGlzdEl0ZW1zOiAxLCAvLyBOdW1iZXIgb2YgbGlzdCBpdGVtcyB0byBpbml0aWFsbHkgYWRkIHRvIGFycmF5cyB3aXRoIG5vIGRlZmF1bHQgdmFsdWVcbiAgICAgIGFkZGFibGU6IHRydWUsIC8vIEFsbG93IGFkZGluZyBpdGVtcyB0byBhbiBhcnJheSBvciAkcmVmIHBvaW50P1xuICAgICAgb3JkZXJhYmxlOiB0cnVlLCAvLyBBbGxvdyByZW9yZGVyaW5nIGl0ZW1zIHdpdGhpbiBhbiBhcnJheT9cbiAgICAgIHJlbW92YWJsZTogdHJ1ZSwgLy8gQWxsb3cgcmVtb3ZpbmcgaXRlbXMgZnJvbSBhbiBhcnJheSBvciAkcmVmIHBvaW50P1xuICAgICAgZW5hYmxlRXJyb3JTdGF0ZTogdHJ1ZSwgLy8gQXBwbHkgJ2hhcy1lcnJvcicgY2xhc3Mgd2hlbiBmaWVsZCBmYWlscyB2YWxpZGF0aW9uP1xuICAgICAgLy8gZGlzYWJsZUVycm9yU3RhdGU6IGZhbHNlLCAvLyBEb24ndCBhcHBseSAnaGFzLWVycm9yJyBjbGFzcyB3aGVuIGZpZWxkIGZhaWxzIHZhbGlkYXRpb24/XG4gICAgICBlbmFibGVTdWNjZXNzU3RhdGU6IHRydWUsIC8vIEFwcGx5ICdoYXMtc3VjY2VzcycgY2xhc3Mgd2hlbiBmaWVsZCB2YWxpZGF0ZXM/XG4gICAgICAvLyBkaXNhYmxlU3VjY2Vzc1N0YXRlOiBmYWxzZSwgLy8gRG9uJ3QgYXBwbHkgJ2hhcy1zdWNjZXNzJyBjbGFzcyB3aGVuIGZpZWxkIHZhbGlkYXRlcz9cbiAgICAgIGZlZWRiYWNrOiBmYWxzZSwgLy8gU2hvdyBpbmxpbmUgZmVlZGJhY2sgaWNvbnM/XG4gICAgICBmZWVkYmFja09uUmVuZGVyOiBmYWxzZSwgLy8gU2hvdyBlcnJvck1lc3NhZ2Ugb24gUmVuZGVyP1xuICAgICAgbm90aXRsZTogZmFsc2UsIC8vIEhpZGUgdGl0bGU/XG4gICAgICBkaXNhYmxlZDogZmFsc2UsIC8vIFNldCBjb250cm9sIGFzIGRpc2FibGVkPyAobm90IGVkaXRhYmxlLCBhbmQgZXhjbHVkZWQgZnJvbSBvdXRwdXQpXG4gICAgICByZWFkb25seTogZmFsc2UsIC8vIFNldCBjb250cm9sIGFzIHJlYWQgb25seT8gKG5vdCBlZGl0YWJsZSwgYnV0IGluY2x1ZGVkIGluIG91dHB1dClcbiAgICAgIHJldHVybkVtcHR5RmllbGRzOiB0cnVlLCAvLyByZXR1cm4gdmFsdWVzIGZvciBmaWVsZHMgdGhhdCBjb250YWluIG5vIGRhdGE/XG4gICAgICB2YWxpZGF0aW9uTWVzc2FnZXM6IHt9IC8vIHNldCBieSBzZXRMYW5ndWFnZSgpXG4gICAgfSxcbiAgfTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnNldExhbmd1YWdlKHRoaXMubGFuZ3VhZ2UpO1xuICB9XG5cbiAgc2V0TGFuZ3VhZ2UobGFuZ3VhZ2U6IHN0cmluZyA9ICdlbi1VUycpIHtcbiAgICB0aGlzLmxhbmd1YWdlID0gbGFuZ3VhZ2U7XG4gICAgY29uc3QgdmFsaWRhdGlvbk1lc3NhZ2VzID0gbGFuZ3VhZ2Uuc2xpY2UoMCwgMikgPT09ICdmcicgP1xuICAgICAgZnJWYWxpZGF0aW9uTWVzc2FnZXMgOiBlblZhbGlkYXRpb25NZXNzYWdlcztcbiAgICB0aGlzLmRlZmF1bHRGb3JtT3B0aW9ucy5kZWZhdXRXaWRnZXRPcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlcyA9XG4gICAgICBfLmNsb25lRGVlcCh2YWxpZGF0aW9uTWVzc2FnZXMpO1xuICB9XG5cbiAgZ2V0RGF0YSgpIHsgcmV0dXJuIHRoaXMuZGF0YTsgfVxuXG4gIGdldFNjaGVtYSgpIHsgcmV0dXJuIHRoaXMuc2NoZW1hOyB9XG5cbiAgZ2V0TGF5b3V0KCkgeyByZXR1cm4gdGhpcy5sYXlvdXQ7IH1cblxuICByZXNldEFsbFZhbHVlcygpIHtcbiAgICB0aGlzLkpzb25Gb3JtQ29tcGF0aWJpbGl0eSA9IGZhbHNlO1xuICAgIHRoaXMuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSBmYWxzZTtcbiAgICB0aGlzLkFuZ3VsYXJTY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IGZhbHNlO1xuICAgIHRoaXMudHBsZGF0YSA9IHt9O1xuICAgIHRoaXMudmFsaWRhdGVGb3JtRGF0YSA9IG51bGw7XG4gICAgdGhpcy5mb3JtVmFsdWVzID0ge307XG4gICAgdGhpcy5zY2hlbWEgPSB7fTtcbiAgICB0aGlzLmxheW91dCA9IFtdO1xuICAgIHRoaXMuZm9ybUdyb3VwVGVtcGxhdGUgPSB7fTtcbiAgICB0aGlzLmZvcm1Hcm91cCA9IG51bGw7XG4gICAgdGhpcy5mcmFtZXdvcmsgPSBudWxsO1xuICAgIHRoaXMuZGF0YSA9IHt9O1xuICAgIHRoaXMudmFsaWREYXRhID0gbnVsbDtcbiAgICB0aGlzLmlzVmFsaWQgPSBudWxsO1xuICAgIHRoaXMudmFsaWRhdGlvbkVycm9ycyA9IG51bGw7XG4gICAgdGhpcy5hcnJheU1hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmRhdGFNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5kYXRhUmVjdXJzaXZlUmVmTWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuc2NoZW1hUmVjdXJzaXZlUmVmTWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMubGF5b3V0UmVmTGlicmFyeSA9IHt9O1xuICAgIHRoaXMuc2NoZW1hUmVmTGlicmFyeSA9IHt9O1xuICAgIHRoaXMudGVtcGxhdGVSZWZMaWJyYXJ5ID0ge307XG4gICAgdGhpcy5mb3JtT3B0aW9ucyA9IF8uY2xvbmVEZWVwKHRoaXMuZGVmYXVsdEZvcm1PcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnYnVpbGRSZW1vdGVFcnJvcicgZnVuY3Rpb25cbiAgICpcbiAgICogRXhhbXBsZSBlcnJvcnM6XG4gICAqIHtcbiAgICogICBsYXN0X25hbWU6IFsge1xuICAgKiAgICAgbWVzc2FnZTogJ0xhc3QgbmFtZSBtdXN0IGJ5IHN0YXJ0IHdpdGggY2FwaXRhbCBsZXR0ZXIuJyxcbiAgICogICAgIGNvZGU6ICdjYXBpdGFsX2xldHRlcidcbiAgICogICB9IF0sXG4gICAqICAgZW1haWw6IFsge1xuICAgKiAgICAgbWVzc2FnZTogJ0VtYWlsIG11c3QgYmUgZnJvbSBleGFtcGxlLmNvbSBkb21haW4uJyxcbiAgICogICAgIGNvZGU6ICdzcGVjaWFsX2RvbWFpbidcbiAgICogICB9LCB7XG4gICAqICAgICBtZXNzYWdlOiAnRW1haWwgbXVzdCBjb250YWluIGFuIEAgc3ltYm9sLicsXG4gICAqICAgICBjb2RlOiAnYXRfc3ltYm9sJ1xuICAgKiAgIH0gXVxuICAgKiB9XG4gICAqIC8ve0Vycm9yTWVzc2FnZXN9IGVycm9yc1xuICAgKi9cbiAgYnVpbGRSZW1vdGVFcnJvcihlcnJvcnM6IEVycm9yTWVzc2FnZXMpIHtcbiAgICBmb3JFYWNoKGVycm9ycywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGlmIChrZXkgaW4gdGhpcy5mb3JtR3JvdXAuY29udHJvbHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBlcnJvciBvZiB2YWx1ZSkge1xuICAgICAgICAgIGNvbnN0IGVyciA9IHt9O1xuICAgICAgICAgIGVycltlcnJvclsnY29kZSddXSA9IGVycm9yWydtZXNzYWdlJ107XG4gICAgICAgICAgdGhpcy5mb3JtR3JvdXAuZ2V0KGtleSkuc2V0RXJyb3JzKGVyciwgeyBlbWl0RXZlbnQ6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHZhbGlkYXRlRGF0YShuZXdWYWx1ZTogYW55LCB1cGRhdGVTdWJzY3JpcHRpb25zID0gdHJ1ZSk6IHZvaWQge1xuXG4gICAgLy8gRm9ybWF0IHJhdyBmb3JtIGRhdGEgdG8gY29ycmVjdCBkYXRhIHR5cGVzXG4gICAgdGhpcy5kYXRhID0gZm9ybWF0Rm9ybURhdGEoXG4gICAgICBuZXdWYWx1ZSwgdGhpcy5kYXRhTWFwLCB0aGlzLmRhdGFSZWN1cnNpdmVSZWZNYXAsXG4gICAgICB0aGlzLmFycmF5TWFwLCB0aGlzLmZvcm1PcHRpb25zLnJldHVybkVtcHR5RmllbGRzXG4gICAgKTtcbiAgICB0aGlzLmlzVmFsaWQgPSB0aGlzLnZhbGlkYXRlRm9ybURhdGEodGhpcy5kYXRhKTtcbiAgICB0aGlzLnZhbGlkRGF0YSA9IHRoaXMuaXNWYWxpZCA/IHRoaXMuZGF0YSA6IG51bGw7XG4gICAgY29uc3QgY29tcGlsZUVycm9ycyA9IGVycm9ycyA9PiB7XG4gICAgICBjb25zdCBjb21waWxlZEVycm9ycyA9IHt9O1xuICAgICAgKGVycm9ycyB8fCBbXSkuZm9yRWFjaChlcnJvciA9PiB7XG4gICAgICAgIGlmICghY29tcGlsZWRFcnJvcnNbZXJyb3IuZGF0YVBhdGhdKSB7IGNvbXBpbGVkRXJyb3JzW2Vycm9yLmRhdGFQYXRoXSA9IFtdOyB9XG4gICAgICAgIGNvbXBpbGVkRXJyb3JzW2Vycm9yLmRhdGFQYXRoXS5wdXNoKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gY29tcGlsZWRFcnJvcnM7XG4gICAgfTtcbiAgICB0aGlzLmFqdkVycm9ycyA9IHRoaXMudmFsaWRhdGVGb3JtRGF0YS5lcnJvcnM7XG4gICAgdGhpcy52YWxpZGF0aW9uRXJyb3JzID0gY29tcGlsZUVycm9ycyh0aGlzLnZhbGlkYXRlRm9ybURhdGEuZXJyb3JzKTtcbiAgICBpZiAodXBkYXRlU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5kYXRhQ2hhbmdlcy5uZXh0KHRoaXMuZGF0YSk7XG4gICAgICB0aGlzLmlzVmFsaWRDaGFuZ2VzLm5leHQodGhpcy5pc1ZhbGlkKTtcbiAgICAgIHRoaXMudmFsaWRhdGlvbkVycm9yQ2hhbmdlcy5uZXh0KHRoaXMuYWp2RXJyb3JzKTtcbiAgICB9XG4gIH1cblxuICBidWlsZEZvcm1Hcm91cFRlbXBsYXRlKGZvcm1WYWx1ZXM6IGFueSA9IG51bGwsIHNldFZhbHVlcyA9IHRydWUpIHtcbiAgICB0aGlzLmZvcm1Hcm91cFRlbXBsYXRlID0gYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZSh0aGlzLCBmb3JtVmFsdWVzLCBzZXRWYWx1ZXMpO1xuICB9XG5cbiAgYnVpbGRGb3JtR3JvdXAoKSB7XG4gICAgdGhpcy5mb3JtR3JvdXAgPSA8Rm9ybUdyb3VwPmJ1aWxkRm9ybUdyb3VwKHRoaXMuZm9ybUdyb3VwVGVtcGxhdGUpO1xuICAgIGlmICh0aGlzLmZvcm1Hcm91cCkge1xuICAgICAgdGhpcy5jb21waWxlQWp2U2NoZW1hKCk7XG4gICAgICB0aGlzLnZhbGlkYXRlRGF0YSh0aGlzLmZvcm1Hcm91cC52YWx1ZSk7XG5cbiAgICAgIC8vIFNldCB1cCBvYnNlcnZhYmxlcyB0byBlbWl0IGRhdGEgYW5kIHZhbGlkYXRpb24gaW5mbyB3aGVuIGZvcm0gZGF0YSBjaGFuZ2VzXG4gICAgICBpZiAodGhpcy5mb3JtVmFsdWVTdWJzY3JpcHRpb24pIHsgdGhpcy5mb3JtVmFsdWVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTsgfVxuICAgICAgdGhpcy5mb3JtVmFsdWVTdWJzY3JpcHRpb24gPSB0aGlzLmZvcm1Hcm91cC52YWx1ZUNoYW5nZXNcbiAgICAgICAgLnN1YnNjcmliZShmb3JtVmFsdWUgPT4gdGhpcy52YWxpZGF0ZURhdGEoZm9ybVZhbHVlKSk7XG4gICAgfVxuICB9XG5cbiAgYnVpbGRMYXlvdXQod2lkZ2V0TGlicmFyeTogYW55KSB7XG4gICAgdGhpcy5sYXlvdXQgPSBidWlsZExheW91dCh0aGlzLCB3aWRnZXRMaWJyYXJ5KTtcbiAgfVxuXG4gIHNldE9wdGlvbnMobmV3T3B0aW9uczogYW55KSB7XG4gICAgaWYgKGlzT2JqZWN0KG5ld09wdGlvbnMpKSB7XG4gICAgICBjb25zdCBhZGRPcHRpb25zID0gXy5jbG9uZURlZXAobmV3T3B0aW9ucyk7XG4gICAgICAvLyBCYWNrd2FyZCBjb21wYXRpYmlsaXR5IGZvciAnZGVmYXVsdE9wdGlvbnMnIChyZW5hbWVkICdkZWZhdXRXaWRnZXRPcHRpb25zJylcbiAgICAgIGlmIChpc09iamVjdChhZGRPcHRpb25zLmRlZmF1bHRPcHRpb25zKSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuZm9ybU9wdGlvbnMuZGVmYXV0V2lkZ2V0T3B0aW9ucywgYWRkT3B0aW9ucy5kZWZhdWx0T3B0aW9ucyk7XG4gICAgICAgIGRlbGV0ZSBhZGRPcHRpb25zLmRlZmF1bHRPcHRpb25zO1xuICAgICAgfVxuICAgICAgaWYgKGlzT2JqZWN0KGFkZE9wdGlvbnMuZGVmYXV0V2lkZ2V0T3B0aW9ucykpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLmZvcm1PcHRpb25zLmRlZmF1dFdpZGdldE9wdGlvbnMsIGFkZE9wdGlvbnMuZGVmYXV0V2lkZ2V0T3B0aW9ucyk7XG4gICAgICAgIGRlbGV0ZSBhZGRPcHRpb25zLmRlZmF1dFdpZGdldE9wdGlvbnM7XG4gICAgICB9XG4gICAgICBPYmplY3QuYXNzaWduKHRoaXMuZm9ybU9wdGlvbnMsIGFkZE9wdGlvbnMpO1xuXG4gICAgICAvLyBjb252ZXJ0IGRpc2FibGVFcnJvclN0YXRlIC8gZGlzYWJsZVN1Y2Nlc3NTdGF0ZSB0byBlbmFibGUuLi5cbiAgICAgIGNvbnN0IGdsb2JhbERlZmF1bHRzID0gdGhpcy5mb3JtT3B0aW9ucy5kZWZhdXRXaWRnZXRPcHRpb25zO1xuICAgICAgWydFcnJvclN0YXRlJywgJ1N1Y2Nlc3NTdGF0ZSddXG4gICAgICAgIC5maWx0ZXIoc3VmZml4ID0+IGhhc093bihnbG9iYWxEZWZhdWx0cywgJ2Rpc2FibGUnICsgc3VmZml4KSlcbiAgICAgICAgLmZvckVhY2goc3VmZml4ID0+IHtcbiAgICAgICAgICBnbG9iYWxEZWZhdWx0c1snZW5hYmxlJyArIHN1ZmZpeF0gPSAhZ2xvYmFsRGVmYXVsdHNbJ2Rpc2FibGUnICsgc3VmZml4XTtcbiAgICAgICAgICBkZWxldGUgZ2xvYmFsRGVmYXVsdHNbJ2Rpc2FibGUnICsgc3VmZml4XTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29tcGlsZUFqdlNjaGVtYSgpIHtcbiAgICBpZiAoIXRoaXMudmFsaWRhdGVGb3JtRGF0YSkge1xuXG4gICAgICAvLyBpZiAndWk6b3JkZXInIGV4aXN0cyBpbiBwcm9wZXJ0aWVzLCBtb3ZlIGl0IHRvIHJvb3QgYmVmb3JlIGNvbXBpbGluZyB3aXRoIGFqdlxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5zY2hlbWEucHJvcGVydGllc1sndWk6b3JkZXInXSkpIHtcbiAgICAgICAgdGhpcy5zY2hlbWFbJ3VpOm9yZGVyJ10gPSB0aGlzLnNjaGVtYS5wcm9wZXJ0aWVzWyd1aTpvcmRlciddO1xuICAgICAgICBkZWxldGUgdGhpcy5zY2hlbWEucHJvcGVydGllc1sndWk6b3JkZXInXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWp2LnJlbW92ZVNjaGVtYSh0aGlzLnNjaGVtYSk7XG4gICAgICB0aGlzLnZhbGlkYXRlRm9ybURhdGEgPSB0aGlzLmFqdi5jb21waWxlKHRoaXMuc2NoZW1hKTtcbiAgICB9XG4gIH1cblxuICBidWlsZFNjaGVtYUZyb21EYXRhKGRhdGE/OiBhbnksIHJlcXVpcmVBbGxGaWVsZHMgPSBmYWxzZSk6IGFueSB7XG4gICAgaWYgKGRhdGEpIHsgcmV0dXJuIGJ1aWxkU2NoZW1hRnJvbURhdGEoZGF0YSwgcmVxdWlyZUFsbEZpZWxkcyk7IH1cbiAgICB0aGlzLnNjaGVtYSA9IGJ1aWxkU2NoZW1hRnJvbURhdGEodGhpcy5mb3JtVmFsdWVzLCByZXF1aXJlQWxsRmllbGRzKTtcbiAgfVxuXG4gIGJ1aWxkU2NoZW1hRnJvbUxheW91dChsYXlvdXQ/OiBhbnkpOiBhbnkge1xuICAgIGlmIChsYXlvdXQpIHsgcmV0dXJuIGJ1aWxkU2NoZW1hRnJvbUxheW91dChsYXlvdXQpOyB9XG4gICAgdGhpcy5zY2hlbWEgPSBidWlsZFNjaGVtYUZyb21MYXlvdXQodGhpcy5sYXlvdXQpO1xuICB9XG5cblxuICBzZXRUcGxkYXRhKG5ld1RwbGRhdGE6IGFueSA9IHt9KTogdm9pZCB7XG4gICAgdGhpcy50cGxkYXRhID0gbmV3VHBsZGF0YTtcbiAgfVxuXG4gIHBhcnNlVGV4dChcbiAgICB0ZXh0ID0gJycsIHZhbHVlOiBhbnkgPSB7fSwgdmFsdWVzOiBhbnkgPSB7fSwga2V5OiBudW1iZXJ8c3RyaW5nID0gbnVsbFxuICApOiBzdHJpbmcge1xuICAgIGlmICghdGV4dCB8fCAhL3t7Lis/fX0vLnRlc3QodGV4dCkpIHsgcmV0dXJuIHRleHQ7IH1cbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC97eyguKz8pfX0vZywgKC4uLmEpID0+XG4gICAgICB0aGlzLnBhcnNlRXhwcmVzc2lvbihhWzFdLCB2YWx1ZSwgdmFsdWVzLCBrZXksIHRoaXMudHBsZGF0YSlcbiAgICApO1xuICB9XG5cbiAgcGFyc2VFeHByZXNzaW9uKFxuICAgIGV4cHJlc3Npb24gPSAnJywgdmFsdWU6IGFueSA9IHt9LCB2YWx1ZXM6IGFueSA9IHt9LFxuICAgIGtleTogbnVtYmVyfHN0cmluZyA9IG51bGwsIHRwbGRhdGE6IGFueSA9IG51bGxcbiAgKSB7XG4gICAgaWYgKHR5cGVvZiBleHByZXNzaW9uICE9PSAnc3RyaW5nJykgeyByZXR1cm4gJyc7IH1cbiAgICBjb25zdCBpbmRleCA9IHR5cGVvZiBrZXkgPT09ICdudW1iZXInID8gKGtleSArIDEpICsgJycgOiAoa2V5IHx8ICcnKTtcbiAgICBleHByZXNzaW9uID0gZXhwcmVzc2lvbi50cmltKCk7XG4gICAgaWYgKChleHByZXNzaW9uWzBdID09PSAnXFwnJyB8fCBleHByZXNzaW9uWzBdID09PSAnXCInKSAmJlxuICAgICAgZXhwcmVzc2lvblswXSA9PT0gZXhwcmVzc2lvbltleHByZXNzaW9uLmxlbmd0aCAtIDFdICYmXG4gICAgICBleHByZXNzaW9uLnNsaWNlKDEsIGV4cHJlc3Npb24ubGVuZ3RoIC0gMSkuaW5kZXhPZihleHByZXNzaW9uWzBdKSA9PT0gLTFcbiAgICApIHtcbiAgICAgIHJldHVybiBleHByZXNzaW9uLnNsaWNlKDEsIGV4cHJlc3Npb24ubGVuZ3RoIC0gMSk7XG4gICAgfVxuICAgIGlmIChleHByZXNzaW9uID09PSAnaWR4JyB8fCBleHByZXNzaW9uID09PSAnJGluZGV4JykgeyByZXR1cm4gaW5kZXg7IH1cbiAgICBpZiAoZXhwcmVzc2lvbiA9PT0gJ3ZhbHVlJyAmJiAhaGFzT3duKHZhbHVlcywgJ3ZhbHVlJykpIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgaWYgKFsnXCInLCAnXFwnJywgJyAnLCAnfHwnLCAnJiYnLCAnKyddLmV2ZXJ5KGRlbGltID0+IGV4cHJlc3Npb24uaW5kZXhPZihkZWxpbSkgPT09IC0xKSkge1xuICAgICAgY29uc3QgcG9pbnRlciA9IEpzb25Qb2ludGVyLnBhcnNlT2JqZWN0UGF0aChleHByZXNzaW9uKTtcbiAgICAgIHJldHVybiBwb2ludGVyWzBdID09PSAndmFsdWUnICYmIEpzb25Qb2ludGVyLmhhcyh2YWx1ZSwgcG9pbnRlci5zbGljZSgxKSkgP1xuICAgICAgICAgIEpzb25Qb2ludGVyLmdldCh2YWx1ZSwgcG9pbnRlci5zbGljZSgxKSkgOlxuICAgICAgICBwb2ludGVyWzBdID09PSAndmFsdWVzJyAmJiBKc29uUG9pbnRlci5oYXModmFsdWVzLCBwb2ludGVyLnNsaWNlKDEpKSA/XG4gICAgICAgICAgSnNvblBvaW50ZXIuZ2V0KHZhbHVlcywgcG9pbnRlci5zbGljZSgxKSkgOlxuICAgICAgICBwb2ludGVyWzBdID09PSAndHBsZGF0YScgJiYgSnNvblBvaW50ZXIuaGFzKHRwbGRhdGEsIHBvaW50ZXIuc2xpY2UoMSkpID9cbiAgICAgICAgICBKc29uUG9pbnRlci5nZXQodHBsZGF0YSwgcG9pbnRlci5zbGljZSgxKSkgOlxuICAgICAgICBKc29uUG9pbnRlci5oYXModmFsdWVzLCBwb2ludGVyKSA/IEpzb25Qb2ludGVyLmdldCh2YWx1ZXMsIHBvaW50ZXIpIDogJyc7XG4gICAgfVxuICAgIGlmIChleHByZXNzaW9uLmluZGV4T2YoJ1tpZHhdJykgPiAtMSkge1xuICAgICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24ucmVwbGFjZSgvXFxbaWR4XFxdL2csIDxzdHJpbmc+aW5kZXgpO1xuICAgIH1cbiAgICBpZiAoZXhwcmVzc2lvbi5pbmRleE9mKCdbJGluZGV4XScpID4gLTEpIHtcbiAgICAgIGV4cHJlc3Npb24gPSBleHByZXNzaW9uLnJlcGxhY2UoL1xcWyRpbmRleFxcXS9nLCA8c3RyaW5nPmluZGV4KTtcbiAgICB9XG4gICAgLy8gVE9ETzogSW1wcm92ZSBleHByZXNzaW9uIGV2YWx1YXRpb24gYnkgcGFyc2luZyBxdW90ZWQgc3RyaW5ncyBmaXJzdFxuICAgIC8vIGxldCBleHByZXNzaW9uQXJyYXkgPSBleHByZXNzaW9uLm1hdGNoKC8oW15cIiddK3xcIlteXCJdK1wifCdbXiddKycpL2cpO1xuICAgIGlmIChleHByZXNzaW9uLmluZGV4T2YoJ3x8JykgPiAtMSkge1xuICAgICAgcmV0dXJuIGV4cHJlc3Npb24uc3BsaXQoJ3x8JykucmVkdWNlKChhbGwsIHRlcm0pID0+XG4gICAgICAgIGFsbCB8fCB0aGlzLnBhcnNlRXhwcmVzc2lvbih0ZXJtLCB2YWx1ZSwgdmFsdWVzLCBrZXksIHRwbGRhdGEpLCAnJ1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGV4cHJlc3Npb24uaW5kZXhPZignJiYnKSA+IC0xKSB7XG4gICAgICByZXR1cm4gZXhwcmVzc2lvbi5zcGxpdCgnJiYnKS5yZWR1Y2UoKGFsbCwgdGVybSkgPT5cbiAgICAgICAgYWxsICYmIHRoaXMucGFyc2VFeHByZXNzaW9uKHRlcm0sIHZhbHVlLCB2YWx1ZXMsIGtleSwgdHBsZGF0YSksICcgJ1xuICAgICAgKS50cmltKCk7XG4gICAgfVxuICAgIGlmIChleHByZXNzaW9uLmluZGV4T2YoJysnKSA+IC0xKSB7XG4gICAgICByZXR1cm4gZXhwcmVzc2lvbi5zcGxpdCgnKycpXG4gICAgICAgIC5tYXAodGVybSA9PiB0aGlzLnBhcnNlRXhwcmVzc2lvbih0ZXJtLCB2YWx1ZSwgdmFsdWVzLCBrZXksIHRwbGRhdGEpKVxuICAgICAgICAuam9pbignJyk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIHNldEFycmF5SXRlbVRpdGxlKFxuICAgIHBhcmVudEN0eDogYW55ID0ge30sIGNoaWxkTm9kZTogYW55ID0gbnVsbCwgaW5kZXg6IG51bWJlciA9IG51bGxcbiAgKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXJlbnROb2RlID0gcGFyZW50Q3R4LmxheW91dE5vZGU7XG4gICAgY29uc3QgcGFyZW50VmFsdWVzOiBhbnkgPSB0aGlzLmdldEZvcm1Db250cm9sVmFsdWUocGFyZW50Q3R4KTtcbiAgICBjb25zdCBpc0FycmF5SXRlbSA9XG4gICAgICAocGFyZW50Tm9kZS50eXBlIHx8ICcnKS5zbGljZSgtNSkgPT09ICdhcnJheScgJiYgaXNBcnJheShwYXJlbnRWYWx1ZXMpO1xuICAgIGNvbnN0IHRleHQgPSBKc29uUG9pbnRlci5nZXRGaXJzdChcbiAgICAgIGlzQXJyYXlJdGVtICYmIGNoaWxkTm9kZS50eXBlICE9PSAnJHJlZicgPyBbXG4gICAgICAgIFtjaGlsZE5vZGUsICcvb3B0aW9ucy9sZWdlbmQnXSxcbiAgICAgICAgW2NoaWxkTm9kZSwgJy9vcHRpb25zL3RpdGxlJ10sXG4gICAgICAgIFtwYXJlbnROb2RlLCAnL29wdGlvbnMvdGl0bGUnXSxcbiAgICAgICAgW3BhcmVudE5vZGUsICcvb3B0aW9ucy9sZWdlbmQnXSxcbiAgICAgIF0gOiBbXG4gICAgICAgIFtjaGlsZE5vZGUsICcvb3B0aW9ucy90aXRsZSddLFxuICAgICAgICBbY2hpbGROb2RlLCAnL29wdGlvbnMvbGVnZW5kJ10sXG4gICAgICAgIFtwYXJlbnROb2RlLCAnL29wdGlvbnMvdGl0bGUnXSxcbiAgICAgICAgW3BhcmVudE5vZGUsICcvb3B0aW9ucy9sZWdlbmQnXVxuICAgICAgXVxuICAgICk7XG4gICAgaWYgKCF0ZXh0KSB7IHJldHVybiB0ZXh0OyB9XG4gICAgY29uc3QgY2hpbGRWYWx1ZSA9IGlzQXJyYXkocGFyZW50VmFsdWVzKSAmJiBpbmRleCA8IHBhcmVudFZhbHVlcy5sZW5ndGggP1xuICAgICAgcGFyZW50VmFsdWVzW2luZGV4XSA6IHBhcmVudFZhbHVlcztcbiAgICByZXR1cm4gdGhpcy5wYXJzZVRleHQodGV4dCwgY2hpbGRWYWx1ZSwgcGFyZW50VmFsdWVzLCBpbmRleCk7XG4gIH1cblxuICBzZXRJdGVtVGl0bGUoY3R4OiBhbnkpIHtcbiAgICByZXR1cm4gIWN0eC5vcHRpb25zLnRpdGxlICYmIC9eKFxcZCt8LSkkLy50ZXN0KGN0eC5sYXlvdXROb2RlLm5hbWUpID9cbiAgICAgIG51bGwgOlxuICAgICAgdGhpcy5wYXJzZVRleHQoXG4gICAgICAgIGN0eC5vcHRpb25zLnRpdGxlIHx8IHRvVGl0bGVDYXNlKGN0eC5sYXlvdXROb2RlLm5hbWUpLFxuICAgICAgICB0aGlzLmdldEZvcm1Db250cm9sVmFsdWUodGhpcyksXG4gICAgICAgICh0aGlzLmdldEZvcm1Db250cm9sR3JvdXAodGhpcykgfHwgPGFueT57fSkudmFsdWUsXG4gICAgICAgIGN0eC5kYXRhSW5kZXhbY3R4LmRhdGFJbmRleC5sZW5ndGggLSAxXVxuICAgICAgKTtcbiAgfVxuXG4gIGV2YWx1YXRlQ29uZGl0aW9uKGxheW91dE5vZGU6IGFueSwgZGF0YUluZGV4OiBudW1iZXJbXSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGFycmF5SW5kZXggPSBkYXRhSW5kZXggJiYgZGF0YUluZGV4W2RhdGFJbmRleC5sZW5ndGggLSAxXTtcbiAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcbiAgICBpZiAoaGFzVmFsdWUoKGxheW91dE5vZGUub3B0aW9ucyB8fCB7fSkuY29uZGl0aW9uKSkge1xuICAgICAgaWYgKHR5cGVvZiBsYXlvdXROb2RlLm9wdGlvbnMuY29uZGl0aW9uID09PSAnc3RyaW5nJykge1xuICAgICAgICBsZXQgcG9pbnRlciA9IGxheW91dE5vZGUub3B0aW9ucy5jb25kaXRpb247XG4gICAgICAgIGlmIChoYXNWYWx1ZShhcnJheUluZGV4KSkge1xuICAgICAgICAgIHBvaW50ZXIgPSBwb2ludGVyLnJlcGxhY2UoJ1thcnJheUluZGV4XScsIGBbJHthcnJheUluZGV4fV1gKTtcbiAgICAgICAgfVxuICAgICAgICBwb2ludGVyID0gSnNvblBvaW50ZXIucGFyc2VPYmplY3RQYXRoKHBvaW50ZXIpO1xuICAgICAgICByZXN1bHQgPSAhIUpzb25Qb2ludGVyLmdldCh0aGlzLmRhdGEsIHBvaW50ZXIpO1xuICAgICAgICBpZiAoIXJlc3VsdCAmJiBwb2ludGVyWzBdID09PSAnbW9kZWwnKSB7XG4gICAgICAgICAgcmVzdWx0ID0gISFKc29uUG9pbnRlci5nZXQoeyBtb2RlbDogdGhpcy5kYXRhIH0sIHBvaW50ZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsYXlvdXROb2RlLm9wdGlvbnMuY29uZGl0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlc3VsdCA9IGxheW91dE5vZGUub3B0aW9ucy5jb25kaXRpb24odGhpcy5kYXRhKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxheW91dE5vZGUub3B0aW9ucy5jb25kaXRpb24uZnVuY3Rpb25Cb2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGR5bkZuID0gbmV3IEZ1bmN0aW9uKFxuICAgICAgICAgICAgJ21vZGVsJywgJ2FycmF5SW5kaWNlcycsIGxheW91dE5vZGUub3B0aW9ucy5jb25kaXRpb24uZnVuY3Rpb25Cb2R5XG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXN1bHQgPSBkeW5Gbih0aGlzLmRhdGEsIGRhdGFJbmRleCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2NvbmRpdGlvbiBmdW5jdGlvbkJvZHkgZXJyb3JlZCBvdXQgb24gZXZhbHVhdGlvbjogJyArIGxheW91dE5vZGUub3B0aW9ucy5jb25kaXRpb24uZnVuY3Rpb25Cb2R5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaW5pdGlhbGl6ZUNvbnRyb2woY3R4OiBhbnksIGJpbmQgPSB0cnVlKTogYm9vbGVhbiB7XG4gICAgaWYgKCFpc09iamVjdChjdHgpKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIGlmIChpc0VtcHR5KGN0eC5vcHRpb25zKSkge1xuICAgICAgY3R4Lm9wdGlvbnMgPSAhaXNFbXB0eSgoY3R4LmxheW91dE5vZGUgfHwge30pLm9wdGlvbnMpID9cbiAgICAgICAgY3R4LmxheW91dE5vZGUub3B0aW9ucyA6IF8uY2xvbmVEZWVwKHRoaXMuZm9ybU9wdGlvbnMpO1xuICAgIH1cbiAgICBjdHguZm9ybUNvbnRyb2wgPSB0aGlzLmdldEZvcm1Db250cm9sKGN0eCk7XG4gICAgY3R4LmJvdW5kQ29udHJvbCA9IGJpbmQgJiYgISFjdHguZm9ybUNvbnRyb2w7XG4gICAgaWYgKGN0eC5mb3JtQ29udHJvbCkge1xuICAgICAgY3R4LmNvbnRyb2xOYW1lID0gdGhpcy5nZXRGb3JtQ29udHJvbE5hbWUoY3R4KTtcbiAgICAgIGN0eC5jb250cm9sVmFsdWUgPSBjdHguZm9ybUNvbnRyb2wudmFsdWU7XG4gICAgICBjdHguY29udHJvbERpc2FibGVkID0gY3R4LmZvcm1Db250cm9sLmRpc2FibGVkO1xuICAgICAgY3R4Lm9wdGlvbnMuZXJyb3JNZXNzYWdlID0gY3R4LmZvcm1Db250cm9sLnN0YXR1cyA9PT0gJ1ZBTElEJyA/IG51bGwgOlxuICAgICAgICB0aGlzLmZvcm1hdEVycm9ycyhjdHguZm9ybUNvbnRyb2wuZXJyb3JzLCBjdHgub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZXMpO1xuICAgICAgY3R4Lm9wdGlvbnMuc2hvd0Vycm9ycyA9IHRoaXMuZm9ybU9wdGlvbnMudmFsaWRhdGVPblJlbmRlciA9PT0gdHJ1ZSB8fFxuICAgICAgICAodGhpcy5mb3JtT3B0aW9ucy52YWxpZGF0ZU9uUmVuZGVyID09PSAnYXV0bycgJiYgaGFzVmFsdWUoY3R4LmNvbnRyb2xWYWx1ZSkpO1xuICAgICAgY3R4LmZvcm1Db250cm9sLnN0YXR1c0NoYW5nZXMuc3Vic2NyaWJlKHN0YXR1cyA9PlxuICAgICAgICBjdHgub3B0aW9ucy5lcnJvck1lc3NhZ2UgPSBzdGF0dXMgPT09ICdWQUxJRCcgPyBudWxsIDpcbiAgICAgICAgICB0aGlzLmZvcm1hdEVycm9ycyhjdHguZm9ybUNvbnRyb2wuZXJyb3JzLCBjdHgub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZXMpXG4gICAgICApO1xuICAgICAgY3R4LmZvcm1Db250cm9sLnZhbHVlQ2hhbmdlcy5zdWJzY3JpYmUodmFsdWUgPT4ge1xuICAgICAgICBpZiAoIV8uaXNFcXVhbChjdHguY29udHJvbFZhbHVlLCB2YWx1ZSkpIHsgY3R4LmNvbnRyb2xWYWx1ZSA9IHZhbHVlOyB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LmNvbnRyb2xOYW1lID0gY3R4LmxheW91dE5vZGUubmFtZTtcbiAgICAgIGN0eC5jb250cm9sVmFsdWUgPSBjdHgubGF5b3V0Tm9kZS52YWx1ZSB8fCBudWxsO1xuICAgICAgY29uc3QgZGF0YVBvaW50ZXIgPSB0aGlzLmdldERhdGFQb2ludGVyKGN0eCk7XG4gICAgICBpZiAoYmluZCAmJiBkYXRhUG9pbnRlcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGB3YXJuaW5nOiBjb250cm9sIFwiJHtkYXRhUG9pbnRlcn1cIiBpcyBub3QgYm91bmQgdG8gdGhlIEFuZ3VsYXIgRm9ybUdyb3VwLmApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3R4LmJvdW5kQ29udHJvbDtcbiAgfVxuXG4gIGZvcm1hdEVycm9ycyhlcnJvcnM6IGFueSwgdmFsaWRhdGlvbk1lc3NhZ2VzOiBhbnkgPSB7fSk6IHN0cmluZyB7XG4gICAgaWYgKGlzRW1wdHkoZXJyb3JzKSkgeyByZXR1cm4gbnVsbDsgfVxuICAgIGlmICghaXNPYmplY3QodmFsaWRhdGlvbk1lc3NhZ2VzKSkgeyB2YWxpZGF0aW9uTWVzc2FnZXMgPSB7fTsgfVxuICAgIGNvbnN0IGFkZFNwYWNlcyA9IHN0cmluZyA9PiBzdHJpbmdbMF0udG9VcHBlckNhc2UoKSArIChzdHJpbmcuc2xpY2UoMSkgfHwgJycpXG4gICAgICAucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxICQyJykucmVwbGFjZSgvXy9nLCAnICcpO1xuICAgIGNvbnN0IGZvcm1hdEVycm9yID0gKGVycm9yKSA9PiB0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnID9cbiAgICAgIE9iamVjdC5rZXlzKGVycm9yKS5tYXAoa2V5ID0+XG4gICAgICAgIGVycm9yW2tleV0gPT09IHRydWUgPyBhZGRTcGFjZXMoa2V5KSA6XG4gICAgICAgIGVycm9yW2tleV0gPT09IGZhbHNlID8gJ05vdCAnICsgYWRkU3BhY2VzKGtleSkgOlxuICAgICAgICBhZGRTcGFjZXMoa2V5KSArICc6ICcgKyBmb3JtYXRFcnJvcihlcnJvcltrZXldKVxuICAgICAgKS5qb2luKCcsICcpIDpcbiAgICAgIGFkZFNwYWNlcyhlcnJvci50b1N0cmluZygpKTtcbiAgICBjb25zdCBtZXNzYWdlcyA9IFtdO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhlcnJvcnMpXG4gICAgICAvLyBIaWRlICdyZXF1aXJlZCcgZXJyb3IsIHVubGVzcyBpdCBpcyB0aGUgb25seSBvbmVcbiAgICAgIC5maWx0ZXIoZXJyb3JLZXkgPT4gZXJyb3JLZXkgIT09ICdyZXF1aXJlZCcgfHwgT2JqZWN0LmtleXMoZXJyb3JzKS5sZW5ndGggPT09IDEpXG4gICAgICAubWFwKGVycm9yS2V5ID0+XG4gICAgICAgIC8vIElmIHZhbGlkYXRpb25NZXNzYWdlcyBpcyBhIHN0cmluZywgcmV0dXJuIGl0XG4gICAgICAgIHR5cGVvZiB2YWxpZGF0aW9uTWVzc2FnZXMgPT09ICdzdHJpbmcnID8gdmFsaWRhdGlvbk1lc3NhZ2VzIDpcbiAgICAgICAgLy8gSWYgY3VzdG9tIGVycm9yIG1lc3NhZ2UgaXMgYSBmdW5jdGlvbiwgcmV0dXJuIGZ1bmN0aW9uIHJlc3VsdFxuICAgICAgICB0eXBlb2YgdmFsaWRhdGlvbk1lc3NhZ2VzW2Vycm9yS2V5XSA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgdmFsaWRhdGlvbk1lc3NhZ2VzW2Vycm9yS2V5XShlcnJvcnNbZXJyb3JLZXldKSA6XG4gICAgICAgIC8vIElmIGN1c3RvbSBlcnJvciBtZXNzYWdlIGlzIGEgc3RyaW5nLCByZXBsYWNlIHBsYWNlaG9sZGVycyBhbmQgcmV0dXJuXG4gICAgICAgIHR5cGVvZiB2YWxpZGF0aW9uTWVzc2FnZXNbZXJyb3JLZXldID09PSAnc3RyaW5nJyA/XG4gICAgICAgICAgLy8gRG9lcyBlcnJvciBtZXNzYWdlIGhhdmUgYW55IHt7cHJvcGVydHl9fSBwbGFjZWhvbGRlcnM/XG4gICAgICAgICAgIS97ey4rP319Ly50ZXN0KHZhbGlkYXRpb25NZXNzYWdlc1tlcnJvcktleV0pID9cbiAgICAgICAgICAgIHZhbGlkYXRpb25NZXNzYWdlc1tlcnJvcktleV0gOlxuICAgICAgICAgICAgLy8gUmVwbGFjZSB7e3Byb3BlcnR5fX0gcGxhY2Vob2xkZXJzIHdpdGggdmFsdWVzXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhlcnJvcnNbZXJyb3JLZXldKVxuICAgICAgICAgICAgICAucmVkdWNlKChlcnJvck1lc3NhZ2UsIGVycm9yUHJvcGVydHkpID0+IGVycm9yTWVzc2FnZS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAoJ3t7JyArIGVycm9yUHJvcGVydHkgKyAnfX0nLCAnZycpLFxuICAgICAgICAgICAgICAgIGVycm9yc1tlcnJvcktleV1bZXJyb3JQcm9wZXJ0eV1cbiAgICAgICAgICAgICAgKSwgdmFsaWRhdGlvbk1lc3NhZ2VzW2Vycm9yS2V5XSkgOlxuICAgICAgICAgIC8vIElmIG5vIGN1c3RvbSBlcnJvciBtZXNzYWdlLCByZXR1cm4gZm9ybWF0dGVkIGVycm9yIGRhdGEgaW5zdGVhZFxuICAgICAgICAgIGFkZFNwYWNlcyhlcnJvcktleSkgKyAnIEVycm9yOiAnICsgZm9ybWF0RXJyb3IoZXJyb3JzW2Vycm9yS2V5XSlcbiAgICAgICkuam9pbignPGJyPicpO1xuICB9XG5cbiAgdXBkYXRlVmFsdWUoY3R4OiBhbnksIHZhbHVlOiBhbnkpOiB2b2lkIHtcblxuICAgIC8vIFNldCB2YWx1ZSBvZiBjdXJyZW50IGNvbnRyb2xcbiAgICBjdHguY29udHJvbFZhbHVlID0gdmFsdWU7XG4gICAgaWYgKGN0eC5ib3VuZENvbnRyb2wpIHtcbiAgICAgIGN0eC5mb3JtQ29udHJvbC5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICBjdHguZm9ybUNvbnRyb2wubWFya0FzRGlydHkoKTtcbiAgICB9XG4gICAgY3R4LmxheW91dE5vZGUudmFsdWUgPSB2YWx1ZTtcblxuICAgIC8vIFNldCB2YWx1ZXMgb2YgYW55IHJlbGF0ZWQgY29udHJvbHMgaW4gY29weVZhbHVlVG8gYXJyYXlcbiAgICBpZiAoaXNBcnJheShjdHgub3B0aW9ucy5jb3B5VmFsdWVUbykpIHtcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBjdHgub3B0aW9ucy5jb3B5VmFsdWVUbykge1xuICAgICAgICBjb25zdCB0YXJnZXRDb250cm9sID0gZ2V0Q29udHJvbCh0aGlzLmZvcm1Hcm91cCwgaXRlbSk7XG4gICAgICAgIGlmIChpc09iamVjdCh0YXJnZXRDb250cm9sKSAmJiB0eXBlb2YgdGFyZ2V0Q29udHJvbC5zZXRWYWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRhcmdldENvbnRyb2wuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgICAgIHRhcmdldENvbnRyb2wubWFya0FzRGlydHkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUFycmF5Q2hlY2tib3hMaXN0KGN0eDogYW55LCBjaGVja2JveExpc3Q6IFRpdGxlTWFwSXRlbVtdKTogdm9pZCB7XG4gICAgY29uc3QgZm9ybUFycmF5ID0gPEZvcm1BcnJheT50aGlzLmdldEZvcm1Db250cm9sKGN0eCk7XG5cbiAgICAvLyBSZW1vdmUgYWxsIGV4aXN0aW5nIGl0ZW1zXG4gICAgd2hpbGUgKGZvcm1BcnJheS52YWx1ZS5sZW5ndGgpIHsgZm9ybUFycmF5LnJlbW92ZUF0KDApOyB9XG5cbiAgICAvLyBSZS1hZGQgYW4gaXRlbSBmb3IgZWFjaCBjaGVja2VkIGJveFxuICAgIGNvbnN0IHJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIgKyAnLy0nLCB0aGlzLmRhdGFSZWN1cnNpdmVSZWZNYXAsIHRoaXMuYXJyYXlNYXBcbiAgICApO1xuICAgIGZvciAoY29uc3QgY2hlY2tib3hJdGVtIG9mIGNoZWNrYm94TGlzdCkge1xuICAgICAgaWYgKGNoZWNrYm94SXRlbS5jaGVja2VkKSB7XG4gICAgICAgIGNvbnN0IG5ld0Zvcm1Db250cm9sID0gYnVpbGRGb3JtR3JvdXAodGhpcy50ZW1wbGF0ZVJlZkxpYnJhcnlbcmVmUG9pbnRlcl0pO1xuICAgICAgICBuZXdGb3JtQ29udHJvbC5zZXRWYWx1ZShjaGVja2JveEl0ZW0udmFsdWUpO1xuICAgICAgICBmb3JtQXJyYXkucHVzaChuZXdGb3JtQ29udHJvbCk7XG4gICAgICB9XG4gICAgfVxuICAgIGZvcm1BcnJheS5tYXJrQXNEaXJ0eSgpO1xuICB9XG5cbiAgZ2V0Rm9ybUNvbnRyb2woY3R4OiBhbnkpOiBBYnN0cmFjdENvbnRyb2wge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fCAhaXNEZWZpbmVkKGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyKSB8fFxuICAgICAgY3R4LmxheW91dE5vZGUudHlwZSA9PT0gJyRyZWYnXG4gICAgKSB7IHJldHVybiBudWxsOyB9XG4gICAgcmV0dXJuIGdldENvbnRyb2wodGhpcy5mb3JtR3JvdXAsIHRoaXMuZ2V0RGF0YVBvaW50ZXIoY3R4KSk7XG4gIH1cblxuICBnZXRGb3JtQ29udHJvbFZhbHVlKGN0eDogYW55KTogQWJzdHJhY3RDb250cm9sIHtcbiAgICBpZiAoXG4gICAgICAhY3R4LmxheW91dE5vZGUgfHwgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcikgfHxcbiAgICAgIGN0eC5sYXlvdXROb2RlLnR5cGUgPT09ICckcmVmJ1xuICAgICkgeyByZXR1cm4gbnVsbDsgfVxuICAgIGNvbnN0IGNvbnRyb2wgPSBnZXRDb250cm9sKHRoaXMuZm9ybUdyb3VwLCB0aGlzLmdldERhdGFQb2ludGVyKGN0eCkpO1xuICAgIHJldHVybiBjb250cm9sID8gY29udHJvbC52YWx1ZSA6IG51bGw7XG4gIH1cblxuICBnZXRGb3JtQ29udHJvbEdyb3VwKGN0eDogYW55KTogRm9ybUFycmF5IHwgRm9ybUdyb3VwIHtcbiAgICBpZiAoIWN0eC5sYXlvdXROb2RlIHx8ICFpc0RlZmluZWQoY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIpKSB7IHJldHVybiBudWxsOyB9XG4gICAgcmV0dXJuIGdldENvbnRyb2wodGhpcy5mb3JtR3JvdXAsIHRoaXMuZ2V0RGF0YVBvaW50ZXIoY3R4KSwgdHJ1ZSk7XG4gIH1cblxuICBnZXRGb3JtQ29udHJvbE5hbWUoY3R4OiBhbnkpOiBzdHJpbmcge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fCAhaXNEZWZpbmVkKGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyKSB8fCAhaGFzVmFsdWUoY3R4LmRhdGFJbmRleClcbiAgICApIHsgcmV0dXJuIG51bGw7IH1cbiAgICByZXR1cm4gSnNvblBvaW50ZXIudG9LZXkodGhpcy5nZXREYXRhUG9pbnRlcihjdHgpKTtcbiAgfVxuXG4gIGdldExheW91dEFycmF5KGN0eDogYW55KTogYW55W10ge1xuICAgIHJldHVybiBKc29uUG9pbnRlci5nZXQodGhpcy5sYXlvdXQsIHRoaXMuZ2V0TGF5b3V0UG9pbnRlcihjdHgpLCAwLCAtMSk7XG4gIH1cblxuICBnZXRQYXJlbnROb2RlKGN0eDogYW55KTogYW55IHtcbiAgICByZXR1cm4gSnNvblBvaW50ZXIuZ2V0KHRoaXMubGF5b3V0LCB0aGlzLmdldExheW91dFBvaW50ZXIoY3R4KSwgMCwgLTIpO1xuICB9XG5cbiAgZ2V0RGF0YVBvaW50ZXIoY3R4OiBhbnkpOiBzdHJpbmcge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fCAhaXNEZWZpbmVkKGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyKSB8fCAhaGFzVmFsdWUoY3R4LmRhdGFJbmRleClcbiAgICApIHsgcmV0dXJuIG51bGw7IH1cbiAgICByZXR1cm4gSnNvblBvaW50ZXIudG9JbmRleGVkUG9pbnRlcihcbiAgICAgIGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyLCBjdHguZGF0YUluZGV4LCB0aGlzLmFycmF5TWFwXG4gICAgKTtcbiAgfVxuXG4gIGdldExheW91dFBvaW50ZXIoY3R4OiBhbnkpOiBzdHJpbmcge1xuICAgIGlmICghaGFzVmFsdWUoY3R4LmxheW91dEluZGV4KSkgeyByZXR1cm4gbnVsbDsgfVxuICAgIHJldHVybiAnLycgKyBjdHgubGF5b3V0SW5kZXguam9pbignL2l0ZW1zLycpO1xuICB9XG5cbiAgaXNDb250cm9sQm91bmQoY3R4OiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAoXG4gICAgICAhY3R4LmxheW91dE5vZGUgfHwgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcikgfHwgIWhhc1ZhbHVlKGN0eC5kYXRhSW5kZXgpXG4gICAgKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIGNvbnN0IGNvbnRyb2xHcm91cCA9IHRoaXMuZ2V0Rm9ybUNvbnRyb2xHcm91cChjdHgpO1xuICAgIGNvbnN0IG5hbWUgPSB0aGlzLmdldEZvcm1Db250cm9sTmFtZShjdHgpO1xuICAgIHJldHVybiBjb250cm9sR3JvdXAgPyBoYXNPd24oY29udHJvbEdyb3VwLmNvbnRyb2xzLCBuYW1lKSA6IGZhbHNlO1xuICB9XG5cbiAgYWRkSXRlbShjdHg6IGFueSwgbmFtZT86IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fCAhaXNEZWZpbmVkKGN0eC5sYXlvdXROb2RlLiRyZWYpIHx8XG4gICAgICAhaGFzVmFsdWUoY3R4LmRhdGFJbmRleCkgfHwgIWhhc1ZhbHVlKGN0eC5sYXlvdXRJbmRleClcbiAgICApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAvLyBDcmVhdGUgYSBuZXcgQW5ndWxhciBmb3JtIGNvbnRyb2wgZnJvbSBhIHRlbXBsYXRlIGluIHRlbXBsYXRlUmVmTGlicmFyeVxuICAgIGNvbnN0IG5ld0Zvcm1Hcm91cCA9IGJ1aWxkRm9ybUdyb3VwKHRoaXMudGVtcGxhdGVSZWZMaWJyYXJ5W2N0eC5sYXlvdXROb2RlLiRyZWZdKTtcblxuICAgIC8vIEFkZCB0aGUgbmV3IGZvcm0gY29udHJvbCB0byB0aGUgcGFyZW50IGZvcm1BcnJheSBvciBmb3JtR3JvdXBcbiAgICBpZiAoY3R4LmxheW91dE5vZGUuYXJyYXlJdGVtKSB7IC8vIEFkZCBuZXcgYXJyYXkgaXRlbSB0byBmb3JtQXJyYXlcbiAgICAgICg8Rm9ybUFycmF5PnRoaXMuZ2V0Rm9ybUNvbnRyb2xHcm91cChjdHgpKS5wdXNoKG5ld0Zvcm1Hcm91cCk7XG4gICAgfSBlbHNlIHsgLy8gQWRkIG5ldyAkcmVmIGl0ZW0gdG8gZm9ybUdyb3VwXG4gICAgICAoPEZvcm1Hcm91cD50aGlzLmdldEZvcm1Db250cm9sR3JvdXAoY3R4KSlcbiAgICAgICAgLmFkZENvbnRyb2wobmFtZSB8fCB0aGlzLmdldEZvcm1Db250cm9sTmFtZShjdHgpLCBuZXdGb3JtR3JvdXApO1xuICAgIH1cblxuICAgIC8vIENvcHkgYSBuZXcgbGF5b3V0Tm9kZSBmcm9tIGxheW91dFJlZkxpYnJhcnlcbiAgICBjb25zdCBuZXdMYXlvdXROb2RlID0gZ2V0TGF5b3V0Tm9kZShjdHgubGF5b3V0Tm9kZSwgdGhpcyk7XG4gICAgbmV3TGF5b3V0Tm9kZS5hcnJheUl0ZW0gPSBjdHgubGF5b3V0Tm9kZS5hcnJheUl0ZW07XG4gICAgaWYgKGN0eC5sYXlvdXROb2RlLmFycmF5SXRlbVR5cGUpIHtcbiAgICAgIG5ld0xheW91dE5vZGUuYXJyYXlJdGVtVHlwZSA9IGN0eC5sYXlvdXROb2RlLmFycmF5SXRlbVR5cGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBuZXdMYXlvdXROb2RlLmFycmF5SXRlbVR5cGU7XG4gICAgfVxuICAgIGlmIChuYW1lKSB7XG4gICAgICBuZXdMYXlvdXROb2RlLm5hbWUgPSBuYW1lO1xuICAgICAgbmV3TGF5b3V0Tm9kZS5kYXRhUG9pbnRlciArPSAnLycgKyBKc29uUG9pbnRlci5lc2NhcGUobmFtZSk7XG4gICAgICBuZXdMYXlvdXROb2RlLm9wdGlvbnMudGl0bGUgPSBmaXhUaXRsZShuYW1lKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIG5ldyBsYXlvdXROb2RlIHRvIHRoZSBmb3JtIGxheW91dFxuICAgIEpzb25Qb2ludGVyLmluc2VydCh0aGlzLmxheW91dCwgdGhpcy5nZXRMYXlvdXRQb2ludGVyKGN0eCksIG5ld0xheW91dE5vZGUpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBtb3ZlQXJyYXlJdGVtKGN0eDogYW55LCBvbGRJbmRleDogbnVtYmVyLCBuZXdJbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKFxuICAgICAgIWN0eC5sYXlvdXROb2RlIHx8ICFpc0RlZmluZWQoY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIpIHx8XG4gICAgICAhaGFzVmFsdWUoY3R4LmRhdGFJbmRleCkgfHwgIWhhc1ZhbHVlKGN0eC5sYXlvdXRJbmRleCkgfHxcbiAgICAgICFpc0RlZmluZWQob2xkSW5kZXgpIHx8ICFpc0RlZmluZWQobmV3SW5kZXgpIHx8IG9sZEluZGV4ID09PSBuZXdJbmRleFxuICAgICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIC8vIE1vdmUgaXRlbSBpbiB0aGUgZm9ybUFycmF5XG4gICAgY29uc3QgZm9ybUFycmF5ID0gPEZvcm1BcnJheT50aGlzLmdldEZvcm1Db250cm9sR3JvdXAoY3R4KTtcbiAgICBjb25zdCBhcnJheUl0ZW0gPSBmb3JtQXJyYXkuYXQob2xkSW5kZXgpO1xuICAgIGZvcm1BcnJheS5yZW1vdmVBdChvbGRJbmRleCk7XG4gICAgZm9ybUFycmF5Lmluc2VydChuZXdJbmRleCwgYXJyYXlJdGVtKTtcbiAgICBmb3JtQXJyYXkudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpO1xuXG4gICAgLy8gTW92ZSBsYXlvdXQgaXRlbVxuICAgIGNvbnN0IGxheW91dEFycmF5ID0gdGhpcy5nZXRMYXlvdXRBcnJheShjdHgpO1xuICAgIGxheW91dEFycmF5LnNwbGljZShuZXdJbmRleCwgMCwgbGF5b3V0QXJyYXkuc3BsaWNlKG9sZEluZGV4LCAxKVswXSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZW1vdmVJdGVtKGN0eDogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKFxuICAgICAgIWN0eC5sYXlvdXROb2RlIHx8ICFpc0RlZmluZWQoY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIpIHx8XG4gICAgICAhaGFzVmFsdWUoY3R4LmRhdGFJbmRleCkgfHwgIWhhc1ZhbHVlKGN0eC5sYXlvdXRJbmRleClcbiAgICApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAvLyBSZW1vdmUgdGhlIEFuZ3VsYXIgZm9ybSBjb250cm9sIGZyb20gdGhlIHBhcmVudCBmb3JtQXJyYXkgb3IgZm9ybUdyb3VwXG4gICAgaWYgKGN0eC5sYXlvdXROb2RlLmFycmF5SXRlbSkgeyAvLyBSZW1vdmUgYXJyYXkgaXRlbSBmcm9tIGZvcm1BcnJheVxuICAgICAgKDxGb3JtQXJyYXk+dGhpcy5nZXRGb3JtQ29udHJvbEdyb3VwKGN0eCkpXG4gICAgICAgIC5yZW1vdmVBdChjdHguZGF0YUluZGV4W2N0eC5kYXRhSW5kZXgubGVuZ3RoIC0gMV0pO1xuICAgIH0gZWxzZSB7IC8vIFJlbW92ZSAkcmVmIGl0ZW0gZnJvbSBmb3JtR3JvdXBcbiAgICAgICg8Rm9ybUdyb3VwPnRoaXMuZ2V0Rm9ybUNvbnRyb2xHcm91cChjdHgpKVxuICAgICAgICAucmVtb3ZlQ29udHJvbCh0aGlzLmdldEZvcm1Db250cm9sTmFtZShjdHgpKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgbGF5b3V0Tm9kZSBmcm9tIGxheW91dFxuICAgIEpzb25Qb2ludGVyLnJlbW92ZSh0aGlzLmxheW91dCwgdGhpcy5nZXRMYXlvdXRQb2ludGVyKGN0eCkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iXX0=