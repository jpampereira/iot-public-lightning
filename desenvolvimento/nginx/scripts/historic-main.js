/******************* ON PAGE LOAD **********************/

const chart_config = function (type, measure) {
	const config  = { type: type, data: {}, options: {}};
	
	const datasets = [
		{ label: 'Mínimo', color: 'red'   }, 
		{ label: 'Máximo', color: 'green' }, 
		{ label: 'Média',  color: 'blue'  }
	];

	config.data = {
		labels: [],
		datasets: datasets.map(dataset => {
			return {
				label: dataset.label,
				data: [],
				fill: true,
				borderColor: dataset.color,
				tension: 0.1
			}
		})
	};
	
	config.options = {
		scales: {
			yAxes: [{
				ticks: {
					steps: 10,
					max: measure.maxValue
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

/******************* ON PAGE REQUEST *******************/

const form = window.document.forms[0];

form.onsubmit = function (e) {
	e.preventDefault();
	
	const device_id = form.elements.device_id.value;
	const interval  = form.elements.interval.value;
	
	if (device_id !== "") {
		update_line_charts(device_id, interval);
	}
}