// If dude exists.
$.fn.doExist = function(ele){
	if($(ele).length == 0) {
		return false;
	}else{
		return true;
	}
};

// Build Property Data Table
$.fn.buildDataTable = function(data) {
	$.mobile.loading('show');
	
	var table_exists = $.fn.doExist("#property table.data-table");
	var maps_exists = $.fn.doExist("#property div.maps");
	
	if (maps_exists){
		$("#property div.maps").remove();
	}
	
	if (table_exists){
		$("#property table.data-table").remove();
	}
	
	table = '<table class="data-table" data-role="table" class="ui-responsive">';
	table = table + '<thead><tr><th>Label</th>';
	table = table + '<th>Value</th></tr></thead><tbody>';
	
	// Table Data
	$.each(data, function (i, item) {
		var item_label = item.Label;
		var item_value = "";
		if(item.Value){
			item_value = item.Value;
		}
		if(item_label == "Website"){
			item_value = '<a href="' + item_value + '" target="_blank">Click Here</a>';
		}
		table = table + '<tr>';
		table = table + '<td>' + item_label + '</td>';
		table = table + '<td>' + item_value + '</td>';
		table = table + '</tr>';
	});
	
	table = table + '<tbody></table>';
	$("#property div.content").append(table);
	$("#property div.content").trigger("create");
	
	$.mobile.loading('hide');
};

// Create simple maps with Goolge, Bing, and CAGIS
$.fn.googleMaps = function(address) {
	$.mobile.loading('show');
	
	var table_exists = $.fn.doExist("#property table.data-table");
	var maps_exists = $.fn.doExist("#property div.maps");
	
	if (maps_exists){
		$("#property div.maps").remove();
	}
	
	if (table_exists){
		$("#property table.data-table").remove();
	}
	
	
	var link = 'https://maps.google.com/maps?f=q&amp;source=s_q&amp;hl=en&amp;geocode=&amp;q=' + address;
	var maps = '<div class="maps">';
			
	// Google Street View
	maps = maps + '<div class="map">';
	maps = maps + '<a class="google steeet" href="' + link + '" target="_blank">';
	maps = maps + '<img src="http://maps.googleapis.com/maps/api/streetview?size=290x290&location=' + address;
	maps = maps + '&sensor=false"></a></div>';
	
	// Google Satellite View
	maps = maps + '<div class="map">';
	maps = maps + '<a class="google satellite" href="' + link + '" target="_blank">';
	maps = maps + '<img src="http://maps.googleapis.com/maps/api/staticmap?center=' + address;
	maps = maps + '&markers=size:mid|color:red|' + address;
	maps = maps + '&zoom=19&size=290x290&maptype=satellite&sensor=true"></a></div>';
	
	// Google Basic Map View
	maps = maps + '<div class="map">';
	maps = maps + '<a class="google basic"href="' + link + '" target="_blank">';
	maps = maps + '<img src="http://maps.googleapis.com/maps/api/staticmap?center=' + address;
	maps = maps + '&markers=size:mid|color:red|' + address;
	maps = maps + '&zoom=18&size=290x290&sensor=true"></a></div>';
	
	maps = maps + '</div><!--/close maps-->';
	
	$("#property div.content").append(maps);
	$("#property div.content").trigger("create");	
	
	$.mobile.loading('hide');
};

// getPropertyReport
$.fn.propertyDetails = function(strcoords) {
	var parcel_attributes, zoning_attributes, address;
	$.mobile.loading( 'show');
	var coords = strcoords.split(",");
	$.getJSON("http://hcpd.pluto.dev/cagis/jsonp.php?callback=?",{action: 'getPropertyReport', x: coords[0], y: coords[1]}, function(res){
		
		$.mobile.changePage( "#property", { transition: "slide"} );
		
		address = res.locationReportResult.AddressQueryData.AddressAttributes.addressWCity;
		
		$('#property h2.title').text(address);
		
		// Set default data table view.	
		parcel_attributes = res.locationReportResult.ParcelQueryData.AudParcelAttributes.ParcelAttributes.ParcelAttribute;
		$.fn.buildDataTable(parcel_attributes);
		
		$('#property .ui-navbar a.ui-btn').on("click", function(event, ui) {
			var btn = $(this).text().toLowerCase();
			switch (btn) {
				case "parcel":
					parcel_attributes = res.locationReportResult.ParcelQueryData.AudParcelAttributes.ParcelAttributes.ParcelAttribute;
					$.fn.buildDataTable(parcel_attributes);
					break;
				case "zoning":
					zoning_attributes = res.locationReportResult.ZoningQueryData.ZoningAttributes.ZoningAttribute;
					$.fn.buildDataTable(zoning_attributes);	
					break;
				case "maps":
					address
					$.fn.googleMaps(res.locationReportResult.AddressQueryData.AddressAttributes.addressWCity);
					break;
				default:
					$.fn.buildDataTable(address);
					break;	
			}
		
		});
		
		$.mobile.loading( 'hide');
	});
};

// geoCodeLocator
$.fn.searchResults = function(strLocation) {
	// variables
	var result_count, xml, coords, xcoord, ycoord, address, city, item;

	// show loadding
	$.mobile.loading( "show" );
	
	// call jsonp
	$.getJSON("http://hcpd.pluto.dev/cagis/jsonp.php?callback=?",{action: 'geoCodeLocator', location: strLocation}, function(res){
		
		// get some results
		if(res.GeoCodeLocatorResult){
			result_count = parseInt(res.GeoCodeLocatorResult.ResultsCount);
			 xml = res.GeoCodeLocatorResult.ResultsSet.any;
		}else{
			 result_count = 0;
		}
				
		if(result_count >= 1){
			if(result_count == 1){							
				coords = $(xml).find('X_COORD').text() + "," + $(xml).find('Y_COORD').text();
				$.fn.propertyDetails(coords);
			}else{
				$.mobile.changePage( "#results", { transition: "slide"} );
				
				$("#results h2.title").text(result_count + " properties found for '" + strLocation +"'");
				
				var list = $.fn.doExist("#results ul.list");
				
				if (list){
					$("#results ul.list").empty();
				}else{
					$("#results div.content").append('<ul class="list" data-role="listview" data-filter="true" data-inset="true"></ul>');
					$("#results div.content").trigger("create");
				}
				
				$(xml).find('AddressList').each(function(){
					address = $(this).find('ADDRESS').text();
					city = $(this).find('BND_NAME').text();
					coords = $(this).find('X_COORD').text() + "," + $(this).find('Y_COORD').text();
					item = address + ", " + city 
					$("#results ul.list").append('<li><a href="#" rel="'+coords+'" class="property">'+item+'</a></li>');
				});
				
				$("#results ul.list").listview("refresh");
				$('a.property').on("click", function(event, ui) {
					coords = $(this).attr("rel");
					$.fn.propertyDetails(coords);
				});
				$.mobile.loading( 'hide');
			}
		}else{
			$.mobile.loading( 'hide');
			$('#search-msg').addClass('error');
			$('#search-msg').html('No records found.');
		} 
	});
};
	

$('#home').live( 'pageinit',function(event){	
	$('#search-btn').on("click", function(event, ui) {
		 var strLocation = $('#fld-location').val();
		 if (strLocation){
		 	$('#search-msg').removeClass('error');
		 	$('#search-msg').html('');
			$.fn.searchResults(strLocation);
		 }else{
		 	$('#search-msg').addClass('error');
			$('#search-msg').html('Please enter a value.'); 
		 }
		 event.preventDefault();
	});
});