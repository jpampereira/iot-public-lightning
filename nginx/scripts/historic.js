/************** CHART CONFIGS *****************/

const measures = {
	voltage:      { minValue: 0, maxValue: 200, unit: 'V',    configs: {} },
	current:      { minValue: 0, maxValue: 1,   unit: 'A',    configs: {} },
	lightness:    { minValue: 0, maxValue: 300, unit: 'Lux',  configs: {} },
	power:        { minValue: 0, maxValue: 200, unit: 'W',    configs: {} },
	power_expend: { minValue: 0, maxValue: 600, unit: 'kW/h', configs: {} }
};

function chartConfig (type, measure) {
	const config  = { type: type, data: {}, options: {}};

	const datasets = measure.unit === 'kW/h' ?
	[ 
		{ label: 'Gasto de Energia (kW/h)', borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(9, 116, 121, 0.185)' } 
	]
	:
	[
		{ label: 'Mínimo', borderColor: 'red',   backgroundColor: 'rgba(255, 0, 0, 0.185)' }, 
		{ label: 'Máximo', borderColor: 'green', backgroundColor: 'rgba(0, 255, 0, 0.185)' }, 
		{ label: 'Média',  borderColor: 'blue',  backgroundColor: 'rgba(0, 0, 255, 0.185)' }
	];

	config.data = {
		labels: [],
		datasets: datasets.map(dataset => {
			return {
				label: dataset.label,
				data: [],
				fill: true,
				borderColor: dataset.borderColor,
				backgroundColor: dataset.backgroundColor,
				tension: 0.1
			}
		})
	};
	
	config.options = {
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
			}]
		},
		legend: {
			labels: {
				padding: 20,
				fontSize: 14
			}
		}
	};
	
	return config;
}

/*************** FORM FUNCTIONS ***************/

async function formSubmission (e) {
	e.preventDefault();
	
	const device_name = form.elements.device_name.value;
	const interval = form.elements.interval.value;

	if (device_name !== '' && interval !== '') {
		const [device] = await request('/devices/info/byDevice', { device_name }, 'get');
		const deviceId = device !== undefined ? device.id : 0;

		updateLineCharts(deviceId, interval);
	}
}

/******************** MAIN ********************/

window.onload = createCharts;

const form = window.document.forms[0];
form.onsubmit = formSubmission;