/*  _____________________________________________________________________________
 * |                                                                             |
 * |                    === WARNING: GLOBAL GADGET FILE ===                      |
 * |                  Changes to this page affect many users.                    |
 * | Please discuss changes on the talk page or on [[WT:Gadget]] before editing. |
 * |_____________________________________________________________________________|
 *
 */
/* Shortdesc helper: v3.3.0
 * Documentation at [[User:Galobtter/Shortdesc helper]]
 * Shows short descriptions, and allows importing wikidata descriptions, adding descriptions,
 * and easier editing of them by giving buttons and inputbox for doing so.
 * This gadget only works on the English Wikipedia: see [[User:Galobtter/Shortdesc helper#Usage]].
 * Forked from [[MediaWiki:Gadget-Page descriptions.js]] written by the TheDJ.
*/
window.sdhmain = function () {
	/* Grab config variables */
	var title = mw.config.get( 'wgPageName' );
	var namespace = mw.config.get( 'wgNamespaceNumber' );
	var wgQid = mw.config.get( 'wgWikibaseItemId' );
	var language = mw.config.get( 'wgContentLanguage' );
	var canEdit = mw.config.get( 'wgIsProbablyEditable' );
	var isRedirect = mw.config.get( 'wgIsRedirect' );

	/* Check if can edit the page, and disallow editing of templates and categories
	 * to prevent accidental addition */
	var allowEditing = (
		canEdit &&
		[ 10, 14, 710, 828, 2300, 2302 ].indexOf( namespace ) === -1
	);
	var API = new mw.Api( {
		ajax: {
			headers: {
				'Api-User-Agent': 'Short description editer/viewer (User:Galobtter/Shortdesc helper)'
			}
		}
	} );

	// Function for grabbing lead section text
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

	// Get the lead section text
	var callPromiseText = getText();

	// Get the short description
	var callPromiseDescription = API.get( {
		action: 'query',
		titles: title,
		prop: 'description',
		formatversion: 2
	} );

	/* Settings */
	var CheckboxOption = mw.libs.libSettings.CheckboxOption;
	var NumberOption = mw.libs.libSettings.NumberOption;

	var optionsConfig = [
		{
			title: 'Shortdesc-helper',
			preferences: [
				new NumberOption( {
					name: 'InputWidth',
					label: 'Width of editing input in em (default 35)',
					helptip: 'worth a damn',
					defaultValue: 35,
					UIconfig: {
						min: 10,
						max: 400,
						validate: /\d\d/
					}
				} ),
				new CheckboxOption( {
					name: 'AddToRedirect',
					label: 'Allow additions of short descriptions to redirects',
					help: 'When checked, redirects will have an "add" button to add a short description. (default off)',
					defaultValue: false
				} )
			]
		}
	];

	var settings = new mw.libs.libSettings.Settings( {
		scriptName: 'Shortdesc-helper',
		helpInline: true,
		size: 'medium',
		height: 350,
		optionsConfig: optionsConfig
	} );

	var options = settings.get();

	/* Execute main code once the short description is gotten */
	$.when( callPromiseDescription, $.ready ).then( function ( result ) {
		var type, change, $description, infoPopup, actionField;

		var response = result[ 0 ];
		var pages = response.query.pages[ 0 ];
		var pageDescription = pages.description;
		var isLocal = ( pages.descriptionsource === 'local' );

		/* Search pattern for finding short description in wikitext.
 		 * Group 1 is the short description. */
		var pattern = /\{\{[Ss]hort description\|(.*?)\}\}/;

		/* UI functions: Buttons */

		/* Creates "clickies", simple link buttons. */
		var Clicky = function ( descrip, text, func ) {
			this.button = $( '<span>' )
				.addClass( 'sdh-clicky' )
				.append( $( '<a>' )
					.attr( 'title', descrip )
					.text( text )
					.on( 'click', func )
				);
		};

		/* Creates OOui buttons, which are used for save and cancel. */
		var OOuiClicky = function ( descrip, text, func, flags, icon ) {
			this.button = new OO.ui.ButtonWidget( {
				label: text,
				icon: icon,
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

			self.infoClicky = new Clicky(
				'Click for info',
				'?',
				function () {
					if ( !infoPopup ) {
						mw.loader.using( [ 'oojs-ui-core', 'oojs-ui-widgets' ] ).then( function () {
							infoPopup = new OO.ui.PopupWidget( {
								$content: $( '<span>' ).append( self.text ),
								$autoCloseIgnore: self.infoClicky,
								padded: true,
								autoClose: true,
								width: 300,
								position: 'after'
							} );
							$( '.sdh-clickies' ).append( infoPopup.$element );
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
 		 * If it is, return the short description as defined in the text
		 */
		var shortdescInText = function ( leadResult ) {
			var lead = leadResult.query.pages[ 0 ].revisions[ 0 ].slots.main.content;
			var match = lead && lead.match( pattern );
			if ( match ) {
				return [ lead, match[ 1 ] ];
			} else {
				return [ lead, false ];
			}
		};

		/* This function adds or replaces short descriptions. */
		var addDescription = function ( newDescription, cancelButton ) {
			var changes, replacement, prependText, appendText, text;

			// Helper function to add quotes around text
			var quotify = function ( text ) {
				if ( text === '' || text === 'none' ) {
					return 'none';
				} else {
					return '"' + text + '"';
				}
			};

			/* Appends, prepends, or replaces the lead section
					 ** depending on which of text, prependText, and appendText exists. */
			var makeEdit = function () {
				var summary = (
					type +
					' [[Wikipedia:Short description|short description]]' +
					changes +
					' ([[User:Galobtter/Shortdesc helper|Shortdesc helper]])'
				);
				API.postWithToken( 'csrf', {
					action: 'edit',
					section: 0,
					text: text,
					title: title,
					prependtext: prependText,
					appendtext: appendText,
					summary: summary
				} ).done( function () {
					// Reload the page
					window.location.reload();
				} ).fail( function ( code, jqxhr ) {
					mw.log.warn( code, jqxhr );
				} );
			};

			/* Replaces the current local short description with the new one.
			** If the short description doesn't exist in the text, return false. */
			var replaceAndEdit = function ( leadResult ) {
				var output = shortdescInText( leadResult );
				var oldtext = output[ 0 ];
				var descriptionFromText = output[ 1 ];
				if ( descriptionFromText ) {
					text = oldtext.replace( pattern, replacement );
					makeEdit();
					return true;
				} else {
					return false;
				}
			};

			newDescription = newDescription.trim();

			// Capitalize first letter by default unless editing local description
			if ( !isLocal ) {
				newDescription = newDescription.charAt( 0 ).toUpperCase() +
						newDescription.slice( 1 );
			}

			if ( newDescription === '' ) {
				newDescription = 'none';
			}

			// eslint-disable-next-line no-useless-concat
			replacement = '{' + '{short description|' + newDescription + '}}';

			// var change is defined by the button that was clicked
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
				 ** to avoid issues with edit conflicts, and make the edit. */
				$.when( getText() ).then( function ( result ) {
					if ( !replaceAndEdit( result ) ) {
						cancelButton.setDisabled( false );
						mw.notify(
							'Edit failed, as no short description template was found in the page wikitext. This is probably due to an edit conflict.',
							{ autoHide: false }
						);
					}
				} );
			}
		};

		/* Creates input box with save and cancel buttons. */
		var textInput = function () {
			/* If reopening the input box, show it again.
	 		 * Otherwise, create the input box using OOui. */
			if ( actionField ) {
				$( '#sdh-showdescrip' ).hide( 0 );
				actionField.toggle();
			} else {
				mw.loader.using( [ 'oojs-ui-core', 'oojs-ui-widgets' ] ).then( function () {
					var length, saveInput;
					// Define the input box and buttons.
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
							$( '#sdh-showdescrip' ).show( 0 );
						},
						[ 'safe', 'destructive' ]
					).button;

					var settingsButton = new OO.ui.ButtonWidget( {
						icon: 'settings',
						framed: false,
						title: 'Settings',
						flags: [ 'safe' ],
						classes: [ 'sdh-ooui-clicky' ]
					} ).on( 'click', function () {
						settings.display();
					} );

					var savecancelButtons = new OO.ui.ButtonGroupWidget( {
						items: [ saveButton, cancelButton, settingsButton ]
					} );

					// On change, update character count label.
					var updateOnChange = function () {
						length = descriptionInput.getInputLength();
						descriptionInput.setLabel( String( length ) );

					};

					saveInput = function () {
						saveButton.setDisabled( true );
						cancelButton.setDisabled( true );
						descriptionInput.setDisabled( true );
						addDescription( descriptionInput.getValue(), cancelButton );
					};

					$( '#sdh-showdescrip' ).hide( 0 );

					actionField = new OO.ui.ActionFieldLayout(
						descriptionInput,
						savecancelButtons, {
							label: '', // For some dumb reason, the buttons won't align with the inputbox unless a dummy label is put
							align: 'top',
							id: [ 'sdh-editbox' ]
						}
					);

					// Initial character count
					updateOnChange();

					descriptionInput.on( 'change', updateOnChange );
					descriptionInput.on( 'enter', saveInput );

					$( '#sdh' ).append( actionField.$element );

					// Size the inputbox
					$( '#sdh-editbox, #sdh-inputbox' ).css( 'max-width', options.InputWidth + 'em' );
				} );
			}
		};

		var combineClickies = function ( clickyElements ) {
			var clickies = $( '<span>' ).addClass( 'sdh-clickies' );
			if ( clickyElements ) {
				clickyElements.forEach( function ( element ) {
					clickies.append( element );
				} );
				$description.append( clickies );
			}
		};

		var appendDescription = function () {
			// Add the main div
			$( '#contentSub' ).append(
				$( '<div>' )
					.prop( 'id', 'sdh' )
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
		$.when( callPromiseText ).then( function ( leadResult ) {
			var clickyElements;
			var output = shortdescInText( leadResult );
			var descriptionFromText = output[ 1 ];

			$description = $( '<div>' ).prop( 'id', 'sdh-showdescrip' );

			// eslint-disable-next-line no-irregular-whitespace
			// Handle {{Shor​t description|none}}
			if ( descriptionFromText && ( descriptionFromText === 'none' ) ) {
				$description.append(
					$( '<span>' )
						.text( 'This page has deliberately no description.' )
				);

				clickyElements = [
					new Clicky(
						'Add short description',
						'Add',
						function () {
							type = 'Changing';
							change = true;
							pageDescription = '';
							textInput();
						}
					).button,
					new InfoClickyPopup(
						'A page is deliberately set to have an empty short description using the code {{Shor​t description|none}}. Note, however, that for now the Wikidata short description is actually still shown if available.'
					).$element
				];

				updateSDH( clickyElements );
				return;
			}

			if ( pageDescription ) {
				$description.append(
					$( '<span>' )
						.text( pageDescription )
						.addClass( 'mw-page-description ' )
				);

				if ( !isLocal ) {
					clickyElements = [ $( '<span>' )
						.addClass( 'sdh-clicky' )
						.append( $( '<a>' )
							.attr( 'href', 'https://www.wikidata.org/wiki/Special:SetLabelDescriptionAliases/' + wgQid + '/' + language )
							.addClass( 'sdh-wikidata-description' )
							.text( 'Wikidata' )
						) ];
				}

				if ( allowEditing ) {
					if ( isLocal ) {
						if ( descriptionFromText ) {
							clickyElements = [
								new Clicky(
									'Edit short description',
									'Edit',
									function () {
										type = 'Changing';
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
										type = 'Adding custom';
										textInput();
									}
								).button,
								new InfoClickyPopup(
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
									var x;
									// Disable all clicky buttons
									$( '.sdh-clicky a' )
										.css( 'pointer-events', 'none' )
										.off();

									// Add processing ... animation
									$( '#sdh-showdescrip ' ).append(
										$( '<div>' )
											.addClass( 'sdh-processing' )
											.css( 'margin-left', '0.5em' )
									);

									for ( x = 0; x < 3; x++ ) {
										$( '.sdh-processing' ).append(
											$( '<div>' )
												.addClass( [ 'sdh-processing-dot', 'sdh-processing-dot-' + x ] )
												.text( '.' )
										);
									}

									type = 'Importing Wikidata';
									addDescription( pageDescription );
								}
							).button,
							new Clicky(
								'Edit and import description from Wikidata',
								'Edit and Import',
								function () {
									type = 'Adding local';
									textInput();
								}
							).button
						);
					}
				}
				updateSDH( clickyElements );
			} else if (
				namespace === 0 &&
				( !isRedirect || ( isRedirect && options.AddToRedirect ) )
			) {
				// indicate that description is missing
				$description = (
					$( '<div>' )
						.prop( 'id', 'sdh-showdescrip' )
						.append(
							$( '<span>' )
								.addClass( 'sdh-missing-description' )
								.text( 'Missing ' ),
							$( '<a>' )
								.attr( 'href', '/wiki/Wikipedia:Short description' )
								.text( ( isRedirect ? 'redirect' : 'article' ) + ' description' )
						)
				);

				if ( allowEditing ) {
					clickyElements = [
						new Clicky(
							'Add description',
							'Add',
							function () {
								type = 'Adding';
								textInput();
							}
						).button
					];
				}
				updateSDH( clickyElements );
			}
		} );
		/* Close callPromiseDescription, and wrapping function */
	} );
};

/* Load if viewing a page normally (not in diff view) */
if (
	mw.config.get( 'wgIsArticle' ) &&
	!mw.config.get( 'wgDiffOldId' ) &&
	mw.config.get( 'wgArticleId' ) !== 0
) {
	window.sdhmain();
}
