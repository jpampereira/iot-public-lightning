const card  = window.document.getElementsByClassName('info')[0];

function add_content(...elements) {
	for (let element of elements) {
		card.appendChild(element);
	}
}

function rmv_content() {
	const texts = window.document.querySelectorAll('.info > *');

	for (let text of texts) {
		card.removeChild(text);
	}
}

function update_info_card(device_info) {
	// Parse device information
	const street   = device_info.street.toUpperCase();
	const district = device_info.district.toUpperCase();
	const status   = device_info.status === true ? 'OPERACIONAL' : 'NÃO OPERACIONAL';

	// Create device information HTML elements
	const street_label   = window.document.createElement('p');
	const street_elem    = window.document.createElement('p');
	const district_label = window.document.createElement('p');
	const district_elem  = window.document.createElement('p');
	const status_label   = window.document.createElement('p');
	const status_elem    = window.document.createElement('p');

	// Insert device information in HTML elements
	street_label.innerHTML   = 'ENDEREÇO:';
	street_elem.innerHTML    = street;
	district_label.innerHTML = 'BAIRRO:';
	district_elem.innerHTML  = district;
	status_label.innerHTML   = 'STATUS:';
	status_elem.innerHTML    = status;

	// Styling status information
	status_elem.style.fontWeight = 'bold';
	
	if (status === 'OPERACIONAL') {
		status_elem.style.color = 'green';
	} else {
		status_elem.style.color = 'red';
	}

	// Remove current content in info-card
	rmv_content();

	// Add new content in card
	add_content(street_label, street_elem, district_label, district_elem, status_label, status_elem);
}

function reset_info_card() {
	rmv_content();

	// Create alert message to show in card
	const alert_msg = window.document.createElement('p');
	alert_msg.innerHTML = 'Dispositivo não encontrado :(';

	add_content(alert_msg);
}