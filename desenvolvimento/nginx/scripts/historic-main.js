const form = window.document.forms[0];

/******************* ON PAGE LOAD / CHART CONFIGS **********************/

const measures = {
	voltage:      { minValue: 0, maxValue: 200, unit: 'V',    configs: {} },
	current:      { minValue: 0, maxValue: 1,   unit: 'A',    configs: {} },
	lightness:    { minValue: 0, maxValue: 300, unit: 'Lux',  configs: {} },
	power:        { minValue: 0, maxValue: 200, unit: 'W',    configs: {} },
	power_expend: { minValue: 0, maxValue: 600, unit: 'kW/h', configs: {} }
};

const chart_config = function (type, measure) {
	const config  = { type: type, data: {}, options: {}};

	const datasets = measure.unit === 'kW/h' ?
	[ 
		{ label: 'Gasto de Energia (kW/h)', border_color: 'rgb(75, 192, 192)', background_color: 'rgba(9, 116, 121, 0.185)' } 
	]
	:
	[
		{ label: 'Mínimo', border_color: 'red',   background_color: 'rgba(255, 0, 0, 0.185)' }, 
		{ label: 'Máximo', border_color: 'green', background_color: 'rgba(0, 255, 0, 0.185)' }, 
		{ label: 'Média',  border_color: 'blue',  background_color: 'rgba(0, 0, 255, 0.185)' }
	];

	config.data = {
		labels: [],
		datasets: datasets.map(dataset => {
			return {
				label: dataset.label,
				data: [],
				fill: true,
				borderColor: dataset.border_color,
				backgroundColor: dataset.background_color,
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

window.onload = function () {
	create_charts(chart_config);
}

/*************************** ON PAGE REQUEST ***************************/

form.onsubmit = function (e) {
	e.preventDefault();
	
	const device_name  = form.elements.device_name.value;
	const current_name = form.elements.current_name;
	const interval     = form.elements.interval.value;
	
	if (device_name !== current_name && device_name !== "") {
		update_line_charts(device_name, interval);

		current_name.value = device_name; // Store last device searched
	}
}