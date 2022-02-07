const labels = { street: 'ENDEREÇO', district: 'BAIRRO', zone: 'ZONA', status: 'STATUS' }

const info_card = window.document.getElementsByClassName('info')[0];

function add_content(elems) {
	for (let elem of elems) {
		info_card.appendChild(elem);
	}
}

function rmv_content() {
	const elems = window.document.querySelectorAll('.info > *');

	for (let elem of elems) {
		info_card.removeChild(elem);
	}
}

function update_info_card(infos) {
	const infos_array = Object.entries(infos);
	infos_array.shift() // remove coordinates info
	
	const elems = infos_array.map(info => {
		const label = info[0];
		const value = info[1];
		
		const div_elem   = window.document.createElement('div');
		const label_elem = window.document.createElement('p');
		const value_elem = window.document.createElement('p');
		
		label_elem.innerHTML = `${labels[label]}:`;
		value_elem.innerHTML = value;
		
		if (label === 'status') {			
			value_elem.classList.add(value.replace(/\s+/, '_'));
		}
		
		div_elem.appendChild(label_elem);
		div_elem.appendChild(value_elem);
		
		return div_elem;
	});

	rmv_content();

	add_content(elems);
}

function reset_info_card() {
	rmv_content();

	const div = window.document.createElement('div');
	const p = window.document.createElement('p');

	p.innerHTML = 'Dispositivo não encontrado :(';

	div.appendChild(p);

	add_content([div]);
}