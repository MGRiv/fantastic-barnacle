L.mapbox.accessToken = 'pk.eyJ1IjoiY2hyaXNnY28iLCJhIjoiY2lnODIxamRlMDlmYXRmbTY3YmRrbGZmbSJ9.7cteu78r4b6UYlHUaYvxTA';
  var map = L.mapbox.map('map', 'mapbox.streets')
    .setView([37.09024, -95.712891], 5);

  var popup = new L.Popup({ autoPan: false });

  // statesData comes from the 'us-states.js' script included above
  var statesLayer = L.geoJson(statesData,  {
      style: getStyle,
      onEachFeature: onEachFeature
  }).addTo(map);

  function getStyle(feature) {
      return {
          weight: 2,
          opacity: 0.1,
          color: 'black',
          fillOpacity: 0.7,
          fillColor: getColor(feature.properties)
      };
  }

  // get color depending on population density value
  function getColor(properties) {
    if (properties.dnc > properties.other & properties.dnc > properties.gop) {
      return "#3498db";
    } else if (properties.gop > properties.other & properties.gop > properties.dnc) {
      return "#e74c3c";
    } else if (properties.other > properties.gop & properties.other > properties.dnc) {
      return "#95a5a6";
    }
  }

  function onEachFeature(feature, layer) {
      layer.on({
          mousemove: mousemove,
          mouseout: mouseout,
          click: zoomToFeature
      });
  }

  var closeTooltip;

  function mousemove(e) {
      var layer = e.target;

      popup.setLatLng(e.latlng);
      popup.setContent(
        '<h3 class="marker-title">' + layer.feature.properties.name + '</h3>' +
        '<p><b>' + layer.feature.properties.population + '</b> Population</p>' +
        '<p><b>' + layer.feature.properties.density + '</b> People per square mile</p>' +
        '<p><b>' + layer.feature.properties.dnc + '%</b> Democrats</p>' +
        '<p><b>' + layer.feature.properties.gop + '%</b> Republicans</p>' +
        '<p><b>' + layer.feature.properties.other + '%</b> Others</p>' +
	'<p id="graph"></p><br><br>'
      );

      if (!popup._map) popup.openOn(map);
      window.clearTimeout(closeTooltip);

      // highlight feature
      layer.setStyle({
          weight: 3,
          opacity: 0.3,
          fillOpacity: 0.9
      });

      if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
      }
      display(layer.feature.properties.name);
  }

  function mouseout(e) {
      statesLayer.resetStyle(e.target);
      closeTooltip = window.setTimeout(function() {
          map.closePopup();
      }, 100);
  }

  function zoomToFeature(e) {
    // On Click Handler
  }

  map.legendControl.addLegend('<span>Primary Parties</span><ul><li><span class="swatch" style="background:#3498db;">Democrat</li><li><span class="swatch" style="background:#e74c3c;">Republican</li><li><span class="swatch" style="background:#95a5a6;">Other</li></ul>');

var already = {};
var colorconvert = {"gop":"#e74c3c","dnc":"#3498db","other":"#95a5a6"};

var search = function(n){ //amortized O(1) but whatever
    if (n in already){
	return already[n];
    }
    var l = statesData.features;
    for(var i=0;i<l.length;i++){
	if (l[i].properties.name == n){
	    already[n] = l[i].properties;
	    return already[n];
	}
    }
}

var display = function(n){
    var info = search(n);
    var g = d3.select("#graph")
        .selectAll("div")
	.data(["gop","dnc","other"])
	.enter()
	.append("div")
	.attr("class","bar")
	.style("width",function (d) {return info[d].toString()+"%";})
        .style("background-color", function (d) {return colorconvert[d];})
	.text(function (d) {return info[d].toString()+"%";});
}
