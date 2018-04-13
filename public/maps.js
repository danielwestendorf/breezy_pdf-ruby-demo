function addLocation() {
  var form   = document.querySelector('form[action="/locations"]');
  var submit = document.getElementById('submit');

  var autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('add-location'),
    { types: ['geocode'] }
  );

  autocomplete.addListener('place_changed', function(result) {
    var place = autocomplete.getPlace();

    if (place !== undefined) {
      document.getElementById('latitude').value      = place.geometry.location.lat();
      document.getElementById('longitude').value     = place.geometry.location.lng();
      document.getElementById('location_name').value = place.name;

      submit.removeAttribute('disabled');
    } else {
      submit.setAttribute('disabled', 'disabled');
    }
  });

  if (submit != undefined) {
    submit.addEventListener('click', function() {
      form.submit();
    })
  }
}

function drawMap() {
  var startLocation, endLocation;
  var waypoints = [];
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: { lat: 37.97628012556227, lng: -110.06504030000002 }
  });

  if (window.locations === undefined || window.locations.length === 0) {
    map.setCenter({ lat: 37.97628012556227, lng: -110.06504030000002 });
  } else {
    var bounds = new google.maps.LatLngBounds();

    for (var i = window.locations.length - 1; i >= 0; i--) {
      var location = window.locations[i];

      var position = { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) };
      var marker = new google.maps.Marker({
        position: position,
        map:      map,
        title:    location.location_name
      });

      bounds.extend(position);

      if (i == window.locations.length - 1) {
        endLocation = position;
      } else if (i == 0) {
        startLocation = position;
      } else {
        waypoints.push({ location: [position.lat, position.lng].join(',') });
      }
    }

    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);

    function triggerCompletion() {
      // This is a hack for Google Maps and it's lazy-loading of images
      document.getElementById('map').classList.remove('pre-render');

      // Let's give the map some extra time to render
      setTimeout(function() {
        window.pdfRenderReady = true;
      }, 500)
    }

    if (window.locations.length > 1) {
      var dirService = new google.maps.DirectionsService();
      var dirRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
      dirRenderer.setMap(map);

      // highlight route
      var request = {
        origin:      startLocation,
        destination: endLocation,
        waypoints:   waypoints,
        travelMode:  google.maps.TravelMode.DRIVING
      };

      dirService.route(request, (result, status) => {
        if (status == google.maps.DirectionsStatus.OK) {

          google.maps.event.addListenerOnce(map, 'idle', function(){
            triggerCompletion()
          });

          dirRenderer.setDirections(result);
        }
      });
    } else {
      triggerCompletion()
    }
  }
}

window.mapping = function() {
  function init() {
    addLocation();
    drawMap();
  }

  if (document.readyState == 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
}
