/************** CHART CONFIGS *****************/

const measures = {
	voltage:   { minValue: 0, maxValue: 200, unit: 'V',   configs: {} },
	current:   { minValue: 0, maxValue: 1,   unit: 'A',   configs: {} },
	lightness: { minValue: 0, maxValue: 300, unit: 'Lux', configs: {} },
	power:     { minValue: 0, maxValue: 200, unit: 'W',   configs: {} },
};

function chartConfig (type, measure) {
	const config = { type: type, data: {}, options: {} };

	if (type === 'gauge') {
		config.data = {
			datasets: [{
				minValue:        measure.minValue,
				maxValue:        measure.maxValue,
				data:            [measure.minValue, measure.maxValue],
				value:           measure.minValue,
				backgroundColor: ['green', 'gray'],
				borderWidth:     0
			}]
		};

		config.options = {
			responsive: true,
			layout: {
				padding: {
				top: 15,
				bottom: 15
				}
			},
			needle: {
				radiusPercentage: 2,
				widthPercentage: 2.8,
				lengthPercentage: 80,
				color: 'rgba(255, 255, 255, 1)'
			},
			valueLabel: {
				formatter: (value) => `${value} ${measure.unit}`
			}
		}

	} else if (type === 'line') {
		config.data = {
			labels: [],
			datasets: [{
				label: `Média (${measure.unit})`,
				data: [],
				fill: true,
				borderColor: 'rgb(75, 192, 192)',
				backgroundColor: 'rgba(9, 116, 121, 0.185)',
				tension: 0.1
			}]
		};

		config.options = {
			responsive: true,
			scales: {
				yAxes: [{
					ticks: {
						steps: 10,
					}
				}],
				xAxes: [{
					ticks: {
						display: false
					}
				}],
			},
			legend: {
				labels: {
					padding: 20,
					fontSize: 14
				}
			}
		};
	}
	
	return config;
}

/**************** IN BACKGROUND ***************/

let gaugesInterval;
let linesInterval;

function gaugesIntervalFunction () {
	const deviceName = form.elements.current_name.value;
	updateGaugeCharts(deviceName);
}

function linesIntervalFunction () {
	const deviceName = form.elements.current_name.value;
	updateLineCharts(deviceName, 60);
}

/*************** FORM FUNCTIONS ***************/

function formSubmission(e) {
	e.preventDefault();
	
	const device_name = form.elements.device_name.value;
	const currentName = form.elements.current_name;

	if (device_name !== currentName.value && device_name !== "") {
		clearInterval(gaugesInterval);
		clearInterval(linesInterval);

		updateMap('byDevice', { device_name }).then(updateInfoCard).catch(resetInfoCard);
		updateGaugeCharts(device_name);
		updateLineCharts(device_name, 60);

		currentName.value = device_name; // Store last device searched for data updating

		gaugesInterval = setInterval(gaugesIntervalFunction, 1000 * 5); // 5 seconds
		linesInterval = setInterval(linesIntervalFunction, 1000 * 60 * 1) // 1 minute
	}
}

/************ INFO CARD FUNCTIONS *************/

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

	removeChilds(infoCard, window.document.querySelectorAll('#info > *'));
	appendChilds(infoCard, newValues);
}

function resetInfoCard() {
	removeChilds(infoCard, window.document.querySelectorAll('#info > *'));

	const div = createElement('div');
	
	const img = createElement('img', { src: '../images/monitoring/not-found.png', style: 'margin-bottom: 20px;'});
	appendChilds(div, [img]);

	const p = createElement('p');
	p.innerHTML = 'Dispositivo não encontrado';
	appendChilds(div, [p]);
	
	appendChilds(infoCard, [div]);
}

/*********** ON/OFF BUTTON FUNCTIONS **********/

function changeBtnLabel(status) {
	const btnState = button.getAttribute('btn_state');
	const btnLabels = ['Ligar', 'Desligar', 'Ligar/Desligar'];

	if (status !== btnState) {
		button.setAttribute('btn_state', status);
		button.innerHTML = btnLabels[status];
	}
}

function sendAction () {
	const btnState = button.getAttribute('btn_state');

	if (btnState !== '2') {
		let action = 'D';

		if (btnState === '0') {
			action = 'L';
		}

		const device_name = form.elements.current_name.value;

		request('/devices/actions/on-off', { device_name, action }, 'get');
	}
}

/******************** MAIN ********************/

window.onload = function () {
	createMap();
	createCharts();
}

const form = window.document.forms[0];
form.onsubmit = formSubmission;

const infoCard = window.document.querySelector('#info');

const button = window.document.getElementById('btn-on-off');
button.onclick = sendAction;