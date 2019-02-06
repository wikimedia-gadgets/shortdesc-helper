/* WARNING: NO JQUERY */
'use strict';

libSettings = {}

/* Internal console/error message functions. */

/* @param {string} message
 * @returns {string}
*/
libSettings.buildMessage = function ( messsage ) {
	return ( '[libSettings] ' + message )
}

/* @param {string} message */
libSettings.log = function ( message ) {
	console.log ( libSettings.buildMessage ( message ) )
}

/* @param {string} message */
libSettings.warn = function ( message ) {
	console.warn ( libSettings.buildMessage ( message ) )
}

/* @param {string} message
 * @param {'type'} errorType
*/
libSettings.error = function ( message, errorType ) {
	switch errorType {
		case 'type':
			throw new TypeError ( libSettings.buildMessage (message ) );
		default:
			throw new Error ( libSettings.buildMessage (message ) );
	}
}

/* Used so that functions can take a parameter regarding whether
 * an error should be raised, or a warning logged.
 * @param {string} message
 * @param {'warn'|'error'} errorLevel
*/
libSettings.throw function ( message, errorLevel, errorType ) {
	switch errorLevel {
		case 'warn':
			libSettings.warn ( message );
		case 'error':
			libSettings.error ( message, errorType );
	}
}

/* Represents an option.
 * @abstract
 * @param {Object} config
 * @cfg {string} name Name of option. (required)
 * @cfg {Mixed} defaultValue (required)
 * @cfg {Array|Object} possibleValues Either [<value>,..] or { [<InternalValue>, <Value displayed in settings>], ..}
 *  value is validated against possibleValues.
 * @cfg {string} text Text displayed in settings. (required)
 * @cfg {string} helptip Help text shown in settings.
 * @cfg {string[]} basetype Javascript type to validate against (Defined by extending classes).
*/

libSettings.Option = function ( config, basetype ) {
	this.name = config.name
	this.defaultValue = config.defaultValue
	this.possibeValues = config.possibleValues
	switch typeof this.possibleValues
		case "Object":
			this.possibleKeys = this.possibleValues
		case 'Object':
			this.possibleKeys = this.possibleValues.keys();
	this.text = config.text
	this.basetype = basetype

	//
	this.validate ( this.defaultValue, 'error' );
}

libSettings.Option.prototype.validate = function ( value, errorLevel ) {
	//Check type
	var checkType = function ( type, errorLevel ) {
		if ( typeof value === type ) {
			return true;
		} else {
			return false;
		}
	}

	if ( this.basetype && !this.basetype.some ( checkType ) ) {
		var message = 'Value of ' + this.name +' does not have one of the type(s) '
						+ this.basetype;
		libSettings.throw ( message, errorLevel, 'type' );
		return false
	}

	//Check if in possibleValues
	if this.possibleKeys.indexOf ( value ) === -1 {
		var message ='Value of ' + this.name + ',' + value + ', is not in ' + this.possibleKeys;
		libSettings.throw ( message, errorLevel );
		return false
	}

	return true
}

libSettings.Option.prototype.setValue ( value ) {
	if this.validate ( value ) {
		this.value = value
	} else {
		libSettings.warn ( Validation of the value of' + this.name + ',' +
			' failed, so the default setting of' + this.defaultValue + 'has been used.' ) //FIXME Template literals!! CONVERT TO ES6
		this.value = this.defaultValue
	}
}


/* @class
 * @extends Option */

var BooleanOption = function ( config ) {
	Option.call ( config, 'Boolean' );


/* @class Settings */
/*
 * @param {Object[]} optionsConfig
 * @cfg {String} title Header of particular set of preferences
 * @cfg {Boolean|Function} show Boolean or anonymous function that returns a Boolean.
 *  Can use anonymous function when a variable is only loaded after the settings is loaded.
 * @cfg {Boolean|Function} collapsed Whether the settings should be collapsed
 *  (e.g, if it is rarely used "Advanced" settings).
 * @cfg {Option[]} preferences Array of Option objects.
*/

libSettings.Settings = function ( optionsConfig ) {


	//Load settings
}

libSettings.Settings.prototype.load = function () {
	userSettings =
	self.options =
	self.loadPromise = foo
}

libSettings.Settings.prototype.get = function () {
	//check if already loading settings
	if ( !self.loadPromise ) {
		self.load()
	}
	self.loadPromise.then (

}
