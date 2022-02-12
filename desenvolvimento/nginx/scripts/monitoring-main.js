const form = window.document.forms[0];

/******************* ON PAGE LOAD / CHART CONFIGS **********************/

const measures = {
	voltage:   { minValue: 0, maxValue: 200, unit: 'V',   configs: {} },
	current:   { minValue: 0, maxValue: 1,   unit: 'A',   configs: {} },
	lightness: { minValue: 0, maxValue: 300, unit: 'Lux', configs: {} },
	power:     { minValue: 0, maxValue: 200, unit: 'W',   configs: {} },
};

const chart_config = function (type, measure) {
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

window.onload = function () {
	// map creation function is called when library is loaded;
	create_charts(chart_config);
}

/**************************** IN BACKGROUND ****************************/

let gauges_interval;
let lines_interval;

function gauges_interval_function () {
	const device_id = form.elements.current_id.value;
	update_gauge_charts(device_id);
}

function lines_interval_function () {
	const device_id = form.elements.current_id.value;
	update_line_charts(device_id, 60);
}

/*************************** ON PAGE REQUEST ***************************/

form.onsubmit = function (e) {
	e.preventDefault();
	
	const device_id  = form.elements.device_id.value;
	const current_id = form.elements.current_id;

	if (device_id !== current_id && device_id !== "") {
		clearInterval(gauges_interval);
		clearInterval(lines_interval);

		update_map(device_id);
		update_gauge_charts(device_id);
		update_line_charts(device_id, 60);

		current_id.value = device_id; // Store last device searched for data updating

		gauges_interval = setInterval(gauges_interval_function, 1000 * 5); // 5 seconds
		lines_interval  = setInterval(lines_interval_function, 1000 * 60 * 1) // 1 minute
	}
}