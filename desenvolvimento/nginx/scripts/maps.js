/* References:
 * - https://developers.google.com/maps/documentation/javascript/overview
 * - https://www.npmjs.com/package/@googlemaps/markerclustererplus
 * - http://www.americapadaria.com.br/novo/tmp/install_50c09df5e9425/Fabrik-fabrik-22da17a/components/com_fabrik/libs/googlemaps/markerclusterer/docs/reference.html
 */

/********** VARIABLES **********/

let map;
let markers;

const mapOptions = { 
	zoom: 11, 
	center: { lat: -23.533773, lng: -46.625290 },
	mapTypeControl: false, 
	fullscreenControl: false
};

const markersOptions = {
	maxZoom: 11,
};

/********** FUNCTIONS **********/

function createMap () {
	map = new google.maps.Map(window.document.getElementById("map"), mapOptions);
	markers = new MarkerClusterer(map, [], markersOptions);
}

function getCoordinates(coordinates) {
	const [lat, lng] = coordinates.split(/\s*,\s*/).map(coordinate => parseFloat(coordinate)); 
	return { lat, lng };
}

async function updateMap(endpoint, params) {
	try {
		const devices = await request(`/devices/info/${endpoint}`, params, 'get');

		if (devices.length > 0 && typeof(devices) === 'object') {
			markers.clearMarkers();
			
			devices.forEach(device => {
				const position = getCoordinates(device.coordinates);
				const marker = new google.maps.Marker({ position, icon: '../images/maps/marker.png' });
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