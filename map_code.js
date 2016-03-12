mapboxgl.accessToken = 'pk.eyJ1IjoiamVmZmFsbGVuIiwiYSI6InJOdUR0a1kifQ.fTlTX02Ln0lwgaY4vkubSQ';

var sw = new mapboxgl.LngLat(-80.27, 43.32);
var ne = new mapboxgl.LngLat(-78.67, 44.12);
var boundBox = new mapboxgl.LngLatBounds(sw, ne);

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v8',
    center: [-79.37, 43.72],
    zoom: 10,
    maxZoom: 11.7,
    minZoom: 10,
    bearing: -17,
    attributionControl: false,
    zoomControl: true,
    dragRotate: false,
    maxBounds: boundBox,
});

var pop_breaks = [0,500,1000,2000,4000,8000,16000,377401]
var inc_breaks = [10,30000,40000,50000,60000,70000,80000,400000]

// light to dark
var pop_shades = ['#fff7fb','#ece7f2','#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0']
var inc_shades = ['#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63']

map.on('style.load', function () {

    map.addSource('das', {
        'type': 'geojson',
        'data': das
    });

     for (var c = 0; c < 7; c++) {
         map.addLayer({
              'id': 'inc_' + String(c + 1),
              'type': 'fill',
              'source': 'das',
              'layout': {},
              'paint': {
                  'fill-color': inc_shades[c],
                  'fill-opacity':0
                },
              'filter': [ "<", "avg_inc_1", inc_breaks[c+1]],
              'filter': [ ">=", "avg_inc_1", inc_breaks[c]]
          }, 'water');

          map.addLayer({
               'id': 'pop_' + String(c + 1),
               'type': 'fill',
               'source': 'das',
               'layout': {},
               'paint': {
                   'fill-color': pop_shades[c],
                   'fill-opacity':0.68
                 },
               'filter': [ "<", "pop_densit", pop_breaks[c+1]],
               'filter': [ ">=", "pop_densit", pop_breaks[c]]
           }, 'water');
     }
})


function ChoroSwitch(chorolayer) {
    console.log(chorolayer)
    if (chorolayer == 'inc') {
      for (var c = 0; c < 7; c++) {
      map.setPaintProperty('inc_' + String(c + 1),'fill-opacity',0.68)
      map.setPaintProperty('pop_' + String(c + 1),'fill-opacity',0)
      }
    }
    else if (chorolayer == 'pop') {
      for (var c = 0; c < 7; c++) {
      map.setPaintProperty('inc_' + String(c + 1),'fill-opacity',0)
      map.setPaintProperty('pop_' + String(c + 1),'fill-opacity',0.68)
      }
    } else {
      console.log("no layer")
    }
}




 map.on('style.load', function () {
     map.addSource('bounds', {
         'type': 'geojson',
         'data': bound
     });

     map.addLayer({
         'id': 'bounds',
         'type': 'line',
         'source': 'bounds',
         'layout': {},
         'paint': {
             "line-color": "#000",
             "line-dasharray": [5,1,1,1],
             "line-opacity": 0.8,
         }
     }, 'admin-2-boundaries');
 });


map.on('style.load', function () {
     map.addSource('rinks', {
         'type': 'geojson',
         'data': rinks
     });
     map.addLayer({
         'id': 'rinks',
         'type': 'circle',
         'source': 'rinks',
         "interactive": true,
         'layout': {},
         'paint': {
           'circle-radius': 6.5,
           'circle-color': '#fff'
         }
     });
     map.addLayer({
         'id': 'rinks_2',
         'type': 'circle',
         'source': 'rinks',
         "interactive": true,
         'layout': {},
         'paint': {
           'circle-radius': 5,
         }
     });
 });

 map.on('style.load', function () {
     map.addSource('das_inv', {
         'type': 'geojson',
         'data': das
     });

     map.addLayer({
         'id': 'das_inv',
         'type': 'fill',
         'source': 'das_inv',
         "interactive": true,
         'layout': {},
         'paint': {
             "fill-opacity": 0.01,
         }
     });
 });

 var popup = new mapboxgl.Popup();

 map.on('click', function (e) {
     map.featuresAt(e.point, {
         radius: 7.5,
         includeGeometry: true,
         layer: 'rinks'
     }, function (err, features) {

         if (err || !features.length) {
             popup.remove();
             return;
         }

         var feature = features[0];

         popup.setLngLat(feature.geometry.coordinates)
             .setHTML("<p><b>Name: </b></p><p>" + feature.properties.Name + "</p><p>" + '<b>Amenities: </b></p><p>' + feature.properties.Amenities + "</p>"
           )
             .addTo(map);
     });
 });


 map.on('mousemove', function (e) {
     map.featuresAt(e.point, {
         radius: 7.5,
         layer: 'rinks'
     }, function (err, features) {
         map.getCanvas().style.cursor = (!err && features.length) ? 'pointer' : '';
     });
 });

map.on('mousemove', function (e) {
    map.featuresAt(e.point, {radius: 2, layer: 'das_inv'}, function (err, features) {
        try {
               var feature = features[0];
               var cur_inc = Math.round(feature.properties.avg_inc_1);
               var cur_pop = Math.round(feature.properties.pop_densit);
               console.log(cur_pop)
               document.getElementById('c_pop').innerHTML = "at cursor: <b>" + cur_pop + "</b> people / km^2";
               if (cur_inc > 10) {
               document.getElementById('c_inc').innerHTML = "at cursor: <b>$ " + cur_inc + "</b>";
             } else {
               document.getElementById('c_inc').innerHTML = "at cursor: undefined"
             }
      } catch(err) {
              document.getElementById('c_pop').innerHTML = "at cursor: undefined"
              document.getElementById('c_inc').innerHTML = "at cursor: undefined"
    }
  });
});
