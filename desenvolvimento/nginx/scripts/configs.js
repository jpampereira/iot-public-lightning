/*************** FORM FUNCTIONS ***************/

function resetForm () {
	// Reset form
	const form = window.document.forms[0];
	form.reset();

	// Change fields status
	const mode = window.document.querySelector('[checked]').id;

	if (mode === 'insert') {
		enableFields('[disabled]');
	} else {
		enableFields('.disable');
		disableFields('.enable');

		// Add get button action
		const button = window.document.querySelector('#get');
		button.addEventListener('click', get);
	}

	// Reset district options
	resetDistricts();
}

function updateMode () {
	// Change checked attribute
	const insertRadio = window.document.querySelector('input[id="insert"]');
	const updateRadio = window.document.querySelector('input[id="update"]');

	insertRadio.removeAttribute('checked');
	updateRadio.setAttribute('checked', '');

	// Create ID field
	const area = window.document.querySelector('#data > :nth-child(1)');
	
	const field = createElement('div');

	const label = createElement('label', { for: 'id' });
	label.innerHTML = 'ID do Dispositivo';
	field.appendChild(label);

	const input = createElement('input', { type: 'text', name: 'id', id: 'id', class: 'disable' });
	field.appendChild(input);

	area.appendChild(field);

	// Create get button
	const setButton = window.document.querySelector('#set');
	const div = setButton.parentElement;

	const getButton = createElement('div', { id: 'get', class: 'button' });
	getButton.innerHTML = 'Buscar';
	getButton.addEventListener('click', get);
	
	div.insertBefore(getButton, setButton);
	div.style.justifyContent = 'space-between';

	// Reset form
	resetForm();
}

function insertMode () {
	// Change checked attribute
	const insertRadio = window.document.querySelector('input[id="insert"]');
	const updateRadio = window.document.querySelector('input[id="update"]');

	updateRadio.removeAttribute('checked');
	insertRadio.setAttribute('checked', '');

	// Remove ID field
	const field = window.document.querySelector('#data > :nth-child(1) > :nth-child(2)');
	const area = field.parentElement;

	area.removeChild(field);

	// Remove get button
	const getButton = window.document.querySelector('#get');
	const div = getButton.parentElement;

	div.removeChild(getButton);
	div.style.justifyContent = 'center';

	// Reset form
	resetForm();
}

function validation (params) {
	if (parseInt(params.interval) === NaN || parseInt(params.interval) < 1000) {
		return false;
	}

	if (!params.coordinates.match(/^(-)?\d+\.\d+,(-)?\d+\.\d+$/)) {
		return false;
	}

	return Object.entries(params).every(param => param[1] !== "");
}

function set () {
	const form = new FormData(window.document.forms[0]);
	
	const name = window.document.querySelector('input[id="name"]').value; // disabled field in update mode

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
			resetForm();
		})
		.catch(console.log);
	} else {
		window.alert(`Preencha todos os campos corretamente!`);
	}
}

function get () {
	const form = new FormData(window.document.forms[0]);

	const device_name = form.get('name');
	const device_id = form.get('id');

	if (device_name !== '' || device_id !== '') {
		request('/devices/info/byDevice', { device_name, device_id }, 'get')
		.then(res => {
			if (res.length > 0) {
				// Populate fields
				const data = res[0];
	
				setFieldValue('#id', data.id);
				setFieldValue('#name', data.name);
				setFieldValue('#status', data.status);
				setFieldValue('#street', data.street);
				setFieldValue('#zone', data.zone);
				updateDistricts().then(_ => setFieldValue('#district', data.district)).catch(console.log);
				setFieldValue('#coordinates', data.coordinates);
				setFieldValue('#interval', data.interval);

				// Change fields status
				disableFields('.disable');
				enableFields('.enable');

				// Remove get button action
				const button = window.document.querySelector('#get');
				button.removeEventListener('click', get); 
			} else {
				window.alert('Dispositivo não encontrado.');
				resetForm();
			}
		})
		.catch(console.log);
	} else {
		window.alert('Preencha o campo \'Nome do Dispositivo\' ou \'ID do Dispositivo\' para realizar a busca!')
	}
}

function disableFields (selector) {
	const fields = window.document.querySelectorAll(selector);
	fields.forEach(field => field.setAttribute('disabled', ''));
}

function enableFields (selector) {
	const fields = window.document.querySelectorAll(selector);
	fields.forEach(field => field.removeAttribute('disabled'));
}

/******************** MAIN ********************/

window.onload = updateZones;

const updateRadio = window.document.querySelector('input[id="update"]');
updateRadio.addEventListener('change', updateMode);

const insertRadio = window.document.querySelector('input[id="insert"]');
insertRadio.addEventListener('change', insertMode);

const zoneSelect = window.document.querySelector('select[id="zone"]');
zoneSelect.addEventListener('change', updateDistricts);

const resetButton = window.document.querySelector('.button[id="reset"]');
resetButton.addEventListener('click', resetForm);

const setButton = window.document.querySelector('.button[id="set"]');
setButton.addEventListener('click', set);