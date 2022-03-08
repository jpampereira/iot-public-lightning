/* References:
 * - https://developers.google.com/maps/documentation/javascript/overview
 * - https://www.npmjs.com/package/@googlemaps/markerclustererplus
 * - http://www.americapadaria.com.br/novo/tmp/install_50c09df5e9425/Fabrik-fabrik-22da17a/components/com_fabrik/libs/googlemaps/markerclusterer/docs/reference.html
 */

/*************** MAP VARIABLES ****************/

let map;

const mapOptions = { 
	zoom: 11, 
	center: { lat: -23.533773, lng: -46.625290 },
	mapTypeControl: false, 
	fullscreenControl: false
};

/************** MARKER VARIABLES **************/

let markers;

const markersOptions = {
	maxZoom: 11,
};

let markersEvents = [ 
	{ action: 'mouseover', function: openInfoWindow  }, 
	{ action: 'mouseout',  function: closeInfoWindow }
];

/************** AUX FUNCTIONS *****************/

function getCoordinates(coordinates) {
	const [lat, lng] = coordinates.split(/\s*,\s*/).map(coordinate => parseFloat(coordinate));

	return { lat, lng };
}

/************** MARKER FUNCTIONS **************/

function createMarker (device, infoWindow) {
	const position = getCoordinates(device.coordinates);
	const icon = device.has_alarms ? '../images/maps/marker-problem.png' : '../images/maps/marker.png';

	const marker = new google.maps.Marker({ position, icon, device, infoWindow });

	return marker;
}

function addEventsInMarker (marker, events=[]) {
	events.forEach(event => {
		marker.addListener(event.action, event.function);
	});

	return marker;
}

/*********** INFO WINDOW FUNCTIONS ************/

function createInfoWindow (device) {
	const content = `<p><strong>Identificador do Dispositivo:</strong> ${device.id}</p>
	<p><strong>Nome do Dispositivo:</strong> ${device.name}</p>
	<p><strong>Rua:</strong> ${device.street}</p>
	<p><strong>Bairro:</strong> ${device.district}</p>
	<p><strong>Zona:</strong> ${device.zone}</p>
	<p><strong>Status Operacional:</strong> ${device.status}</p>`;
	
	const infoWindow = new google.maps.InfoWindow({ content });
	
	return infoWindow;
}

function openInfoWindow () {
	this.infoWindow.open({
		anchor: this,
		map,
		shouldFocus: false
	});
}

function closeInfoWindow () {
	this.infoWindow.close();
}

/*************** MAP FUNCTIONS ****************/

function createMap (events=[]) {
	map = new google.maps.Map(window.document.getElementById("map"), mapOptions);
	markers = new MarkerClusterer(map, [], markersOptions);
	markersEvents = markersEvents.concat(events);
}

async function updateMap(endpoint, params) {
	try {
		const devices = await request(`/devices/info/${endpoint}`, params, 'get');

		if (devices.length > 0 && typeof(devices) === 'object') {
			markers.clearMarkers();

			devices.forEach(device => {
				const infoWindow = createInfoWindow(device);
				const marker = createMarker(device, infoWindow);
				addEventsInMarker(marker, markersEvents);

				markers.addMarker(marker);
			});

			if (devices.length === 1) {
				map.setZoom(17);
				map.setCenter(getCoordinates(devices[0].coordinates))
			} else {
				markers.fitMapToMarkers();
			}

			return devices;
		} else {
			resetMap();
			return [];
		}
	} catch (e) {
		console.log(e)
		resetMap();
		return [];
	}
}

function resetMap() {
	map.setCenter(mapOptions.center);
	map.setZoom(mapOptions.zoom);
	markers.clearMarkers();
}