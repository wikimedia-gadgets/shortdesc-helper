// <nowiki>
/*  _____________________________________________________________________________
 * |                                                                             |
 * |                    === WARNING: GLOBAL GADGET FILE ===                      |
 * |                  Changes to this page affect many users.                    |
 * | Please discuss changes on the talk page or on [[WT:Gadget]] before editing. |
 * |_____________________________________________________________________________|
 *
 */
/**
 * Shortdesc helper: v3.5.3
 * Documentation at en.wikipedia.org/wiki/Wikipedia:Shortdesc_helper
 * The documentation includes instructions for using this gadget on other wikis.
 * Shows short descriptions, and allows importing wikidata descriptions, adding descriptions,
 * and easier editing of them by giving buttons and inputbox for doing so.
 * Forked from [[MediaWiki:Gadget-Page descriptions.js]] written by the TheDJ.
 */
'use strict';
window.sdh = window.sdh || {};

/**
 * Set messages using mw.message.
 * window.sdh.messages can be used to override these messages (for e.g translations).
 */
window.sdh.initMessages = function () {
	/* These messages are used on all wikis and so need translation. */
	var messages = {
		/** Uncomment the following to change messages used in settings dialog */
		/*
		"libSettings-settings-title": "Settings",
		"libSettings-save-label": "Save settings",
		"libSettings-cancel-label": "Cancel",
		"libSettings-showDefaults-label": "Show defaults",
		"libSettings-showCurrentSettings-label": "Show current settings",
		"libSettings-save-success-message": "Settings for $1 successfully saved.",
		"libSettings-save-fail-message": "Could not save settings for $1.",
		*/
		/* Settings messages */
		'sdh-settingsDialog-title': 'Settings for Shortdesc helper',
		'sdh-header-general': 'General',
		'sdh-header-appearance': 'Appearance',
		'sdh-AddToRedirect-label': 'Allow additions of short descriptions to redirects',
		'sdh-AddToRedirect-help': 'When checked, redirects will have an "add" button to add a short description. (default off)',
		'sdh-InputWidth-label': 'Width of editing input in characters (default 40)',
		'sdh-FontSize-label': 'Font size, as a percentage (default 100%)',
		/* Initial view messages */
		'sdh-missing-description': 'Missing <a href="/wiki/Wikipedia:Short description">$1 description</a>',
		'sdh-article-label': 'article',
		'sdh-redirect-label': 'redirect',
		/* Initial view buttons */
		'sdh-add-label': 'Add',
		'sdh-add-title': 'Add short description',
		'sdh-edit-label': 'Edit',
		'sdh-edit-title': 'Edit short description',
		/* Editing messages */
		'sdh-description-placeholder': 'Short description',
		'sdh-summary-placeholder': 'Custom edit summary',
		'sdh-save-label': 'Save',
		'sdh-save-title': 'Save description',
		'sdh-cancel-label': 'Cancel',
		'sdh-cancel-title': 'Cancel editing',
		'sdh-summary-label': 'Summary',
		'sdh-summary-title': 'Show edit summary box',
		'sdh-settings-title': 'Settings',
		/* Wikidata summary messages */
		'sdh-wd-summary': '([[w:en:Wikipedia:Shortdesc helper|Shortdesc helper]])',
		'sdh-wd-edit-failed': 'Saving the edit to Wikidata failed.',
		'sdh-wd-edit-failed-prefix': '\n\nThe info given by Wikidata is that:\n\n'
	};

	/**
	 * These messages don't need translation as they are only used on enwiki
	 * because enwiki has the {{SHORTDESC:}} magic word.
	 */
	var enwikiMessages = {
		/* Settings messages */
		'sdh-MarkAsMinor-label': 'Mark edits as minor',
		'sdh-header-Wikidata': 'Wikidata',
		'sdh-SaveWikidata-label': 'Save changes to Wikidata',
		'sdh-SaveWikidata-help': 'Whether to update the Wikidata description when using the script.',
		'sdh-SaveWikidata-add-label': 'Only when no Wikidata description exists (default)',
		'sdh-SaveWikidata-all-label': 'On all edits',
		'sdh-SaveWikidata-never-label': 'Never',
		'sdh-ShowWikidataOption-label': 'Show the Wikidata description',
		'sdh-ShowWikidataOption-always-label': 'Always',
		'sdh-ShowWikidataOption-nolocal-label': 'Only when no local description exists (default)',
		'sdh-ShowWikidataOption-never-label': 'Never',
		'sdh-ExportButton-label': 'Add a button, "export", to update the Wikidata description to match the local description.',
		/* Initial view messages */
		'sdh-wikidata-link-label': 'Wikidata',
		'sdh-no-description': 'This page intentionally has no description.',
		/* Initial view buttons */
		'sdh-infoClicky-label': '?',
		'sdh-infoClicky-title': 'Click for info',
		'sdh-override-label': 'Override',
		'sdh-override-title': 'Override current short description',
		'sdh-import-label': 'Import',
		'sdh-import-title': 'Import description from Wikidata',
		'sdh-editimport-label': 'Edit and import',
		'sdh-editimport-title': 'Edit and import description from Wikidata',
		'sdh-export-label': 'Export',
		'sdh-export-title': 'Export local short description to Wikidata',
		/* Popup text */
		'sdh-no-description-popup': 'This description is intentionally empty. See <a href = "/wiki/Wikipedia:Short_description#SDNONE">this page</a> for more info.',
		'sdh-override-popup': 'While this description can be overridden with another local short description, it cannot be directly edited. This is most likely because it is automatically generated by the article\'s infobox or some other template. See <a href = "/wiki/Wikipedia:WikiProject_Short_descriptions#Auto-generated_and_bot-generated_descriptions"> this page</a> for more info.',
		'sdh-disambig-popup': 'This short description should not be edited because it is automatically generated by the disambiguation template and does not need to be changed.',
		'sdh-useless-popup': 'Importing of this description has been disabled as it is too generic to be useful.',
		/* Summary messages */
		'sdh-summary-changing': 'Changing [[Wikipedia:Short description|short description]] from $1 to $2',
		'sdh-summary-adding-custom': 'Adding [[Wikipedia:Short description|short description]]: $2, overriding automatically generated description',
		'sdh-summary-importing-wikidata': 'Importing Wikidata [[Wikipedia:Short description|short description]]: $2',
		'sdh-summary-adding-local': 'Adding local [[Wikipedia:Short description|short description]]: $2, overriding Wikidata description $1',
		'sdh-summary-adding': 'Adding [[Wikipedia:Short description|short description]]: $2',
		/* Summary none messages */
		'sdh-summary-changing-none': 'Changing [[Wikipedia:Short description|short description]] from $1 to one that is [[WP:SDNONE|intentionally blank]]',
		'sdh-summary-adding-custom-none': 'Adding [[WP:SDNONE|intentionally blank]] description, instead of automatically generated description',
		'sdh-summary-adding-local-none': 'Adding [[WP:SDNONE|intentionally blank]] description, overriding Wikidata description $1',
		'sdh-summary-adding-none': 'Adding [[WP:SDNONE|intentionally blank]] description',
		/* Failure message */
		'sdh-edit-failed': 'Saving the addition of or edit to the short description failed.',
		'sdh-edit-failed-no-template': 'Edit failed, as no short description template was found in the page wikitext. This is probably due to an edit conflict.'
	};

	/**
	 * Setting window.sdh.messages last means it overrides previous messages
	 * Thus allowing translations to override previous messages.
	 */
	mw.messages.set( messages );
	mw.messages.set( enwikiMessages );
	mw.messages.set( window.sdh.messages );
};

