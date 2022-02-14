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

function update_map(device_name) {
	request('/devices/info', { device_name }, 'get')
	.then(res => {
		const device_data = res;
		
		if (Object.keys(device_data).length > 0) {
			update_info_card(device_data);

			const [lat, lng] = device_data.coordinates.split(/\s*;\s*/).map(coordinate => parseFloat(coordinate));

			window.map.setCenter({ lat, lng });
			window.map.setZoom(17);
			
			window.marker.setMap(map);
			window.marker.setPosition({ lat, lng });
		} else {
			reset_map();
			reset_info_card();
		}
	})
	.catch(_ => {
		reset_map();
		reset_info_card();
	});
}

function reset_map() {
	window.map.setCenter(init_options.center);
	window.map.setZoom(init_options.zoom);
	window.marker.setMap(null);
}