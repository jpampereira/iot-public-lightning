function update_zones () {
	request('/devices/info/locations', { type: 'zone' }, 'get')
	.then(res => {
		const zones = res;

		const select = window.document.querySelector('select[id="zone"]');
		
		zones.forEach(zone => {
			const option = window.document.createElement('option');
			option.innerHTML = zone;

			select.appendChild(option);
		})
	})
	.catch(console.log);
}

function create_search_btn () {
	// Change checked attribute
	const update_mode = window.document.querySelector('input[id="update"]');
	const create_mode = window.document.querySelector('input[id="create"]');

	create_mode.removeAttribute('checked');
	update_mode.setAttribute('checked', '');

	// Create search button
	const div = window.document.querySelector('#buttons > :nth-child(1)');

	const button = window.document.createElement('div');
	button.setAttribute('id', 'get');
	button.setAttribute('class', 'button');
	button.innerHTML = 'Buscar';
	button.addEventListener('click', get);

	div.appendChild(button);
	div.style.justifyContent = 'space-between';

	reset_form();
}

function rm_search_btn () {
	// Change checked attribute
	const update_mode = window.document.querySelector('input[id="update"]');
	const create_mode = window.document.querySelector('input[id="create"]');

	update_mode.removeAttribute('checked');
	create_mode.setAttribute('checked', '');

	// Remove search button
	const div = window.document.querySelector('#buttons > :nth-child(1)');
	const button = window.document.querySelector('.button[id="get"]');

	div.removeChild(button);
	div.style.justifyContent = 'center';

	reset_form();
}

function update_districts () {
	reset_districts();

	const select = window.document.querySelector('select[id="zone"]');
	const zone = select.value;

	request('/devices/info/locations', { type: 'district', zone }, 'get')
	.then(res => {
		districts = res;

		const select = window.document.querySelector('select[id="district"]');

		districts.forEach(district => {
			const option = window.document.createElement('option');
			option.innerHTML = district;

			select.appendChild(option);
		})
	})
	.catch(console.log)
}

function reset_districts () {
	const districts_select = window.document.querySelector('select[id="district"]');
	let districts_opts = window.document.querySelectorAll('select[id="district"] > :not(option[hidden])');

	districts_opts.forEach(opt => {
		districts_select.removeChild(opt);
	});
}

function reset_form () {
	const form = window.document.forms[0];
	form.reset();

	reset_districts();
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
	const form = window.document.forms[0];
	const fields = new FormData(form);
	
	const params = {};

	for (let field of fields.entries()) {
		const key = field[0];
		const value = field[1];

		params[key] = value;
	}

	if (validation(params)) {
		const method = params.action === 'create' ? 'post' : 'put';

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
	const form = window.document.forms[0];
	const fields = new FormData(form);

	const device_name = fields.get('device_name');

	if (device_name !== "") {
		request('/devices/info', { device_name }, 'get')
		.then(res => {

			const infos = Object.entries(res);

			if (infos.length > 0) {
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
		window.alert('Preencha o campo \'Nome do Dispositivo\' para realizar a busca!')
	}
}

/******************* ACTIONS *******************/

window.onload = update_zones;

const update_mode = window.document.querySelector('input[id="update"]');
update_mode.addEventListener('change', create_search_btn);

const create_mode = window.document.querySelector('input[id="create"]');
create_mode.addEventListener('change', rm_search_btn);

const zone_select = window.document.querySelector('select[id="zone"]');
zone_select.addEventListener('change', update_districts);

const set_button = window.document.querySelector('.button[id="set"]');
set_button.addEventListener('click', set);

const reset_button = window.document.querySelector('.button[id="reset"]');
reset_button.addEventListener('click', reset_form);