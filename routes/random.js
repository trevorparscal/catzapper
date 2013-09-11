/*
 * GET random image.
 */

var mw = require( '../lib/mw' );

exports.random = function( req, res ) {
	function getRandomImage( success, error ) {
		mw.api.get(
			{
				'action': 'query',
				'list': 'random',
				'rnnamespace': 6,
				'rnlimit': 1
			},
			function ( data ) {
				success( data.query.random[0] );
			},
			error
		);
	}

	getRandomImage( function ( image ) {
		var pending = 0,
			categoryTitles = {},
			response = {
				'title': image.title
			};

		function queue() {
			var i = arguments.length;

			while ( i-- ) {
				arguments[i]();
			}
		}

		function done() {
			if ( pending === 0 ) {
				res.writeHead( 200, { 'Content-Type': 'application/json' } );
				res.write( JSON.stringify( response ) );
				res.end();
			}
		}

		function error( error, response ) {
			if ( pending >= 0 ) {
				console.log( error );
				pending = -1;
				res.writeHead( 500, { 'Content-Type': 'application/json' } );
				res.write( JSON.stringify( { 'error': error, 'response': response } ) );
				res.end();
			}
		}

		function getSimilarImageCategories() {
			var len = response.categories.length,
				i = len;

			response.similarCategories = [];

			function success( data ) {
				var page, i, similarCategories;

				for ( page in data.query.pages ) {
					similarCategories = data.query.pages[page].categories;
					i = similarCategories.length;
					while ( i-- ) {
						if ( !categoryTitles[similarCategories[i].title] ) {
							response.similarCategories.push( similarCategories[i].title );
							categoryTitles[similarCategories[i].title] = true;
						}
					}
				}
				pending--;
				done();
			}

			pending += len;
			while ( i-- ) {
				console.log( response.categories[i] );
				mw.api.get(
					{
						'action': 'query',
						'prop': 'categories',
						'format': 'json',
						'clshow': '!hidden',
						'cllimit': 'max',
						'generator': 'categorymembers',
						'gcmtitle': response.categories[i],
						'gcmtype': 'file',
						'gcmlimit': '10'
					},
					success,
					error
				);
			}
		}

		function getImageUsage() {
			pending++;
			mw.api.get(
				{
					'action': 'query',
					'prop': 'globalusage',
					'guprop': 'pageid',
					'gufilterlocal': true,
					'pageids': image.id
				},
				function ( data ) {
					response.usage = data.query.pages[image.id].globalusage;
					pending--;
					done();
				},
				error
			);
		}

		function getImageCategories() {
			pending++;
			mw.api.get(
				{
					'action': 'query',
					'prop': 'categories',
					'clshow': '!hidden',
					'pageids': image.id
				},
				function ( data ) {
					var categories = data.query.pages[image.id].categories,
						i = categories.length;

					response.categories = [];
					while ( i-- ) {
						categoryTitles[categories[i].title] = true;
						response.categories.push( categories[i].title );
					}
					queue( getSimilarImageCategories );					
					pending--;
					done();
				},
				error
			);
		}

		function getImageInfo() {
			pending++;
			mw.api.get(
				{
					'action': 'query',
					'prop': 'imageinfo',
					'iiprop': 'url',
					'iiurlwidth': 400,
					'pageids': image.id
				},
				function ( data ) {
					response.info = data.query.pages[image.id].imageinfo[0];
					pending--;
					done();
				},
				error
			);
		}

		queue( getImageCategories, getImageInfo /*, getImageUsage */ );
	} );
};
