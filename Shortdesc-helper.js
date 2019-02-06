/*  _____________________________________________________________________________
 * |                                                                             |
 * |                    === WARNING: GLOBAL GADGET FILE ===                      |
 * |                  Changes to this page affect many users.                    |
 * | Please discuss changes on the talk page or on [[WT:Gadget]] before editing. |
 * |_____________________________________________________________________________|
 *
 */
/* Shortdesc helper: v3.2.7
 * Documentation at [[User:Galobtter/Shortdesc helper]]
 * Shows short descriptions, and allows importing wikidata descriptions, adding descriptions, and easier editing of them
 * by giving buttons and inputbox for doing so.
 * Forked from [[MediaWiki:Gadget-Page descriptions.js]] written by the TheDJ. */


var optionsConfig = [
{
	title: "Main",
	preferences: [
		new NumberOption( {
			name: "InputWidth",
			label: "Width of editing input",
			defaultValue: 35
		} ),
		new BoleanOption( {
			name: "AddToRedirect",
			label: "Allow additions to redirects",
			helptip: "When checked, redirects will have ",
			defaultValue: true
		} ),
		new StringOption( {
			name: "SaveWikidata",
			label: "Save changes to Wikidata",
			defaultValue: 'add',
			values: [
				[ 'add', 'Only on additions (default)' ],
				[ 'all', 'On all changes' ],
				[ 'never', 'Never' ]
			]
		} )
	]
},

{
	title: "Semi-automated options",
	show: HasAWBAccess
},

{
	title: "Advanced",
	preferences: [
		new BoleanOption( {
			name: "ClashFix",
			label: "Disable css used to prevent content jump.",
			helptip: "You'd want to this if you have another script that clashes with this one\
			, such as User:Yair_rand/WikidataInfo.js.",
			value: false
		} )
	]
}

]