window.sdh.main = function () {
	/**
	 * What section the short description is in, to be determined later
	 * by searching the DOM. Used so that if the short description is in the lead
	 * only the wikitext of section 0 needs to be downloaded.
	 *
	 * @type {number}
	 */
	var section;

	// Consts
	/**
	 * Selector to find the short description in the DOM.
	 *
	 * @type {string}
	 */
	var SDELEMENT = '.shortdescription';

	/**
	 * Selector to find disambiguation template.
	 *
	 * @type {string}
	 */
	var DISAMBIGELEMENT = '#disambigbox';

	/**
	 * Search pattern for finding short description in wikitext.
	 * Group 1 in the regex is the short description.
	 *
	 * @type {RegExp}
	 */
	var PATTERN = /\{\{\s*[Ss]hort description\s*\|(.*?)\}\}/;

	/**
	 * List of Wikidata descriptions that are not useful enough to be directly imported.
	 *
	 * @type {Array}
	 */
	var USELESS_DESCRIPTIONS = [
		'Wikimedia project page'
	];

	/**
	 * Pattern for date spans, to replace hyphen with en dash.
	 *
	 * @type {RegExp}
	 */
	var DATEPATTERN = /(\d\d+)-(\d\d+)/;

	/**
	 * Replace for date spans.
	 *
	 * @type {string}
	 */
	var DATEREPLACEMENT = '$1–$2';

	// Config variables
	var title = mw.config.get( 'wgPageName' );
	var namespace = mw.config.get( 'wgNamespaceNumber' );
	var wgQid = mw.config.get( 'wgWikibaseItemId' );
	var language = mw.config.get( 'wgContentLanguage' );
	var canEdit = mw.config.get( 'wgIsProbablyEditable' );
	var isRedirect = mw.config.get( 'wgIsRedirect' );
	var DBName = mw.config.get( 'wgDBname' );

	/**
	 * onlyEditWikidata is a site-wide flag.
	 * If it is true, then the only descriptions for the wiki are assumed to be on Wikidata.
	 * If it is false, then that means descriptions can also be added through {{SHORTDESC:}}
	 * (currently, this is only the case on enwiki).
	 * This flag modifies the behaviour of various methods to display the appropriate buttons and
	 * settings, and make the description saved to the right place.
	 *
	 * @type {boolean}
	 */
	var onlyEditWikidata = ( DBName !== 'enwiki' );

	/**
	 * Check if the user can edit the page,
	 * and disallow editing of templates and categories to prevent accidental addition.
	 *
	 * @type {boolean}
	 */
	var allowEditing = (
		(
			canEdit &&
			[ 10, 14, 710, 828, 2300, 2302 ].indexOf( namespace ) === -1
		)
	);

	// Define user agent when accessing the API
	var APIoptions = {
		ajax: {
			headers: {
				'Api-User-Agent': 'Short description editer/viewer gadget (w:en:Wikipedia:Shortdesc helper)'
			}
		}
	};

	var API = new mw.Api( APIoptions );

	var wikidataAPI = new mw.ForeignApi( 'https://www.wikidata.org/w/api.php', APIoptions );

	/**
	 * Get the wikitext of the page.
	 *
	 * @return {Promise}
	 */
	var getText = function () {
		return API.get( {
			action: 'query',
			prop: 'revisions',
			titles: title,
			rvprop: 'content',
			rvsection: section,
			rvslots: 'main',
			formatversion: 2
		} );
	};

	/**
	 * Download wikitext. Whether to download the whole wikitext,
	 * or only the lead section wikitext is determined.
	 *
	 * @type {Promise}
	 */
	var callPromiseText = ( function () {
		var elements;
		if ( onlyEditWikidata ) {
			return;
		}

		/**
		 * Find whether the short description is in the first section, to determine
		 * if we need to download the wikitext of the entire page.
		 * Do this by searching elements above the first heading for ".shortdescription"
		 */
		// eslint-disable-next-line no-jquery/no-global-selector, no-jquery/variable-pattern
		elements = $( '.mw-parser-output > h2' ).first().prevAll();
		/**
		 * Need to check sibling elements with filter and their children
		 * with find to find short description. If length > 0 then found
		 * short description before the first heading, so get wikitext of section 0.
		 */
		if ( elements.filter( SDELEMENT ).add( elements.find( SDELEMENT ) ).length > 0 ) {
			section = 0;
		}

		// Get the wikitext
		return getText();
	}() );

	/**
	 * Get the local short description
	 *
	 * @type {Promise}
	 */
	var callPromiseDescription = API.get( {
		action: 'query',
		titles: title,
		prop: 'description',
		formatversion: 2
	} );

	/**
	 * Load settings using libSettings if it exists
	 * Otherwise gracefully fallback to defaults.
	 */
	var usinglibSettings = !!mw.libs.libSettings;
	var ls, optionsConfig, settings, options;

	if ( usinglibSettings ) {
		ls = mw.libs.libSettings;

		optionsConfig = new ls.OptionsConfig( [
			new ls.Page( {
				title: mw.msg( 'sdh-header-general' ),
				preferences: [
					new ls.CheckboxOption( {
						name: 'MarkAsMinor',
						label: mw.msg( 'sdh-MarkAsMinor-label' ),
						defaultValue: false,
						hide: onlyEditWikidata
					} ),
					new ls.CheckboxOption( {
						name: 'AddToRedirect',
						label: mw.msg( 'sdh-AddToRedirect-label' ),
						help: mw.msg( 'sdh-AddToRedirect-help' ),
						defaultValue: false
					} ),
					new ls.CheckboxOption( {
						name: 'ExportButton',
						label: mw.msg( 'sdh-ExportButton-label' ),
						defaultValue: false,
						hide: onlyEditWikidata
					} ),
					new ls.DropdownOption( {
						name: 'ShowWikidata',
						label: mw.msg( 'sdh-ShowWikidataOption-label' ),
						defaultValue: 'nolocal',
						values: [
							{ data: 'always', label: mw.msg( 'sdh-ShowWikidataOption-always-label' ) },
							{ data: 'nolocal', label: mw.msg( 'sdh-ShowWikidataOption-nolocal-label' ) },
							{ data: 'never', label: mw.msg( 'sdh-ShowWikidataOption-never-label' ) }
						],
						hide: onlyEditWikidata
					} ),
					// Option for all disabled due to issues with people not using it properly
					new ls.DropdownOption( {
						name: 'SaveWikidata',
						label: mw.msg( 'sdh-SaveWikidata-label' ),
						help: mw.msg( 'sdh-SaveWikidata-help' ),
						defaultValue: 'add',
						values: [
							{ data: 'add', label: mw.msg( 'sdh-SaveWikidata-add-label' ) },
							// { data: 'all', label: mw.msg( 'sdh-SaveWikidata-all-label' ) },
							{ data: 'never', label: mw.msg( 'sdh-SaveWikidata-never-label' ) }
						],
						hide: onlyEditWikidata
					} )
				]
			} ),
			new ls.Page( {
				title: mw.msg( 'sdh-header-appearance' ),
				preferences: [
					new ls.NumberOption( {
						name: 'InputWidth',
						label: mw.msg( 'sdh-InputWidth-label' ),
						defaultValue: 40,
						UIconfig: {
							min: 10,
							max: 999
						}
					} ),
					new ls.NumberOption( {
						name: 'FontSize',
						label: mw.msg( 'sdh-FontSize-label' ),
						defaultValue: 100,
						UIconfig: {
							min: 10,
							max: 500
						}
					} )
				]
			} )
		] );

		settings = new mw.libs.libSettings.Settings( {
			title: mw.msg( 'sdh-settingsDialog-title' ),
			scriptName: 'Shortdesc-helper',
			helpInline: true,
			size: 'large',
			height: 350,
			optionsConfig: optionsConfig
		} );

		options = settings.get();
	} else {
		// Use defaults
		options = {
			MarkAsMinor: false,
			AddToRedirect: false,
			InputWidth: 40,
			FontSize: 100,
			ExportButton: false,
			SaveWikidata: 'add',
			ShowWikidata: 'nolocal'
		};
	}

	/**
	 * Get the Wikidata short description
	 *
	 * @type {Promise}
	 */
	var callPromiseWDDescription = ( options.ShowWikidata === 'never' || wgQid === null ) ? null : wikidataAPI.get( {
		action: 'wbgetentities',
		ids: wgQid,
		props: 'descriptions',
		formatversion: 2,
		languages: language
	} );

	// Dynamic CSS based on options
	mw.util.addCSS(
		'#sdh { font-size:' + options.FontSize + '%}' +
		'#sdh-descriptionbox { width:' + ( options.InputWidth + 3 ) + 'ch };' // Do +3 since width includes char counter
	);

	/* Main code to be run once both the local and Wikidata short description is gotten */
	var onResponses = function ( response, responseWD ) {
		/**
		 * These two variables are UI elements that need to be closed and reopened,
		 * and so need to be accessed outside the scope of the functions
		 * that define them.
		 */

		/**
		 * Used in InfoClickyPopup
		 *
		 * @type {OO.ui.PopupWidget}
		 */
		var infoPopup;

		/**
		 * Used in textInput
		 *
		 * @type {OO.ui.ActionFieldLayout}
		 */
		var actionField;

		/**
		 * Used in textInput
		 *
		 * @type {OO.ui.TextInputWidget}
		 */
		var descriptionInput;

		/**
		 * These three variables are defined by the button being clicked
		 */

		/**
		 * The message to be used for the summary
		 *
		 * @type {string}
		 */
		var summaryMsg;

		/**
		 * Is the action a change to an existing local description
		 * or an addition, importation etc.
		 *
		 * @type {boolean}
		 */
		var change;

		/**
		 * True when there is no description anywhere, and so
		 * description should be added to Wikidata when options.SaveWikidata is 'add'.
		 *
		 * @type {boolean}
		 */
		var addWikidata;

		/**
		 * Whether there should be text initially in the input box.
		 *
		 * @type {boolean}
		 */
		var emptyPreload = false;

		/**
		 * Various HTML elements
		 */
		var $sdh = $( '<div>' ).prop( 'id', 'sdh' );
		var $description = $( '<div>' ).addClass( 'sdh-showdescrip' );
		var $clickies = $( '<span>' ).addClass( 'sdh-clickies' );

		var pages = response[ 0 ].query.pages[ 0 ];

		/**
		 * Is the description from Wikidata (non local) or the {{SHORTDESC:}} magic word?
		 *
		 * @type {boolean}
		 */
		var isLocal = ( pages.descriptionsource === 'local' );

		/**
		 * The Wikidata descriptions.
		 */
		var wikidataDescriptions = responseWD ? responseWD[ 0 ].entities[ wgQid ].descriptions : {};

		/**
		 * The Wikidata description, if it exists.
		 */
		var wikidataDescription = Object.keys( wikidataDescriptions ).length !== 0 ? wikidataDescriptions[ language ].value : '';

		/**
		 * The page short description.
		 *
		 * @type {string}
		 */
		var pageDescription = ( isLocal ? pages.description : wikidataDescription ).trim();

		/**
		 * Whether this is a disambiguation/set index page or not, determined by searching the DOM.
		 * If it is, then the option to override the short description will be disabled.
		 *
		 * @type {boolean}
		 */
		var disambigPage = $( DISAMBIGELEMENT ).length > 0;

		/**
		 * Whether a Wikidata description is too generic to be useful.
		 *
		 * @type {boolean}
		 */
		var uselessDescription = !isLocal && USELESS_DESCRIPTIONS.indexOf( pageDescription ) !== -1;

		/**
		 * Whether to append the Wikidata description
		 *
		 * @type {boolean}
		 */
		var appendWDDescription = options.ShowWikidata === 'always' && isLocal && wikidataDescription;

		/**
		 * Creates "clickies", simple link buttons.
		 * Things are made nice per https://stackoverflow.com/a/10510353
		 * Links are wrapped in spans to allow separators to be added using css
		 * without becoming part of the link.
		 *
		 * @param {string} msgName
		 * @param {Function} func
		 * @return {Object}
		 */
		var Clicky = function ( msgName, func ) {
			return $( '<span>' )
				.addClass( 'sdh-clicky' )
				.append( $( '<a>' )
					.attr( {
						title: mw.msg( msgName + '-title' ),
						role: 'button',
						tabindex: '0'
					} )
					.text( mw.msg( msgName + '-label' ) )
					.on( 'click', func )
					.on( 'keydown', function ( e ) {
						if ( [ 13, 32 ].indexOf( event.which ) !== -1 ) { // Space and enter
							e.preventDefault();
							return func();
						}
					} )
				);
		};

		/**
		 * Create a Clicky that opens a OOui PopupWidget.
		 *
		 * @param {string} text
		 * @return {Clicky}
		 */
		var InfoClickyPopup = function ( text ) {
			var self = this;
			self.text = text;

			self.infoClicky = new Clicky(
				'sdh-infoClicky',
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
							$clickies.append( infoPopup.$element );
							infoPopup.toggle( true );
						} );
					} else {
						infoPopup.toggle( false );
					}
				}
			);

			return self.infoClicky;
		};

		/**
		 * Creates OOui buttons, which are used for save and cancel.
		 *
		 * @param {string} msgName
		 * @param {Function} func
		 * @param {Array<string>} flags
		 * @param {string} icon
		 * @return {OO.ui.ButtonWidget}
		 */
		var OOuiClicky = function ( msgName, func, flags, icon ) {
			return new OO.ui.ButtonWidget( {
				label: mw.msg( msgName + '-label' ),
				icon: icon,
				title: mw.msg( msgName + '-title' ),
				flags: flags,
				classes: [ 'sdh-ooui-clicky' ]
			} ).on( 'click', func );
		};

		/**
		 * Function to check if the short description is in the wikitext.
		 * If it is, return the wikitext and short description as defined in the text
		 *
		 * @param {Object} wikitextResult
		 * @return {Array}
		 */
		var shortdescInText = function ( wikitextResult ) {
			var wikitext = wikitextResult.query.pages[ 0 ].revisions[ 0 ].slots.main.content;
			var match = wikitext && wikitext.match( PATTERN );
			if ( match ) {
				return [ wikitext, match[ 1 ] ];
			} else {
				return [ wikitext, false ];
			}
		};

		/**
		 * Notify the user that the edit failed and log any debug info.
		 *
		 * @param {string} msgName
		 * @param {*} debug
		 * @param {string} extraMsg
		 */
		var editFailed = function ( msgName, debug, extraMsg ) {
			var message = mw.msg( msgName ) + extraMsg;
			mw.notify(
				message,
				{
					autoHide: false
				}
			);
			if ( debug ) {
				mw.log.warn( debug );
			}
		};

		/**
		 * Set the Wikidata description using the API.
		 *
		 * @param {string} newDescription
		 * @param {string} summary Custom edit summary.
		 * @return {Promise}
		 */
		var setWikidataDescription = function ( newDescription, summary ) {
			return mw.loader.using( 'mediawiki.ForeignApi' ).then( function () {
				return wikidataAPI.postWithToken( 'csrf', {
					action: 'wbsetdescription',
					id: wgQid,
					language: language,
					summary: ( summary || '' ) + mw.message( 'sdh-wd-summary', language ).plain(),
					value: newDescription
				} );
			} );
		};

		/**
		 * This function edits Wikidata descriptions and is used on wikis that aren't enwiki.
		 * Beyond what setWikidataDescription does, it reloads the page on success
		 * and gives an informative error notification.
		 *
		 * @param {string} newDescription
		 * @param {string} summary Custom edit summary.
		 */
		var editWikidataDescription = function ( newDescription, summary ) {
			setWikidataDescription( newDescription, summary ).then(
				function () {
					window.location.reload();
				},
				function () {
					editFailed(
						'sdh-wd-edit-failed',
						arguments,
						arguments[ 1 ].error.info ? (
							mw.msg( 'sdh-wd-edit-failed-prefix' ) +
							arguments[ 1 ].error.info
						) : ''
					);
				}
			);
		};

		/**
		 * This function adds or replaces short descriptions.
		 *
		 * @param {string} newDescription
		 * @param {string} summary Custom edit summary.
		 */
		var editDescription = function ( newDescription, summary ) {
			var replacement, prependText, appendText, text, prependDescription;

			/**
			 * Helper function to add quotes around text,
			 * used when generating the summary.
			 *
			 * @param {string} textToQuote
			 * @return {string}
			 */
			var quotify = function ( textToQuote ) {
				return '"' + textToQuote + '"';
			};

			/**
			 * Appends, prepends, or replaces the wikitext.
			 * depending on which of text, prependText, and appendText exists.
			 */
			var makeEdit = function () {
				API.postWithEditToken( {
					action: 'edit',
					section: section,
					text: text,
					title: title,
					prependtext: prependText,
					appendtext: appendText,
					summary: summary,
					minor: options.MarkAsMinor,
					tags: 'shortdesc helper'
				} ).then(
					function () {
						// Reload the page
						window.location.reload();
					},
					function () {
						editFailed( 'sdh-edit-failed', arguments );
					}
				);
			};

			/**
			 * Replaces the current local short description with the new one.
			 * If the short description doesn't exist in the text, return false.
			 *
			 * @param {string} wikitextResult Result of getText()
			 * @return {boolean} Whether there was a description in the wikitext
			 * and so whether makeEdit could be called.
			 */
			var replaceAndEdit = function ( wikitextResult ) {
				var output = shortdescInText( wikitextResult );
				var oldtext = output[ 0 ];
				var descriptionFromText = output[ 1 ];
				if ( descriptionFromText ) {
					text = oldtext.replace( PATTERN, replacement );
					makeEdit();
					return true;
				} else {
					return false;
				}
			};
			
			// Fix manual entry of "none"
			if ( newDescription.toLowerCase() === 'none' ) {
				newDescription = '';
			}

			// Replace hyphens in dates with en dashes
			newDescription = newDescription.replace( DATEPATTERN, DATEREPLACEMENT );

			// Make edits to Wikidata as appropiate
			if (
				wgQid &&
				( options.SaveWikidata === 'add' && addWikidata ) && // options.SaveWikidata === 'all'
				newDescription !== ''
			) {
				setWikidataDescription( newDescription );
			}

			// Capitalize first letter by default unless editing local description
			if ( !isLocal ) {
				newDescription = (
					newDescription.charAt( 0 ).toUpperCase() +
					newDescription.slice( 1 )
				);
			}

			if ( newDescription === '' ) {
				newDescription = 'none';
			}

			// Use 1= if the description has an '='
			if ( newDescription.indexOf( '=' ) !== -1 ) {
				prependDescription = '1=';
			} else {
				prependDescription = '';
			}

			replacement = '{{Short description|' + prependDescription + newDescription + '}}';

			// Link guideline if changing to none description
			summary = summary || mw.message(
				summaryMsg + ( newDescription === 'none' ? '-none' : '' ),
				quotify( pageDescription ),
				quotify( newDescription )
			).plain();

			/**
			 * change = true means there was a previous short description in the wikitext
			 * that needs to be replaced.
			 */
			if ( change ) {
				/**
				 * Get the wikitext again right before making the edit
				 * to avoid issues with edit conflicts, and make the edit.
				 */
				getText().then( function ( result ) {
					if ( !replaceAndEdit( result ) ) {
						editFailed( 'sdh-edit-failed-no-template' );
					}
				} );
			} else {
				if ( isRedirect ) {
					appendText = '\n' + replacement;
				} else {
					prependText = replacement + '\n';
				}
				makeEdit();
			}
		};

		/**
		 * Creates input box with save and cancel buttons.
		 * If input box was created before, show it again.
		 * Otherwise, create the input box using OOui.
		 */
		var textInput = function () {
			if ( actionField ) {
				$description.addClass( 'sdh-showdescrip-hidden' );
				actionField.toggle( true );
				descriptionInput.focus();
			} else {
				mw.loader.using( [ 'oojs-ui-core', 'oojs-ui-widgets', 'oojs-ui.styles.icons-interactions' ] ).then( function () {
					var length, saveInput, buttons;
					// Define the input box, summary box, and buttons.
					descriptionInput = new OO.ui.TextInputWidget( {
						autocomplete: false,
						autofocus: true,
						id: [ 'sdh-descriptionbox' ],
						label: '0',
						value: emptyPreload ? '' : pageDescription,
						placeholder: mw.msg( 'sdh-description-placeholder' )
					} );

					var summaryInput = new OO.ui.TextInputWidget( {
						autocomplete: false,
						autofocus: true,
						id: [ 'sdh-summarybox' ],
						placeholder: mw.msg( 'sdh-summary-placeholder' )
					} );

					var saveButton = new OOuiClicky(
						'sdh-save',
						function () {
							saveInput();
						},
						[ 'primary', 'progressive' ]
					);

					var cancelButton = new OOuiClicky(
						'sdh-cancel',
						function () {
							actionField.toggle( false );
							$description.removeClass( 'sdh-showdescrip-hidden' );
						},
						[ 'safe', 'destructive' ]
					);

					var summaryButton = new OOuiClicky(
						'sdh-summary',
						function () {
							summaryInput.toggle();
						},
						[ 'safe' ]
					);

					var settingsButton = new OO.ui.ButtonWidget( {
						icon: 'settings',
						framed: false,
						title: mw.msg( 'sdh-settings-title' ),
						flags: [ 'safe' ],
						classes: [ 'sdh-ooui-clicky' ]
					} ).on( 'click', function () {
						settings.display();
					} );

					/**
					 * On change, update character count label.
					 * If local description has not been modified, prevent
					 */
					var updateOnChange = function () {
						var description = descriptionInput.getValue().trim();
						length = descriptionInput.getInputLength();
						var classes = [ '' ];
						if ( length > 40 ) {
							if ( length > 60 ) {
								classes = [ 'sdh-very-long' ];
							} else {
								classes = [ 'sdh-too-long' ];
							}
						}
						descriptionInput.setLabel(
							$( '<span>' )
								.addClass( classes )
								.text( String( length ) )
						);
						if ( isLocal && description === pageDescription ) {
							saveButton.setDisabled( true );
						} else {
							saveButton.setDisabled( false );
						}
					};

					var items = [ saveButton, summaryButton, cancelButton ];

					if ( usinglibSettings ) {
						items.push( settingsButton );
					}

					buttons = new OO.ui.ButtonGroupWidget( {
						items: items
					} );

					/**
					 * This is bound to the save button.
					 * Disables all the elements and calls the relevant function
					 * responsible for saving the the entered short description.
					 */
					saveInput = function () {
						var description = descriptionInput.getValue().trim();
						var summary = summaryInput.getValue().trim();
						descriptionInput
							.setDisabled( true )
							.pushPending( true );
						summaryInput
							.setDisabled( true )
							.pushPending( true );
						items.forEach( function ( item ) {
							item.setDisabled( true );
						} );
						if ( onlyEditWikidata ) {
							editWikidataDescription( description, summary );
						} else {
							editDescription( description, summary );
						}
					};

					actionField = new OO.ui.ActionFieldLayout(
						descriptionInput,
						buttons,
						{
							align: 'top',
							id: 'sdh-editbox'
						}
					);

					summaryInput.toggle( false );

					// Initial character count
					updateOnChange();

					descriptionInput.on( 'change', updateOnChange );
					descriptionInput.on( 'enter', saveInput );

					summaryInput.on( 'enter', saveInput );
					summaryInput.on( 'toggle', function ( visible ) {
						if ( visible ) {
							summaryInput.focus();
						} else {
							descriptionInput.focus();
						}
					} );

					actionField.$element.append( summaryInput.$element );

					// Hide previous displayed clickies and add to DOM
					$description.addClass( 'sdh-showdescrip-hidden' );
					$sdh.append( actionField.$element );
					descriptionInput.focus();
				} );
			}
		};

		/**
		 * Create the html and append it to the DOM
		 *
		 * @param {Object} textElement
		 * @param {Array<Clicky>} clickyElements
		 * @param {InfoClickyPopup} popupElement
		 */
		var updateSDH = function ( textElement, clickyElements, popupElement ) {
			if ( popupElement ) {
				clickyElements.push( popupElement );
			}

			$description.append( textElement );

			if ( clickyElements.length > 0 ) {
				$clickies.append( clickyElements );
				$description.append( $clickies );
			}

			$sdh.append( $description );
			$sdh.addClass( 'noprint' );

			var hideSDH = function () {
				$sdh.addClass( 'sdh-ve-hidden' );
			};

			var showSDH = function () {
				$sdh.removeClass( 'sdh-ve-hidden' );
			};

			$.ready.then( function () {
				// Undo padding used to fix content jump
				mw.util.addCSS( '.skin-vector.ns-0 #mw-content-subtitle::after {content: none;}' );
				// Add the main div to the subtitle
				mw.util.addSubtitle( $sdh[0] );

				mw.hook( 've.activationComplete' ).add( function () {
					hideSDH();
				} );

				mw.hook( 've.deactivationComplete' ).add( function () {
					showSDH();
				} );

			} );
		};

		/**
		 * Disable all buttons and create processing (...) animation
		 * Used by export and import buttons.
		 */
		var setProcessing = function () {
			var x;
			var $processing = $( '<div>' )
				.addClass( 'sdh-processing' );
			// Disable all clicky buttons
			$clickies
				.children( '.sdh-clicky' )
				.addClass( 'sdh-clicky-disabled' )
				.children( 'a' )
				.off();

			// Add processing ... animation
			$description.append( $processing );

			for ( x = 0; x < 3; x++ ) {
				$processing.append(
					$( '<div>' )
						.addClass( [
							'sdh-processing-dot',
							'sdh-processing-dot-' + x
						] )
						.text( '.' )
				);
			}
		};

		/**
		 * Texts, clickies, and popups contain
		 * elements that could make up the initial display.
		 */
		var texts = {
			noDescription: $( '<span>' )
				.addClass( 'sdh-no-description' )
				.text( mw.msg( 'sdh-no-description' ) ),
			missingDescription: $( '<span>' )
				.addClass( 'sdh-missing-description' )
				.html( mw.msg( 'sdh-missing-description', mw.msg( 'sdh-' + (isRedirect ? 'redirect' : 'article') + '-label' ) ) ),
			pageDescription: $( '<span>' )
				.addClass( 'mw-page-description ' )
				.text( pageDescription + ( appendWDDescription ?
					( ' (Wikidata: ' + wikidataDescription + ')' ) : '' ) )
		};

		var clickies = {
			add: new Clicky(
				'sdh-add',
				function () {
					summaryMsg = 'sdh-summary-adding';
					addWikidata = true; // Description should be added to wikidata in this case
					textInput();
				}
			),
			addNone: new Clicky(
				'sdh-add',
				function () {
					summaryMsg = 'sdh-summary-changing';
					change = true;
					emptyPreload = true;
					textInput();
				}
			),
			addUseless: new Clicky(
				'sdh-add',
				function () {
					summaryMsg = 'sdh-summary-adding-local';
					emptyPreload = true;
					textInput();
				}
			),
			edit: new Clicky(
				'sdh-edit',
				function () {
					summaryMsg = 'sdh-summary-changing';
					change = true;
					textInput();
				}
			),
			editimport: new Clicky(
				'sdh-editimport',
				function () {
					summaryMsg = 'sdh-summary-adding-local';
					textInput();
				}
			),
			export: new Clicky(
				'sdh-export',
				function () {
					setProcessing();
					editWikidataDescription( pageDescription );
				}
			),
			import: new Clicky(
				'sdh-import',
				function () {
					setProcessing();
					summaryMsg = 'sdh-summary-importing-wikidata';
					editDescription( pageDescription );
				}
			),
			override: new Clicky(
				'sdh-override',
				function () {
					summaryMsg = 'sdh-summary-adding-custom';
					textInput();
				}
			),
			wikidataLink: $( '<span>' )
				.addClass( [
					'sdh-clicky',
					'sdh-wikidata-description'
				] )
				.append( $( '<a>' )
					.attr( 'href', 'https://www.wikidata.org/wiki/Special:SetLabelDescriptionAliases/' + wgQid + '/' + language )
					.text( mw.msg( 'sdh-wikidata-link-label' ) )
				)
		};

		var popups = {
			disambig: new InfoClickyPopup(
				mw.message( 'sdh-disambig-popup' ).plain()
			),
			noDescription: new InfoClickyPopup(
				mw.message( 'sdh-no-description-popup' ).plain()
			),
			override: new InfoClickyPopup(
				mw.message( 'sdh-override-popup' ).plain()
			),
			useless: new InfoClickyPopup(
				mw.message( 'sdh-useless-popup' ).plain()
			)
		};

		/**
		 * Depending on various factors, such as
		 * whether the description exists,
		 * whether the description is on wikidata or not,
		 * and whether the page is in mainspace,
		 * this code determines what elements should make up the initial display.
		 * updateSDH() is then called to generate the html
		 * and add that to the DOM.
		 *
		 * @param {Object} wikitextResult
		 */
		var determineElements = function ( wikitextResult ) {
			/**
			 * The description as determined from the wikitext.
			 *
			 * @type {string}
			 */
			var descriptionFromText;

			/**
			 * The short description or a message saying no description exists etc.
			 *
			 * @type {Object}
			 */
			var textElement;

			/**
			 * What the relevant buttons ("clickies") are.
			 *
			 * @type {Array<Clicky>}
			 */
			var clickyElements = [];

			/**
			 * What clickable popup explanation is there if any
			 *
			 * @type {InfoClickyPopup}
			 */
			var popupElement;

			/**
			 * Whether the description is none
			 *
			 * @type {boolean}
			 */
			var isNone;

			// Whether to show "Missing article description" if applicable
			var showMissing = (
				( namespace === 0 || namespace === 118 ) &&
				( !isRedirect || options.AddToRedirect )
			);

			// If not enwiki, complete logic for non-enwiki case and exit.
			if ( onlyEditWikidata ) {
				if ( pageDescription ) {
					textElement = pageDescription;
					clickyElements.push( clickies.edit );
				} else if ( showMissing ) {
					textElement = texts.missingDescription;
					clickyElements.push( clickies.add );
				}
				updateSDH( textElement, clickyElements, popupElement );
				return;
			}

			/**
			 * Determine if the short description is in the wikitext
			 * or if it is generated by an infobox.
			 */
			descriptionFromText = shortdescInText( wikitextResult )[ 1 ];

			/**
			 * Determine if the description is none.
			 */
			isNone = descriptionFromText && descriptionFromText.toLowerCase() === 'none';

			// Show wikidata link at beginning if displaying non-local description.
			if ( pageDescription && !isLocal ) {
				clickyElements.push( clickies.wikidataLink );
			}

			if ( isNone ) {
				// Handle {{Short description|none}}
				isLocal = true;
				textElement = texts.noDescription;
				clickyElements.push( clickies.addNone );
				popupElement = popups.noDescription;
			} else {
				// Handle remaining cases
				if ( pageDescription ) {
					textElement = texts.pageDescription;
					if ( isLocal ) {
						if ( descriptionFromText ) {
							clickyElements.push( clickies.edit );
						} else {
							if ( disambigPage ) {
								popupElement = popups.disambig;
							} else {
								clickyElements.push( clickies.override );
								popupElement = popups.override;
							}
						}
					} else {
						if ( uselessDescription ) {
							popupElement = popups.useless;
							clickyElements.push(
								clickies.addUseless
							);
						} else {
							clickyElements.push(
								clickies.import,
								clickies.editimport
							);
						}
					}
				} else if ( showMissing ) {
					textElement = texts.missingDescription;
					clickyElements.push( clickies.add );
				}
			}

			// Don't show clickies for editing if not allowing editing
			if ( !allowEditing ) {
				clickyElements = [];
			}

			if ( isLocal && !isNone && options.ExportButton ) {
				clickyElements.push( clickies.export );
			}

			updateSDH( textElement, clickyElements, popupElement );
		};

		if ( callPromiseText ) {
			callPromiseText.then( function ( wikitextResult ) {
				determineElements( wikitextResult );
			} );
		} else {
			determineElements();
		}
	};

	$.when( callPromiseDescription, callPromiseWDDescription ).then( onResponses );
};

