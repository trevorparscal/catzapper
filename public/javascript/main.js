( function ( $ ) {
	var nextImageRequest;

	function shuffle( o ) {
		for ( var j, x, i = o.length; i; j = Math.floor( Math.random() * i ), x = o[--i], o[i] = o[j], o[j] = x );
		return o;
	}

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
		} ).fail( function() {
			alert( 'Error fetching image from API' );
			$( '#frame' ).css( 'opacity', '' );
		} );
		return false;
	}

	function showImage( data ) {
		var i, len, category, $category,
			listLength = $( '#category-list .button' ).length,
			categories = shuffle( data.categories.concat( data.similarCategories ) ).slice( 0, listLength );

		$( '#caption' )
			.text( data.title.replace( /^[^:]+:/, '' ) )
			.append( ' (' )
			.append(
				$( '<a>' )
					.attr( {
						'href': data.info.descriptionurl,
						'target': '_blank'
					} )
					.text( 'link' )
			)
			.append( ')' )
		;

		$( '#category-list .button' ).removeClass( 'selected' );

		for ( i = 0, len = categories.length; i < listLength; i++ ) {
			$category = $( '#category-list .button' ).eq( i );
			if ( i < len ) {
				category = categories[i].replace( /^[^:]+:/, '' );
				$category.show().text( category );
			} else {
				$category.hide();
			}
		}

		$( '#frame' ).css( 'opacity', '' );
	}

	$( function () {
		$( '#next' ).click( loadNextImage );

		$( '#category-list .button' ).click( function () {
			$( this ).toggleClass( 'selected' );
		} );

		// Init
		loadNextImage();
	} );


} ( jQuery ) );
