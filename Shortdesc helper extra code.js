var wikidataAPI = new mw.ForeignApi( 'https://www.wikidata.org/w/api.php' );
		wikidataAPI.postWithToken ( 'csrf', {


		}
//TODO:
//when {{short description|none}} present in pre-parsed text, indicate that that is so
//when empty description added make it "{{short description|none}}"
//disable importing of "Wikimedia list article" (but allow addition of local short description). remove use of jquery?, use mw.util.addCSS to add css styles, remove left-side save button rounded borders and right-side input box rounded borders; keyboard shortcuts, automatically generate descriptions for certain types of articles, semi-automatically switch to next article in a list (just need to load an article through window.load. or something), settings menu with help

//fancy checking
// var updateOnChange = function () {
// 	length = descriptionInput.getInputLength();
// 	disableSave = false
// 	if (isLocal) {
// 		text = descriptionInput.getValue();//check if short description equal to existing
// 		if (text === pageDescription) {
// 			disableSave = true
// 		}
// 	};
//
// 	if (disableSave) {//need to also disable enter
// 		descriptionInput.off ( "enter", saveInput);
// 		saveButton.setDisabled(true);
// 	}
// 	else {
// 		descriptionInput.on ( "enter", saveInput);
// 		saveButton.setDisabled (false);
// 	};
//
// 	descriptionInput.setLabel (String(length));
// };
// 			if (isLocal) {//if this is slow, disable
// 				text = descriptionInput.getValue();//check if short description equal to existing
// 				if (text === pageDescription) {
// 					disableSave = true
// 				}
// 			};

// 			if (length === 0) {disableSave = true};//check if short description is empty
//
// 			if (disableSave) {//need to also disable enter
// 				saveButton.setDisabled(true);
// 			}
// 			else {
// 				saveButton.setDisabled (false);
// 			};
			//if (length > 40) {
			//	descriptionInput.setLabelElement($('<span>').css("font-color", "Brown").text(String(length)));
			//}
//
//help
//help: new OO.ui.HtmlSnippet ("The <a href = '/wiki/Wikipedia:Short_description'>short description</a> of an page is a concise explanation of its scope. The short description should be as brief as possible. A target of 40 characters has been suggested, but this can be exceeded when necessary. See the section <a href = '/wiki/Wikipedia:Short_description#Content'> Wikipedia:Short description#Content</a> for more guidance on writing a short description. (" + clicky( "", 'Hide this help?', hideHelp)[0].outerHTML + ")"),
//
//settings
// 		var hideSettings = function () {
// 			//create confirmation window (remember to mw.loader.using the relevant ooui.window) asking if user wants to permanently hide the help, then if ok,  save in Shortdesc helper settings.js
// 		}


//autogen
//if (showAutoGen) {
//	clickyelements = addAutoGen (clickyelements)
//}


//Constructor of options list
var OptionsList = function () {
	var toolFactory = new OO.ui.ToolFactory();
	var toolGroupFactory = new OO.ui.ToolGroupFactory();
	var toolbar = new OO.ui.Toolbar( toolFactory, toolGroupFactory, { id: 'sdh-toolbar' } );

	var HelpTool =  function () {
		HelpTool.parent.apply( this, arguments );
	}
	OO.inheritClass ( HelpTool, OO.ui.Tool );
	HelpTool.static.name = 'help';
	HelpTool.static.icon = 'help';
	HelpTool.static.title = 'Help';
	HelpTool.prototype.onSelect = function () {};
	HelpTool.prototype.onUpdateState = function () {};
	toolFactory.register( HelpTool );

// 	this.downButton = new OO.ui.ButtonWidget( {
// 		title: 'More',
// 		indicator: 'down',
// 		popup: {
// 			$content: toolFactory.$element
// 		}
// 	} );

	toolbar.setup ( [
		{
			type: 'list',
			indicator: 'down',
			icon: '',
			include: [ 'help' ]
		}
	] )

	return toolbar
}





//var dropdown = $( '.oo-ui-toolbar-tools', optionsList.$element ).prop('outerHTML') + $( '.oo-ui-toolbar-popups', optionsList.$element ).prop('outerHTML') //hack
		var dropdown = optionsList.$element;//.replace ( '<div style="clear:both"></div>', '')
		$( '#sdh' ).append(
			$ ( '<div>' )
				.prop ( 'id', 'sdh-mainbox' )

				.append ( actionField.$element, dropdown )
		);
		optionsList.initialize ();





$( '#sdh-editbox' ).css ( 'min-width', window.shortdescInputWidth + 'em' );
