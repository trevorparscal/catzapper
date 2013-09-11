( function ( $ ) {

	function loadNextImage() {
		$( '#image' ).css( 'opacity', 0.5 );
		$.get( '/random', function ( data ) {
			$( '#image' ).on( 'load error',  function () {
				$( this ).css( 'opacity', '' );
			} ).attr( 'src', data.info.thumburl );
		} );
	}

	$( function () {
		$( '#next' ).click( loadNextImage );
	} );

} ( jQuery ) );
