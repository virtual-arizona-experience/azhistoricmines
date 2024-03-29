L.GeoJSON.WFS = L.GeoJSON.extend({
	initialize: function(serviceUrl, featureType, options) {
		options = options || {};
		L.GeoJSON.prototype.initialize.call(this, null, options);
		
		this.getFeatureUrl = serviceUrl + "?request=GetFeature&typeName=" + featureType + "&outputformat=json";
		if (options.filter && options.filter instanceof DateFilter) { this.getFeatureUrl += "&CQL_FILTER=" + filter.cql; }
		
		this.on("featureparse", function(e) {
			if (options.popupObj && options.popupOptions) {
				e.layer.on("click", function(evt) {
					e.layer._map.openPopup(options.popupObj.generatePopup(e, options.popupOptions));
				});			
			}
			else if (options.popupFld && e.properties.hasOwnProperty(options.popupFld)) {
				e.layer.bindPopup(e.properties[options.popupFld], { maxWidth: 600 });
			}
			if (options.hoverObj || options.hoverFld) {
				e.layer.on("mouseover", function(evt) {
					hoverContent = options.hoverObj ? options.hoverObj.generateContent(e) : e.properties[options.hoverFld] || "Invalid field name" ;
					hoverPoint = e.layer._map.latLngToContainerPoint(e.layer._latlng);
					e.layer._hoverControl = new L.Control.Hover(hoverPoint, hoverContent);
					e.layer._map.addControl(e.layer._hoverControl);	
				});
				e.layer.on("mouseout", function(evt) {
					e.layer._map.removeControl(e.layer._hoverControl);
				});
			}
		});
	},
	
	onAdd: function(map) {
		L.LayerGroup.prototype.onAdd.call(this, map);
		var that = this;
		this.getFeature(function() {
			that.addGeoJSON(that.jsonData);
		});
	},
	
	getFeature: function(callback) {
		var that = this;
		$.ajax({
			url: this.getFeatureUrl,
			type: "GET",
			success: function(response) {
				if (response.type && response.type == "FeatureCollection") {
					that.jsonData = response;
					that.toGeographicCoords(that.options.inputCrs || "EPSG:900913");
					callback();
				}				
			},
			dataType: "json"
		});
	},
	
	toGeographicCoords: function() {
		function projectPoint(coordinates /* [x,y] */, inputCrs) {
			var source = new Proj4js.Proj(inputCrs || "EPSG:900913"),
				dest = new Proj4js.Proj("EPSG:4326"),
				x = coordinates[0], 
				y = coordinates[1],
				p = new Proj4js.Point(x,y);
			Proj4js.transform(source, dest, p);
			return [p.x, p.y];
		}
		
		features = this.jsonData.features || [];
		for (var f = 0; f < features.length; f++) {
			switch (features[f].geometry.type) {
				case "Point":
					projectedCoords = projectPoint(features[f].geometry.coordinates);
					features[f].geometry.coordinates = projectedCoords;
					break;
				case "MultiPoint":
					for (var p = 0; p < features[f].geometry.coordinates.length; p++) {
						projectedCoords = projectPoint(features[f].geometry.coordinates[p]);
						features[f].geometry.coordinates[p] = projectedCoords;
					}
					break;
			}
		}
	}
});