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

/******************** MAIN ********************/

window.onload = function () {
	createMap();
	createCharts();
}

const form = window.document.forms[0];
form.onsubmit = formSubmission;