/* Load if viewing a page normally (not in diff view) */
if (
	mw.config.get( 'wgIsArticle' ) &&
	!mw.config.get( 'wgDiffOldId' ) &&
	mw.config.get( 'wgArticleId' ) !== 0
) {
	/**
	 * Commented out due to issues reported at
	 * [[Special:PermaLink/925885151#Doubled_short_descriptions_from_Template:Infobox_settlement]].
	 * Fire on postEdit hook to load after Visual Editor saves,
	 * as VE does not actually reload the page.
	 * Unfortunately, postEdit fires both after regular edits and VE edits,
	 * so duplicate instances will be caused after a regular edit if run always
	 * on postEdit.
	 * window.sdh.hasRun is set to true below, and will be undefined after a proper reload,
	 * but not after a dynamic VE reload.
	 * FIXME: Post edit hook fires too early, meaning if an editor adds a short description using VE
	 * it won't show the right description.
	 *
	 * mw.hook( 'postEdit' ).add( function () {
	 * if ( window.sdh.hasRun ) {
	 * window.sdh.main();
	 * }
	 * } );
	 *
	 * if ( !window.sdh.hasRun ) { // Don't run twice
	 * window.sdh.hasRun = true;
	 * window.sdh.initMessages();
	 * window.sdh.main();
	 * }
	 */
	window.sdh.initMessages();
	window.sdh.main();
}
// </nowiki>
