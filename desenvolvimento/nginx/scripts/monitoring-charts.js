/* References:
 * - https://www.chartjs.org/docs/latest/
 * - https://www.npmjs.com/package/chartjs-gauge
 */

const charts_elements = document.getElementsByClassName('chart');

const measures = {
	tensao:       { minValue: 0, maxValue: 200, unit: 'V',   unit_legend: 'Volts' },
	corrente:     { minValue: 0, maxValue: 1,   unit: 'A',   unit_legend: 'Ampere' },
	luminosidade: { minValue: 0, maxValue: 300, unit: 'Lux'},
	potencia:     { minValue: 0, maxValue: 200, unit: 'W',   unit_legend: 'Watts' },
};

/******************* ON PAGE LOAD **********************/

function create_charts() {
	const charts = charts_elements;

	for (let chart of charts) {
		const chart_id = chart.id;
		const configs  = chart_config(measures[chart_id]);

		measures[chart_id].configs = configs;

		window[`${chart_id}-gauge`] = new Chart(chart, configs);
	}
}

function chart_config(measure) {
	return {
		type: 'gauge',
		data: {
			datasets: [{
				minValue:        measure.minValue,
				data:            [0, measure.maxValue],
				value:           0,
				backgroundColor: ['green', 'gray'],
				borderWidth:     0
			}]
		},
		options: {
			responsive: false,
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
				color: 'rgba(255, 255, 255, 1)' // Color of needle
			},
			valueLabel: {
				formatter: (value) => `${value} ${measure.unit}  ${measure.unit_legend !== undefined ? `(${measure.unit_legend})` : ''}`
			}
		} 
	}	
}

/********** ON PAGE REQUEST / IN BACKGROUND ************/

function update_charts(device_id) {
	request('/monitoring/sensor-data', device_id, 'get')
	.then(res => {
		const sensors_data = res[0];

		if (sensors_data !== undefined) {
			const charts_id = Object.keys(measures);

			charts_id.forEach(chart_id => {
				measures[chart_id].configs.data.datasets[0].data[0] = sensors_data[chart_id];
				measures[chart_id].configs.data.datasets[0].value   = sensors_data[chart_id];
	
				window[`${chart_id}-gauge`].update();
			});

			change_btn_label(sensors_data.rele_state);
		} else {
			change_btn_label(2);
			reset_charts();
		}
	})
	.catch(reset_charts);
}

function reset_charts() {
	const charts_id = Object.keys(measures);

	charts_id.forEach(chart_id => {
		measures[chart_id].configs.data.datasets[0].data[0] = 0;
		measures[chart_id].configs.data.datasets[0].value   = 0;

		window[`${chart_id}-gauge`].update();
	});	
}