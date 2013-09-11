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
			response = {
				'title': image.title
			};

		function queue() {
			var i = arguments.length;

			pending += i;
			while ( i-- ) {
				arguments[i]();
			}
		}

		function done() {
			pending--;
			if ( pending === 0 ) {
				res.writeHead( 200, { 'Content-Type': 'application/json' } );
				res.write( JSON.stringify( response ) );
				res.end();
			}
		}

		function error( error, response ) {
			pending = -1;
			res.writeHead( 500, { 'Content-Type': 'application/json' } );
			res.write( JSON.stringify( { 'error': error, 'response': response } ) );
			res.end();
		}

		function getImageCategories() {
			mw.api.get(
				{
					'action': 'query',
					'prop': 'categories',
					'clshow': '!hidden',
					'pageids': image.id
				},
				function ( data ) {
					response.categories = data.query.pages[image.id].categories;
					done();
				},
				error
			);
		}

		function getImageInfo() {
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
					done();
				},
				error
			);
		}

		queue( getImageCategories, getImageInfo );
	} );
};
