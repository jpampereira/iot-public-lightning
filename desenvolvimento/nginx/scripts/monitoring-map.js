/* References:
 * - https://developers.google.com/maps/documentation/javascript/overview
 */

const map_element  = document.getElementById("map");
const init_options = { zoom: 11, center: { lat: -23.533773, lng: -46.625290 } }; // Latitude and Longitude of Sao Paulo

/******************* ON PAGE LOAD **********************/

function create_map () {
	window.map    = new google.maps.Map(map_element, init_options);
	window.marker = new google.maps.Marker({ icon: '../images/map-marker.png' });
}

/******************* ON PAGE REQUEST *******************/

function update_map(device_id) {
	request('/monitoring/device-info', device_id, 'get')
	.then(res => {
		const device_data = res[0];

		if (device_data !== undefined) {
			const lat = parseFloat(device_data.latitude);
			const lng = parseFloat(device_data.longitude);

			window.map.setCenter({ lat, lng });
			window.map.setZoom(17);
			window.marker.setMap(map);
			window.marker.setPosition({ lat, lng });
		} else {
			reset_map();
		}
	})
	.catch(reset_map());
}

function reset_map() {
	window.map.setCenter(init_options.center);
	window.map.setZoom(init_options.zoom);
	window.marker.setMap(null);
}