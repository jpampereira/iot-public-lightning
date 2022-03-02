/*************** FORM FUNCTIONS ***************/

function createForm (e) {
	const form = e.target.parentNode;
	const searchType = e.target.value;

	resetForm(form);

	if (searchType === 'device') {
		searchByDevice(form);
	} else if (searchType === 'location') {
		searchByLocation(form);
	}

	const button = createElement('button');
	button.innerHTML = 'Buscar';

	form.appendChild(button);
}

function resetForm(form) {
	const childs = Array.from(form.children);

	childs.forEach(child => {
		if (!child.hasAttribute('init')) {
			form.removeChild(child);
		}
	});
}

function searchByDevice (form) {
	// Device search type
	const select = createElement('select', { id: 'device_attr', name: 'device_attr' });
	
	const options = [
		{ attrs: { hidden: '', value: '' }, label: 'Tipo de busca' },
		{ attrs: { value: 'device_id' },    label: 'Por ID' },
		{ attrs: { value: 'device_name' },  label: 'Por nome' }
	];

	options.forEach(option => {
		const elem = createElement('option', option.attrs);
		elem.innerHTML = option.label;
		select.appendChild(elem);
	});
	
	form.appendChild(select);

	// Value input
	const input = createElement('input', { name: 'value', id: 'value', placeholder: 'Valor da busca' });

	form.appendChild(input);
}

function searchByLocation (form) {
	let option;

	// Create zones field
	const zones = createElement('select', { id: 'zone', name: 'zone' });

	option = createElement('option', { value: '', hidden: '' });
	option.innerHTML = 'Selecionar zona';

	zones.appendChild(option);

	updateZones();
	zones.addEventListener('change', updateDistricts);

	// Create districts field
	const districts = createElement('select', { id: 'district', name: 'district', disabled: '' });

	option = createElement('option', { value: '', hidden: '' });
	option.innerHTML = 'Selecionar bairro';

	districts.appendChild(option);

	// Insert fields in form
	form.appendChild(zones);
	form.appendChild(districts);
}

function formSubmission (e) {
	e.preventDefault();

	const form = new FormData(e.target);

	const searchType = form.get('type');

	const params = {};

	if (searchType === 'device') {
		const deviceAttr = form.get('device_attr');
		const value = form.get('value');

		if (deviceAttr === '' || value === '') return;

		params[deviceAttr] = value;
	} else if (searchType === 'location') {
		const zone = form.get('zone');
		const district = form.get('district');

		if (zone === '' || district === '') return;

		params.zone = zone;
		params.district = district;
	}

	const endpoint = `by${searchType[0].toUpperCase() + searchType.slice(1)}`;

	removeTable();
	updateMap(endpoint, params);
}

/************** TABLE FUNCTIONS ***************/

function createTable () {
	const area = createElement('div', { id: 'alarms' });

	// Create table
	const table = createElement('table');

	// Create table header
	const header = createElement('thead');
	const row = createElement('tr');
	const columns = ['ID do Alarme', 'Nome do Alarme', 'Data de Criação'].map(column => {
		const th = createElement('th');
		th.innerHTML = column;

		return th;
	});
	appendChilds(row, columns);
	appendChilds(header, [row]);

	// Create table body
	const body = createElement('tbody');

	// Append header and body in table
	appendChilds(table, [header]);
	appendChilds(table, [body]);

	appendChilds(area, [table]);

	const main = window.document.querySelector('main');
	appendChilds(main, [area]);
}

function removeTable () {
	const main = window.document.querySelector('main');
	const table = window.document.querySelector('#alarms');

	if (table !== null) {
		removeChilds(main, [table]);
	}
}

function getAlarms () {
	removeTable();

	request('/devices/info/alarms', { device_id: this.device.id }, 'get')
	.then(res => {
		const alarms = res;

		const rows = alarms.map(alarm => {
			const row = createElement('tr');

			const columns = Object.entries(alarm).map(info => {
				const column = createElement('td');
				column.innerHTML = info[1];

				return column;
			});

			appendChilds(row, columns);

			return row;
		});

		createTable();

		const tbody = window.document.querySelector('tbody');
		appendChilds(tbody, rows);

		window.location.href = '#alarms';
	})
	.catch(console.log);
}

/******************** MAIN ********************/

window.onload = function () {
	createMap([{ action: 'click', function: getAlarms }]);
};

const searchType = window.document.querySelector('select[id="type"]');
searchType.addEventListener('change', createForm);

const form = window.document.forms[0];
form.onsubmit = formSubmission;