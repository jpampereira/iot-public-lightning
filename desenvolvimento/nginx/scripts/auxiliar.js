async function request(endpoint, params, method) {
	const url = 'http://localhost:1880';

	try {
		const res = await axios[method](url + endpoint, { params });
		return res.data;
	} catch (e) {
		throw e;
	}
}

async function updateZones () {
	try {
		const zones = await request('/devices/info/locations', { type: 'zone' }, 'get');
		const field = window.document.querySelector('select[id="zone"]');
			
		zones.forEach(zone => {
			const option = createElement('option');
			option.innerHTML = zone;
	
			field.appendChild(option);
		});
	} catch (e) {
		throw e;
	}
}

async function updateDistricts () {
	try {
		resetDistricts();
	
		const zone = window.document.querySelector('select[id="zone"]').value;	
		const districts = await request('/devices/info/locations', { type: 'district', zone }, 'get');
		const field = window.document.querySelector('select[id="district"]');
	
		districts.forEach(district => {
			const option = createElement('option');
			option.innerHTML = district;
	
			field.appendChild(option);
		});
	
		field.removeAttribute('disabled');
	} catch (e) {
		throw e;
	}
}

function resetDistricts () {
	const field = window.document.querySelector('select[id="district"]');
	const options = window.document.querySelectorAll('select[id="district"] > :not(option[hidden])');

	options.forEach(option => {
		field.removeChild(option);
	});

	field.setAttribute('disabled', '');
}

function createElement(tag, attrs = {}) {
	const elem = window.document.createElement(tag);

	attrs = Object.entries(attrs);

	attrs.forEach(attr => {
		const name = attr[0];
		const value = attr[1];

		elem.setAttribute(name, value);
	});

	return elem;
}

function setFieldValue (selector, value) {
	const elem = window.document.querySelector(selector);
	elem.value = value;
}