function update_zones () {
	request('/devices/info/locations', { type: 'zone' }, 'get')
	.then(res => {
		const zones = res;

		const field = window.document.querySelector('select[id="zone"]');
		
		zones.forEach(zone => {
			const option = window.document.createElement('option');
			option.innerHTML = zone;

			field.appendChild(option);
		});
	})
	.catch(console.log);
}

function update_districts () {
	reset_districts();

	const zone = window.document.querySelector('select[id="zone"]').value;

	request('/devices/info/locations', { type: 'district', zone }, 'get')
	.then(res => {
		const districts = res;

		const field = window.document.querySelector('select[id="district"]');

		districts.forEach(district => {
			const option = window.document.createElement('option');
			option.innerHTML = district;

			field.appendChild(option);
		});

		field.removeAttribute('disabled');
	})
	.catch(console.log)
}

function reset_districts () {
	const field = window.document.querySelector('select[id="district"]');
	const options = window.document.querySelectorAll('select[id="district"] > :not(option[hidden])');

	options.forEach(option => {
		field.removeChild(option);
	});

	field.setAttribute('disabled', '');
}

function reset_form () {
	// Reset form
	const form = window.document.forms[0];
	form.reset();

	// Enable disabled fields
	const fields = window.document.querySelectorAll('.disabled');
	fields.forEach(field => field.removeAttribute('disabled'));

	// Reset district options
	reset_districts();
}

function update_mode () {
	// Change checked attribute
	const insert_radio = window.document.querySelector('input[id="insert"]');
	const update_radio = window.document.querySelector('input[id="update"]');

	insert_radio.removeAttribute('checked');
	update_radio.setAttribute('checked', '');

	// Create ID field
	const id_field = window.document.createElement('div');
	const line = window.document.querySelector('#data > :nth-child(1)');

	const label = window.document.createElement('label');
	label.setAttribute('for', 'id');
	label.innerHTML = 'ID do Dispositivo';

	const input = window.document.createElement('input');
	input.setAttribute('type', 'text');
	input.setAttribute('name', 'id');
	input.setAttribute('id', 'id');
	input.setAttribute('class', 'disabled');

	id_field.appendChild(label);
	id_field.appendChild(input);

	line.appendChild(id_field);

	// Create get button
	const set_button = window.document.querySelector('#set');
	const div = set_button.parentElement;

	const get_button = window.document.createElement('div');
	get_button.setAttribute('id', 'get');
	get_button.setAttribute('class', 'button');
	get_button.innerHTML = 'Buscar';
	get_button.addEventListener('click', get);
	
	div.insertBefore(get_button, set_button);
	div.style.justifyContent = 'space-between';

	// Reset form
	reset_form();
}

function insert_mode () {
	// Change checked attribute
	const insert_radio = window.document.querySelector('input[id="insert"]');
	const update_radio = window.document.querySelector('input[id="update"]');

	update_radio.removeAttribute('checked');
	insert_radio.setAttribute('checked', '');

	// Remove ID field
	const id_field = window.document.querySelector('#data > :nth-child(1) > :nth-child(2)');
	const line = id_field.parentElement;

	line.removeChild(id_field);

	// Remove get button
	const get_button = window.document.querySelector('#get');
	const div = get_button.parentElement;

	div.removeChild(get_button);
	div.style.justifyContent = 'center';

	// Reset form
	reset_form();
}

function validation (params) {
	if (parseInt(params.interval) === NaN || parseInt(params.interval) < 1000) {
		return false;
	}

	if (!params.coordinates.match(/^(-)?\d+\.\d+;(-)?\d+\.\d+$/)) {
		return false;
	}

	return Object.entries(params).every(param => param[1] !== "");
}

function set () {
	const form = new FormData(window.document.forms[0]);
	
	const name = window.document.querySelector('input[id="name"]').value; // disable field in update mode

	const params = { name };

	for (let field of form.entries()) {
		const key = field[0];
		const value = field[1];

		params[key] = value;
	}

	if (validation(params)) {
		const method = params.action === 'insert' ? 'post' : 'put';

		request(`/devices/info`, params, method)
		.then(res => {
			window.alert(res);
			reset_form();
		})
		.catch(console.log);
	} else {
		window.alert(`Preencha todos os campos corretamente!`);
	}
}

function get () {
	const form = new FormData( window.document.forms[0]);

	const device_name = form.get('name');
	const device_id = form.get('id');

	if (device_name !== "" || device_id !== "") {
		request('/devices/info', { device_name, device_id }, 'get')
		.then(res => {

			const infos = Object.entries(res);

			if (infos.length > 0) {
				// Disable fields
				const fields = window.document.querySelectorAll('.disabled');
				fields.forEach(field => field.setAttribute('disabled', ''));

				// Populate fields
				infos.forEach(info => {
					const key = info[0];
					const value = info[1];

					const elem = window.document.querySelector(`.line > div > [name="${key}"]`);

					elem.value = value;

					if (key === 'zone') {
						update_districts();
					}
				});
			} else {
				window.alert('Dispositivo não encontrado.');
				reset_form();
			}
		})
		.catch(console.log);
	} else {
		window.alert('Preencha o campo \'Nome do Dispositivo\' ou \'ID do Dispositivo\' para realizar a busca!')
	}
}

/******************* ACTIONS *******************/

window.onload = update_zones;

const update_radio = window.document.querySelector('input[id="update"]');
update_radio.addEventListener('change', update_mode);

const insert_radio = window.document.querySelector('input[id="insert"]');
insert_radio.addEventListener('change', insert_mode);

const zone_select = window.document.querySelector('select[id="zone"]');
zone_select.addEventListener('change', update_districts);

const reset_button = window.document.querySelector('.button[id="reset"]');
reset_button.addEventListener('click', reset_form);

const set_button = window.document.querySelector('.button[id="set"]');
set_button.addEventListener('click', set);