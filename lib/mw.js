var request = require( 'request' ),
	querystring = require( 'querystring' ),
	base = 'http://commons.wikimedia.org/w/api.php';

exports.api = {
	'get': function ( params, success, failure ) {
		params.format = 'json';
		request( base + '?' + querystring.stringify( params ), function ( error, response, body ) {
			if ( !error && response.statusCode == 200 ) {
				try {
					success( JSON.parse( body ) );
				} catch ( e ) {
					if ( failure ) {
						failure( e, response, body );
					}
				}
			} else if ( failure ) {
				failure( error, response, body );
			}
		} );
	}
};