/* Load when viewing a page that exists. */
if ( mw.config.get( 'wgAction' ) === 'view' && mw.config.get ( 'wgArticleId' ) !== 0 ) {
	mw.loader.using( [ 'mediawiki.api' ] ).then( function () {

/* Grab config variables */
var title = mw.config.get( 'wgPageName' );
var namespace = mw.config.get( 'wgNamespaceNumber' );
var wgQid = mw.config.get( 'wgWikibaseItemId' );
var language =  mw.config.get( 'wgContentLanguage' );
var canEdit = mw.config.get( 'wgIsProbablyEditable' );
var isRedirect = mw.config.get ( 'wgIsRedirect' );
var username = mw.config.get ( 'wgUserName' );
//check if autoconfirmed, can edit the page, and disallow editing in template and category namespaces, to prevent accidental addition
var allowEditing = (
	canEdit &&
	![ 10, 14, 710, 828, 2300, 2302 ].includes( namespace )
);

var API = new mw.Api( {
	ajax: {
		headers: {
			'Api-User-Agent': 'Short description editer/viewer (User:Galobtter/Shortdesc helper)'
			}
		}
} );

//Function for grabbing lead section text
var getText = function () {
	return API.get( {
		action: 'query',
		prop: 'revisions',
		titles: title,
		rvprop: 'content',
		rvsection: 0,
		rvslots: 'main',
		formatversion: 2
	} );
};

//Get the lead section text
var callPromiseText = getText();

//Get the short description
var callPromiseDescription = API.get( {
		action: 'query',
		titles: title,
		prop: 'description',
		formatversion: 2
	} );

/* User options */
settings = new Settings ( )
options = settings.load ()

/* Execute main code once the short description is gotten */
$.when( callPromiseDescription, $.ready ).then( function ( resultsDescription ) {
var summary, change, $description, infoPopup, actionField;

var response = resultsDescription[0];
var pages = response.query.pages[0];
var pageDescription = pages.description;
var isLocal = (pages.descriptionsource === 'local') ? true: false;

/* Search pattern for finding short description in wikitext.
 * Group 1 is the short description. */
var pattern = /\{\{[Ss]hort description\|(.*?)\}\}/;

/* UI functions: Buttons */

/* Creates "clickies", simple link buttons. */
var Clicky = function ( descrip, text, func ) {
	this.button =  $( '<span>' )
		.addClass( 'sdh-clicky' )
		.append( $( '<a>' )
			.attr( 'title', descrip )
			.text( text )
			.click( func )
		 );
};

/* Creates OOui buttons, which are used for save and cancel. */
var OOuiClicky = function ( descrip, text, func, flags ) {
	this.button = new OO.ui.ButtonWidget( {
			label: text,
			title: descrip,
			flags: flags,
			classes: [ 'sdh-ooui-clicky' ]
		} );
	this.button.on( 'click', func );
};

/* UI function: Clicky + Popup */
var InfoClickyPopup = function ( text ) {
	var self = this;
	self.text = text;

	self.infoClicky =  new Clicky(
		'Click for info',
		'?',
		function () {
			if ( !infoPopup ) {
				mw.loader.using ( [ 'oojs-ui-core', 'oojs-ui-widgets' ] ).then ( function () {
					infoPopup = new OO.ui.PopupWidget( {
						$content: $ ( '<span>' ).append ( self.text ),
						$autoCloseIgnore: self.infoClicky,
						padded: true,
						autoClose: true,
						width: 300,
						position: 'after'
					} );
					$ ( '.sdh-clickies' ).append ( infoPopup.$element );
					infoPopup.toggle();
				} );
			} else {
				infoPopup.toggle();
			}
		}
	).button;

	self.$element = self.infoClicky;
};

/* Function to check if the short description is in the wikitext
 * If it is, return the short description as defined in the text */
var shortdescInText = function ( resultLead ) {
	var lead = resultLead[0].query.pages[0].revisions[0].slots.main.content;
	var match = lead.match(pattern);
	if ( match ) {
		return [ true, lead, match[1] ];
	} else {
		return [ false, lead, false ];
	}
};

/* This function adds or replaces short descriptions. */
var addDescription = function ( newDescription, cancelButton ) {
	var changes, prependText, appendText, text;

	//Helper function to add quotes around text
	var quotify = function ( text ) {
		if ( text === '' || text === 'none' ) {
			return 'none';
		} else {
			return '"' + text + '"';
		}
	};

	newDescription = newDescription.trim();

	//Capitalize first letter by default unless editing local description
	if ( !isLocal ) {
		newDescription = newDescription.charAt(0).toUpperCase() + newDescription.slice(1);
	}

	if ( newDescription === '' ) {
		newDescription = 'none';
	}

	var replacement = '{'+'{'+'short description\|'+newDescription+'}}';

	/* Appends, prepends, or replaces the lead section
	 * depending on which of text, prependText, and appendText exists. */
	var makeEdit = function () {
		API.postWithToken( 'csrf', {
			action: 'edit',
			section: 0,
			text: text,
			title: title,
			prependtext: prependText,
			appendtext: appendText,
			summary: summary + ' [[Wikipedia:Short description|short description]]' + changes + ' ([[User:Galobtter/Shortdesc helper|Shortdesc helper]])'
		} ).then(
			function () {
				// Reload the page
				window.location.reload()
			},
			function ( code, jqxhr ) {
				// Edit fails; log reason for that.
				if ( code === 'http' && jqxhr.textStatus === 'error' ) {
					console.log( 'HTTP error ' + jqxhr.xhr.status );
				} else if ( code === 'http' ) {
					console.log( 'HTTP error: ' + jqxhr.textStatus );
				} else if ( code === 'ok-but-empty' ) {
					console.log( 'Error: Got an empty response from the server' );
				} else {
					console.log( 'API error: ' + code );
				}
			} );
	};

	/* Replaces the current local short description with the new one.
	 * If the short description doesn't exist in the text, return false. */
	var replaceAndEdit = function ( resultLead ) {
		var output = shortdescInText( resultLead );
		var isInText = output[0];
		var oldtext = output[1];
		var descriptionFromText = output[2];
		if ( isInText ) {
			text = oldtext.replace( pattern, replacement );
			makeEdit();
			return true;
		} else {
			return false;
		}
	};

	//var change is defined by the button that was clicked
	if ( !change ) {
		changes = ': ' + quotify( newDescription );
		if ( isRedirect ) {
			appendText = '\n' + replacement;
		} else {
			prependText = replacement + '\n';
		}
		makeEdit();
	} else {
		changes = ' from ' + quotify( pageDescription ) + ' to ' + quotify( newDescription );

		/* Get the lead section text again right before making the edit
		 * to avoid issues with edit conflicts, and make the edit. */
		$.when( getText(), $.ready ).then( function ( result ) {
			if ( !replaceAndEdit( result ) ) {
				cancelButton.setDisabled( false );
				console.log( 'Shortdesc helper: Unable to find short description in page' );
				mw.notify( 'Edit failed, as no short description template was found in\
					the page wikitext. This is probably due to an edit conflict.', { autoHide: false } );
			}
		} );
	}
};

/* Creates input box with save and cancel buttons. */
var textInput = function () {
	/* If reopening the input box, show it again.
	 * Otherwise, create the input box using OOui. */
	if (actionField) {
		$( '#sdh-showdescrip' ).hide( 0 );
		actionField.toggle();
	} else {
		mw.loader.using ( [ 'oojs-ui-core', 'oojs-ui-widgets' ] ).then ( function () {
			$( '#sdh-showdescrip' ).hide( 0 );
			var length;
			//Define the input box and buttons.
			var descriptionInput = new OO.ui.TextInputWidget( {
				autocomplete: false,
				autofocus: true,
				id: [ 'sdh-inputbox' ],
				label: '0',
				value: pageDescription,
				placeholder: 'Short description'
			} );

			var saveButton = new OOuiClicky(
				'Save description',
				'Save',
				function () {
					saveInput();
				},
				[ 'primary', 'progressive' ]
			).button;

			var cancelButton = new OOuiClicky(
				'Cancel editing',
				'Cancel',
				function () {
					actionField.toggle();
					$( '#sdh-showdescrip' ).show (0);
				},
				[ 'safe', 'destructive' ]
			).button;

			var savecancelButtons = new OO.ui.ButtonGroupWidget( {
				items: [ saveButton, cancelButton ]
			} );

			//On change, update character count label.
			var updateOnChange = function () {
				length = descriptionInput.getInputLength();
				descriptionInput.setLabel ( String( length ) );

			};

			var saveInput = function () {
				saveButton.setDisabled( true );
				cancelButton.setDisabled( true );
				descriptionInput.setDisabled( true );
				addDescription( descriptionInput.getValue(), cancelButton );
			};

			actionField = new OO.ui.ActionFieldLayout(
				descriptionInput,
				savecancelButtons, {
					label: '', //For some dumb reason, the buttons won't align with the inputbox unless a dummy label is put
					align: 'top',
					id: [ 'sdh-editbox' ]
				}
			);

			//Initial character count
			updateOnChange();

			descriptionInput.on( 'change', updateOnChange );
			descriptionInput.on( 'enter', saveInput );

			$( '#sdh' ).append( actionField.$element );

			//Size the inputbox
			$( '#sdh-editbox, #sdh-inputbox' ).css( 'max-width', options.InputWidth + 'em' ); //TODO fix on timeless to be less wide
		} );
	}
};

var combineClickies = function ( clickyElements ) {
	if ( clickyElements ) {
		var clickies = $( '<span>' ).addClass( 'sdh-clickies' );
		for ( var x in clickyElements ) {
			clickies.append( clickyElements[ x ] );
		}
		$description.append( clickies );
	}
};

var appendDescription  = function () {
	//Add the main div
	$( '#contentSub' ).append(
		$ ( '<div>' )
			.prop ( 'id',  'sdh' )
			.css ( 'margin-top', options.ClashFix ? '1.2em': '0' ) //TODO: this will apply to all skins, only apply vector - use mw.util.addCSS?
	);

	if ( $description ) {
		$( '#sdh' ).append( $description );
	}
};

var updateSDH = function ( clickyElements ) {
	combineClickies( clickyElements );
	appendDescription();
};


/* Main code
 * Shows the short description and
 * depending on various factors, such as:
 * Whether the description exists
 * Whether the description is on wikidata or not
 * Whether the page is in mainspace.
 * Show the relevant buttons ("clickies"), which are stored as a list in clickyElements
 * $description stores the html generated.
 * Once clickyElements is generated, it is added to $description using combineClickies
 * and added to the main wrapping div, #sdh using appendDescription.
 */


$.when( callPromiseText, $.ready ).then( function ( result ) {
	var clickyElements;
	var initIsInText = false;

	$description = $( '<div>' ).prop ( 'id',  'sdh-showdescrip' );

	var output = shortdescInText( result );
	initIsInText = output[0];
	var initLead = output[1];
	var descriptionFromText = output[2];

	//Handle {{Shor​t description|none}}
	if ( descriptionFromText && ( descriptionFromText.trim() === 'none' ) ) {
		$description.append (
			$ ( '<span>' )
				.text ( 'This page has deliberately no description.' )
		);

		clickyElements = [
			new Clicky(
				'Add short description',
				'Add',
				function () {
					summary =  'Changing';
					change = true;
					pageDescription = '';
					textInput();
				}
			).button,
			new InfoClickyPopup (
				'A page is deliberately set to have an empty short description using the code {{Shor​t description|none}}. Note, however, that for now the Wikidata short description is actually still shown if available.'
			).$element
		];

		updateSDH( clickyElements );
		return;
	}

	if ( pageDescription )
	{
		$description.append(
			$( '<span>' )
				.text( pageDescription )
				.addClass( 'mw-page-description ')
		);

		if ( !isLocal ) {
			clickyElements = [ $( '<span>' )
				.addClass( 'sdh-clicky' )
				.append( $( '<a>' )
					.attr( 'href', 'https://www.wikidata.org/wiki/Special:SetLabelDescriptionAliases/' + wgQid + '/' + language )
					.addClass( 'sdh-wikidata-description' )
					.text( 'Wikidata' )
				) ]
		}

		if ( allowEditing )  {
			if ( isLocal ) {
				if (initIsInText) {
					clickyElements = [
						new Clicky(
							'Edit short description',
							'Edit',
							function () {
								summary =  'Changing';
								change = true;
								textInput();
							}
						).button
					];
				} else {
					clickyElements = [
						new Clicky(
							'Override current short description',
							'Override',
							function () {
								summary = 'Adding custom';
								textInput();
							}
						).button,
						new InfoClickyPopup (
							'<p>While this description can be overridden with another local short description, it cannot be directly edited. This is most likely because it is automatically generated by the article\'s infobox or some other template. See <a href = "/wiki/Wikipedia:WikiProject_Short_descriptions#Auto-generated_and_bot_generated_Descriptions"> this page</a> for more info.</p>'
						).$element
					];
				}
			} else {
				clickyElements.push(
					new Clicky(
						'Import description from Wikidata',
						'Import',
						function () {
							//Disable all clicky buttons
							$( '.sdh-clicky a' )
								.css ( 'pointer-events', 'none' )
								.off ();

							//Add processing ... animation
							$( '#sdh-showdescrip ' ).append(
								$( '<div>')
									.addClass ( 'sdh-processing' )
									.css ( 'margin-left', '0.5em' ) //TODO move to CSS file
							);

							for ( var x = 0; x < 3; x++ ) {
								$( '.sdh-processing' ).append(
									$( '<div>' )
										.addClass ( [ 'sdh-processing-dot', 'sdh-processing-dot-' + x ] )
										.text ( '.' )
								);
							}

							summary = "Importing Wikidata";
							addDescription( pageDescription );
						}
					).button,
					new Clicky(
						'Edit and import description from Wikidata',
						'Edit and Import',
						function () {
							summary = "Adding local";
							textInput();
						}
					).button
				);
				console.log ( clickyElements );
			}
		}
		updateSDH(clickyElements);
	} else if (
		namespace === 0 &&
		( !isRedirect || ( isRedirect && options.AddToRedirect ) )
		) {
		//indicate that description is missing
		$description = (
			$( '<div>' )
				.prop( 'id', 'sdh-showdescrip')
				.append(
					$( '<span>' )
						.addClass ( 'sdh-missing-description' )
						.text ( 'Missing ' ),
					$( '<a>' )
						.attr( 'href', '/wiki/Wikipedia:Short description' )
						.text( (isRedirect ? 'redirect' : 'article') + ' description' )
				)
		);

		if ( allowEditing ) {
			clickyElements = [
				new Clicky(
					'Add description',
					'Add',
					function () {
						summary = "Adding";
						textInput();
					}
				).button
			];
		}
		updateSDH(clickyElements);
	}
} );

/* Close callPromiseDescription, mw.loader.using, and wgAction = view */
} );
} );
}
