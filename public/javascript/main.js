( function ( $ ) {
	var nextImageRequest;

	function loadNextImage() {
		var retry = 1;
		$( '#frame' ).css( 'opacity', 0.5 );
		if ( nextImageRequest ) {
			nextImageRequest.abort();
		}
		nextImageRequest = $.get( '/random', function ( data ) {
			$( '#image' )
				.on( 'load', function () {
					showImage( data );
				} )
				.on( 'error', function () {
					if ( retry-- ) {
						setTimeout( function () {
							$( '#image' ).attr( 'src', data.info.thumburl + '?retry' );
							showImage( data );
						}, 500 );
					} else {
						$( '#frame' ).css( 'opacity', '' );
					}
				} )
				.attr( 'src', data.info.thumburl );
		} );
	}

	function showImage( data ) {
		$( '#caption' ).text( data.title.replace( /^[^:]+:/, '' ) );
		$( '#frame' ).css( 'opacity', '' );
	}

	$( function () {
		$( '#next' ).click( loadNextImage );

		// Init
		loadNextImage();
	} );


} ( jQuery ) );
