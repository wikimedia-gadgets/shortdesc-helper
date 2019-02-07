/**
 * @license MIT
 * MIT License
 * Copyright (c) 2019 Galobtter
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
*/
'use strict';

let libSettings = {};

/* Internal console/error message functions. */

/**
 * @func
 * @name buildMessage
 * @param {string} message
 * @return {string} Message with '[libSettings]' prefix.
*/
libSettings.buildMessage = function ( message ) {
	return ( '[libSettings] ' + message );
};

/**
 * @func
 * @name log
 * @param {string} message
*/
libSettings.log = function ( message ) {
	console.log( libSettings.buildMessage( message ) );
};

/**
 * @func
 * @name warn
 * @param {string} message
*/
libSettings.warn = function ( message ) {
	console.warn( libSettings.buildMessage( message ) );
};

/**
 * @func
 * @name error
 * @param {string} message
 * @param {string} [errorType = 'Error']
*/
libSettings.error = function ( message, errorType = 'Error' ) {
	// FIXME Use console.error?
	throw new window[ errorType ]( libSettings.buildMessage( message ) );
};

/** Used so that functions can take a parameter regarding whether
 * an error should be raised, or a warning logged.
 * @func
 * @name throw
 * @param {string} message
 * @param {('warn'|'error')} errorLevel
 * @param {string} errorType
*/
libSettings.throw = function ( message, errorLevel, errorType ) {
	switch ( errorLevel ) {
		case 'warn':
			libSettings.warn( message );
			break;
		case 'error':
			libSettings.error( message, errorType );
	}
};

/** Represents an option.
 * @abstract
 * @param {Object} config
 * @property {string} config.name Name of option. (required)
 * @property {*} config.defaultValue (required)
 * @property {string} config.text Text displayed in settings. (required)
 * @property {string} config.helptip Help text shown in settings.
 * @property {Array} config.possibleValues Either [ <value>, .. ] or
 *  [ [ <InternalValue>, <ValueDisplayedInSettings> ], .. ].
 *  Value is validated against possibleValues.
 * @property {...string} config.basetype Type to validate against (Defined by extending classes).
*/

libSettings.Option = class {
	constructor( config, basetype ) {
		this.name = config.name;
		this.defaultValue = config.defaultValue;
		this.possibeValues = config.possibleValues;
		switch ( typeof this.possibleValues ) {
			case 'Array':
				this.possibleKeys = this.possibleValues;
				this.possibleSettingsVal = this.possibleValues;
				break;
			case 'Object':
				this.possibleKeys = this.possibleValues.keys();
				this.possibleSettingsVal = this.possibleValues.values();
		}
		this.text = config.text;
		this.basetype = basetype;
		this.validate( this.defaultValue, 'error' );
	}

	validate( value, errorLevel ) {
		// Check type
		if (
			this.basetype &&
			!this.basetype.some( ( type ) => typeof value === type )
		) {
			let message = `Value of ${this.name}  does not have one of the type(s) [${this.basetype}].`;
			libSettings.throw( message, errorLevel, 'TypeError' );
			return false;
		}

		// Check if in possibleValues
		if ( this.possibleKeys.indexOf( value ) === -1 ) {
			let message = `Value of option ${this.name}, ${value}, is not in [${this.possibleKeys}].`;
			libSettings.throw( message, errorLevel );
			return false;
		}

		return true;
	}

	setValue( value ) {
		if ( this.validate( value ) ) {
			this.value = value;
		} else {
			libSettings.warn( `Validation of the value of ${this.name}, failed, so the default setting of ${this.defaultValue} has been used.` );
			this.value = this.defaultValue;
		}
	}
};

/**
 * @class
 * @name BooleanOption
 * @extends Option */

class BooleanOption extends Option {
	super() {}
}

/* Use internalization Date () thingy */
class DateOption extends Option {

}

/**
 * @class
 * @name Settings
 * @param {Array.<Object>} optionsConfig
 * @property {string} optionsConfig[].title Header of particular set of preferences
 * @property {(boolean|Function)} optionsConfig[].show Boolean or anonymous function that returns a
 * Boolean. Can use anonymous function when a variable is only loaded after the settings is loaded.
 * @property {(boolean|Function)} optionsConfig[].collapsed Whether the settings should be collapsed
 *  (e.g, if it is rarely used "Advanced" settings).
 * @property {...Option} optionsConfig[].preferences Array of Option objects.
 * @example Foo. foo
*/

libSettings.Settings = class {
	constructor( optionsConfig ) {

	}
	// Load settings
};

libSettings.Settings.prototype.load = function () {
	// userSettings =
	// self.options =
	// self.loadPromise = foo
};

libSettings.Settings.prototype.get = function () {
	// check if already loading settings
	if ( !self.loadPromise ) {
		self.load();
	}
	// self.loadPromise.then (
};
