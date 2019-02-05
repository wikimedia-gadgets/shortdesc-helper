/* Base Option constructor
 * Cannot be used directly
 * @definition contains
 * @name Name of option
 * @value { 'InternalValue': 'Value displayed in settings', ..}
 *  Values are validated against vals.
 * @text Text displayed in settings
 * @helptip Help text shown in settings
 * These are required to be defined by inherited constructors
 * @type General custom type, can correspond with basetype
 * @basetype Javascript type to validate against
*/

var Option = function ( definition ) {
	self = Object.assign (this, definition);
	self.type

}


/* Constructors inherited from Option
 * All inherited constructors need to define type
*/

var BoleanOption = function () {
	Option.call ( this.


/* Settings constructor
 * @optionsConfig
 *  Array of options in CamelCase
 *  Each option is a base Option object
*/

var Settings = function ( optionsConfig ) {
	self = this


	var self.validate = function () {

	}
	//Load settings
	var self.load = function () {
		userSettings =
		self.options =
		return self.options
	}
}
