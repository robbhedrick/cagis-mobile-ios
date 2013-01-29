
// Create simple maps with Goolge, Bing, and CAGIS
$.fn.createMaps = function(google, address, parcel_id) {
	var maps = '';
		if(google){
			// Google Satellite View
			maps = maps + '<div class="map"><a class="google satellite" href="#" rel="'+address+'"><img src="http://maps.googleapis.com/maps/api/staticmap?center='+address;
			maps = maps + '&markers=size:mid|color:red|'+address;
			maps = maps + '&zoom=19&size=215x215&maptype=satellite&sensor=true"></a></div>';
			
			// Google Basic Map View
			maps = maps + '<div class="map"><a class="google basic" href="#" rel="'+address+'"><img src="http://maps.googleapis.com/maps/api/staticmap?center='+address;
			maps = maps + '&markers=size:mid|color:red|'+address;
			maps = maps + '&zoom=18&size=215x215&sensor=true"></a></div>';
			
			// Google Street View
			maps = maps + '<div class="map"><a class="google steeet" href="#" rel="'+address+'"><img src="http://maps.googleapis.com/maps/api/streetview?size=215x215&location='+address;
			maps = maps + '&sensor=false"></a></div>';
		}
		// Dialog Link To Cagis Flash Maps
		maps = maps + '<div class="cagis-msg">Click <a href="#" class="cagis" rel="'+parcel_id+'">here</a> to view interative map. Requires Adobe Flash player.</div>';	
	
	return maps;
};

// getPropertyReport
$.fn.getPropertyReport = function(strX, strY) {
	$.getJSON("http://hcpd.pluto.dev/cagis/jsonp.php?callback=?",{action: 'getPropertyReport', x: strX, y: strY}, function(res){
		$.mobile.loading( 'hide');
		$('#property h2').text(res.locationReportResult.LocationQueryData.Jurisdiction);
		$('#property-results').html(res.locationReportResult.LocationQueryData.Jurisdiction);
		$.mobile.changePage( "#property", { transition: "slide"} );
	});
};

// geoCodeLocator
$.fn.geoCodeLocator = function(strLocation) {
	// show loadding
	$.mobile.loading( "show" );
	
	// call jsonp
	$.getJSON("http://hcpd.pluto.dev/cagis/jsonp.php?callback=?",{action: 'geoCodeLocator', location: strLocation}, function(res){
		
		// get some results
		var result_count = parseInt(res.GeoCodeLocatorResult.ResultsCount);
		var xml = res.GeoCodeLocatorResult.ResultsSet.any;
		
		if(result_count >= 1){
			if(result_count == 1){							
				var strX = $(xml).find('X_COORD').text();
				var strY = $(xml).find('Y_COORD').text();
				$.fn.getPropertyReport(strX, strY);
			}else{
				$.mobile.loading( 'hide');
				$('#results h2').text(result_count + ' Properties Found');
				$('#results-list').html(result_count);
				$.mobile.changePage( "#results", { transition: "slide"} );
			}
		}else{
			$.mobile.loading( 'hide');
			$('#search-msg').addClass('error');
			$('#search-msg').html('No records found.');
		} 
	});
};


$('#search-btn').on( "click", function(event, ui) {
	 var strLocation = $('#fld-location').val();
	 if (strLocation){
	 	$('#search-msg').removeClass('error');
	 	$('#search-msg').html('');
		$.fn.geoCodeLocator(strLocation);
	 }else{
	 	$('#search-msg').addClass('error');
		$('#search-msg').html('Please enter a value.'); 
	 }
	 event.preventDefault();
});