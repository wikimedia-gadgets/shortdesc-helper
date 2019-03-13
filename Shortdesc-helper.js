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
 * Forked from [[MediaWiki:Gadget-Page descriptions.js]] written by the TheDJ. */

window.sdhmain = function () {
	/* Grab config variables */
	var title = mw.config.get( 'wgPageName' );
	var namespace = mw.config.get( 'wgNamespaceNumber' );
	var wgQid = mw.config.get( 'wgWikibaseItemId' );
	var language = mw.config.get( 'wgContentLanguage' );
	var canEdit = mw.config.get( 'wgIsProbablyEditable' );
	var isRedirect = mw.config.get( 'wgIsRedirect' );
	var server = mw.config.get( 'wgServer' );
	/* check if autoconfirmed, can edit the page, and disallow editing of templates and categories
	** to prevent accidental addition */
	var allowEditing = (
		canEdit &&
		[ 10, 14, 710, 828, 2300, 2302 ].indexOf( namespace ) !== -1
	);
	var headers = {
		'Api-User-Agent': 'Short description editer/viewer (User:Galobtter/Shortdesc helper)'
	};

	var request = function ( method, path, data, dataType ) {
		var formData = 'multipart/form-data';
		var requestVars = {
			method: method,
			url: server + '/api/rest_v1/' + path,
			data: data,
			dataType: dataType,
			headers: headers
		};

		if ( method === 'POST' ) {
			requestVars.contentType = formData;
			requestVars.mimeType = formData;
		}

		return $.ajax( requestVars );
	};

	// Function for grabbing HTML
	var getHTML = function ( section ) {
		return request(
			'GET',
			'page/html/' + title,
			{
				section: section,
				redirect: 'false'
			},
			'html'
		);
	};

	// Function for posting HTML (i.e, saving the page)
	var postHTML = function () {
		mw.loader.using( 'mediawiki.user' ).then( function () {
			return request(
				'POST',
				'page/html' + title,
				{
					csrf_token: mw.user.tokens.get( 'editToken' )
				}
			);
		} );
	};

	// Get the lead section html (mwAQ = lead section)
	var callPromiseHTML = getHTML( 'mwAQ' );

	// Get the short description
	var callPromiseDescription = request( 'GET', 'page/mobile-sections-lead/' + title, { redirect: 'false' }, 'json' );

	/* Define user option defaults */
	if ( window.shortdescInputWidth === undefined ) {
		window.shortdescInputWidth = '35';
	}

	if ( window.shortdescAddRedirect === undefined ) {
		window.shortdescAddRedirect = false;
	}

	/* Execute main code once the short description is gotten */
	$.when( callPromiseDescription, $.ready ).then( function ( result ) {
		var summary, change, $description, infoPopup, actionField, descriptionSection;

		var pageDescription = result.description;
		var isLocal = ( result.description_source === 'local' );

		/* Gets the short description from the HTML.
		** If can find the short description, but description is not editable, editable is false  */
		var getDescriptionFromHTML = function ( HTML ) {
			var i, parts, description, editable;
			var elements = HTML.getElementsByClassName( 'short description' );
			for ( i; i < elements.length; i++ ) {
				parts = elements[ i ].getAttribute( 'data-mw' ).parts[ 0 ];
				description = parts.params[ '1' ].wt;
				if ( description === pageDescription ) {
					if ( parts.template.target.wt === 'short description' ) {
						editable = true;
					} else {
						editable = false;
					}
				}
			}
			return [ description, editable ];
		};

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
 		** If it is, return the short description as defined in the text */
		var shortdescInText = function ( resultLead ) {
			var lead = resultLead[ 0 ].query.pages[ 0 ].revisions[ 0 ].slots.main.content;
			var match = lead.match( pattern );
			if ( match ) {
				return [ true, lead, match[ 1 ] ];
			} else {
				return [ false, lead, false ];
			}
		};

		/* This function adds or replaces short descriptions. */
		var addDescription = function ( newDescription, cancelButton ) {
			var changes, prependText, appendText, text;

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
				mw.loader.using( 'mediawiki.user' );
				var edittoken = mw.user.tokens.get( 'editToken' );
				API.postWithToken( 'csrf', {
					action: 'edit',
					section: 0,
					text: text,
					title: title,
					prependtext: prependText,
					appendtext: appendText,
					summary: summary + ' [[Wikipedia:Short description|short description]]' + changes + ' ([[User:Galobtter/Shortdesc helper|Shortdesc helper]])'
				} ).done( function () {
					// Reload the page
					window.location.reload();
				} ).fail( function ( code, jqxhr ) {
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
	 		** If the short description doesn't exist in the text, return false. */
			var replaceAndEdit = function ( resultLead ) {
				var output = shortdescInText( resultLead );
				var isInText = output[ 0 ];
				var oldtext = output[ 1 ];
				var descriptionFromText = output[ 2 ];
				if ( isInText ) {
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
				$.when( getText(), $.ready ).then( function ( result ) {
					if ( !replaceAndEdit( result ) ) {
						cancelButton.setDisabled( false );
						console.log( 'Shortdesc helper: Unable to find short description in page' );
						mw.notify( 'Edit failed, as no short description template was found in the page wikitext. This is probably due to an edit conflict.', { autoHide: false } );
					}
				} );
			}
		};

		/* Creates input box with save and cancel buttons. */
		var textInput = function () {
			/* If reopening the input box, show it again.
	 		** Otherwise, create the input box using OOui. */
			if ( actionField ) {
				$( '#sdh-showdescrip' ).hide( 0 );
				actionField.toggle();
			} else {
				mw.loader.using( [ 'oojs-ui-core', 'oojs-ui-widgets' ] ).then( function () {
					var length;
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

					var savecancelButtons = new OO.ui.ButtonGroupWidget( {
						items: [ saveButton, cancelButton ]
					} );

					// On change, update character count label.
					var updateOnChange = function () {
						length = descriptionInput.getInputLength();
						descriptionInput.setLabel( String( length ) );

					};

					var saveInput = function () {
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
					$( '#sdh-editbox, #sdh-inputbox' ).css( 'max-width', window.shortdescInputWidth + 'em' );
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
		$.when( callPromiseHTML, $.ready ).then( function ( leadHTML ) {
			var clickyElements;
			var output = getDescriptionFromHTML( leadHTML );
			var descriptionFromText = output[ 1 ];
			var editable = output[ 2 ];

			/* If it is a local description and there is no description in the lead,
			** search entire page */
			if ( isLocal && !descriptionFromText ) {
				getHTML().then( function ( totalHTML ) {
					output = getDescriptionFromHTML( totalHTML );
					descriptionFromText = output[ 1 ];
					editable = output[ 2 ];
				} );
			}

			$description = $( '<div>' ).prop( 'id', 'sdh-showdescrip' );

			// eslint-disable-next-line no-irregular-whitespace
			// Handle {{Shor​t description|none}}
			if ( descriptionFromText && ( descriptionFromText.trim() === 'none' ) ) {
				$description.append(
					$( '<span>' )
						.text( 'This page has deliberately no description.' )
				);

				clickyElements = [
					new Clicky(
						'Add short description',
						'Add',
						function () {
							summary = 'Changing';
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
						if ( editable ) {
							clickyElements = [
								new Clicky(
									'Edit short description',
									'Edit',
									function () {
										summary = 'Changing';
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

									summary = 'Importing Wikidata';
									addDescription( pageDescription );
								}
							).button,
							new Clicky(
								'Edit and import description from Wikidata',
								'Edit and Import',
								function () {
									summary = 'Adding local';
									textInput();
								}
							).button
						);
					}
				}
				updateSDH( clickyElements );
			} else if (
				namespace === 0 &&
				( !isRedirect || ( isRedirect && window.shortdescAddRedirect ) )
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
								summary = 'Adding';
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
