function init(){
	var map = new L.Map("map");
	
	/* Tilestream Layer example: */
	var historicUrl = "http://opengis.azexperience.org/tiles/v2/azHistoric1880/{z}/{x}/{y}.png"",
		historicLayer = new L.TileLayer(historicUrl, {maxZoom: 10}); 
	
	/* WMS layer example: */
	var wmsUrl = "http://opengis.azexperience.org/geoserver/wms",
		wmsLayer = new L.TileLayer.WMS(wmsUrl, { 
			maxZoom: 10, 
			layers: "vae:azhistoricmines", 
			format: "image/png", 
			transparent: true 
		}); 
	
	/* WFS GeoJSON layer example: */
	var wfsLayer = new L.GeoJSON.WFS("http://opengis.azexperience.org/geoserver/wfs", "vae:azhistoricmines", {
		pointToLayer: function(latlng) { 
			return new L.Marker(latlng, { 
				icon: new L.Icon({ 
					iconUrl: "style/images/hover-glow.png", 
					iconSize: new L.Point(48,48) 
				}) 
			}); 
		},
		popupObj: new JadeContent("templates/popup.jade"),
		popupOptions: { maxWidth: 530, centered: true },
		hoverFld: "name"
	}); 
	
	var center = new L.LatLng(34.1618, -111.53332);
	map.setView(center, 7).addLayer(historicLayer).addLayer(wfsLayer).addLayer(wmsLayer);
}