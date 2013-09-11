/*
 * GET random image.
 */

var mw = require( '../lib/mw' );

function onError( error, response ) {
	res.writeHead( 500, { 'Content-Type': 'application/json' } );
	res.write( JSON.stringify( { 'error': error, 'response': response } ) );
	res.end();
}

exports.random = function( req, res ) {
	mw.api.get(
		{
			'action': 'query',
			'list': 'random',
			'rnnamespace': 6,
			'rnlimit': 1
		},
		function ( data ) {
			var image = data.query.random[0];

			mw.api.get(
				{
					'action': 'query',
					'prop': 'imageinfo',
					'iiprop': 'url',
					'iiurlwidth': 400,
					'pageids': image.id
				},
				function ( data ) {
					var info = data.query.pages[image.id].imageinfo[0];

					res.writeHead( 200, { 'Content-Type': 'application/json' } );
					res.write( JSON.stringify( { 'title': image.title, 'info': info } ) );
					res.end();
				},
				onError
			);
		},
		onError
	);
};
