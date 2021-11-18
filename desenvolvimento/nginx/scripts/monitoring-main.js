let interval;

const form = window.document.forms[0];

window.onload = function () {
	// create_map() is called when library is loaded;
	create_charts();
}

let interval_function = function () {
	const device_id = form.elements.current_id.value;
	update_charts(device_id);
}

form.onsubmit = function(e) {
	e.preventDefault();
	
	const device_id  = form.elements.device_id.value;
	const current_id = form.elements.current_id;

	if (device_id !== current_id) {
		clearInterval(interval);

		update_map(device_id);
		update_charts(device_id);

		current_id.value = device_id; // Store last device searched for data updating

		interval = setInterval(interval_function, 2000);
	}
}