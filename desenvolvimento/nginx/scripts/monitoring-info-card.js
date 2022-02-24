const infoCard = window.document.querySelector('.info');

function updateInfoCard(infos) {
	const labels = { street: 'ENDEREÇO', district: 'BAIRRO', zone: 'ZONA', status: 'STATUS' }

	infos = Object.entries(infos[0]).filter(info => labels[info[0]] !== undefined); // Get only information that will be displayed
	
	const newValues = infos.map(info => {
		let area = createElement('div');
		const label = createElement('p');
		const value = createElement('p');
		
		label.innerHTML = `${labels[info[0]]}:`;
		value.innerHTML = info[1];
		
		if (info[0] === 'status') {			
			value.classList.add(info[1].replace(/\s+/, '_'));
		}
		
		appendChilds(area, [label]);
		appendChilds(area, [value]);
		
		return area;
	});

	removeChilds(infoCard, window.document.querySelectorAll('.info > *'));
	appendChilds(infoCard, newValues);
}

function resetInfoCard() {
	removeChilds(infoCard, window.document.querySelectorAll('.info > *'));

	const div = createElement('div');
	
	const img = createElement('img', { src: '../images/monitoring/not-found.png', style: 'margin-bottom: 20px;'});
	appendChilds(div, [img]);

	const p = createElement('p');
	p.innerHTML = 'Dispositivo não encontrado';
	appendChilds(div, [p]);
	
	appendChilds(infoCard, [div]);
}