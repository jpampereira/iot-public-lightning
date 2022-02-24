const labels = { street: 'ENDEREÇO', district: 'BAIRRO', zone: 'ZONA', status: 'STATUS' }

const infoCard = window.document.getElementsByClassName('info')[0];

function addContent(elems) {
	for (let elem of elems) {
		infoCard.appendChild(elem);
	}
}

function rmvContent() {
	const elems = window.document.querySelectorAll('.info > *');

	for (let elem of elems) {
		infoCard.removeChild(elem);
	}
}

function updateInfoCard(infos) {
	const infos_array = Object.entries(infos[0]);
	
	let elems = infos_array.map(info => {
		const label = info[0];
		
		if (labels[label] !== undefined) { // Ignore information that will not be displayed 
			const value = info[1];

			const div_elem = createElement('div');
			const label_elem = createElement('p');
			const value_elem = createElement('p');
			
			label_elem.innerHTML = `${labels[label]}:`;
			value_elem.innerHTML = value;
			
			if (label === 'status') {			
				value_elem.classList.add(value.replace(/\s+/, '_'));
			}
			
			div_elem.appendChild(label_elem);
			div_elem.appendChild(value_elem);
			
			return div_elem;
		}

		return undefined;
	});

	elems = elems.filter(elem => elem !== undefined);

	rmvContent();

	addContent(elems);
}

function resetInfoCard() {
	rmvContent();

	const div = createElement('div');
	
	const p = createElement('p');
	p.innerHTML = 'Dispositivo não encontrado :(';

	div.appendChild(p);

	addContent([div]);
}