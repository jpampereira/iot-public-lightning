/* References:
 * - https://www.chartjs.org/docs/latest/
 * - https://www.npmjs.com/package/chartjs-gauge
 */

const measures = {
	voltage:   { minValue: 0, maxValue: 200, unit: 'V',   configs: {}},
	current:   { minValue: 0, maxValue: 1,   unit: 'A',   configs: {}},
	lightness: { minValue: 0, maxValue: 300, unit: 'Lux', configs: {}},
	power:     { minValue: 0, maxValue: 200, unit: 'W',   configs: {}},
};

/******************* ON PAGE LOAD **********************/

function create_charts(chart_config) {
	const charts = document.getElementsByClassName('charts');

	for (let chart of charts) {
		const measure = chart.dataset.measure;
		const type    = chart.dataset.type;

		let config = chart_config(type, measures[measure]);
		measures[measure].configs[`${type}_chart`] = config;

		window[`${measure}-${type}`] = new Chart(chart, config);
	}
}

/********** ON PAGE REQUEST / IN BACKGROUND ************/

function update_gauge_charts(device_id) {
	request('/devices/measures/last', { device_id }, 'get')
	.then(res => {
		const data = res[0];

		if (data !== undefined) {
			const charts_measures = Object.keys(measures);

			charts_measures.forEach(measure => {
				measures[measure].configs.gauge_chart.data.datasets[0].data[0] = data[measure];
				measures[measure].configs.gauge_chart.data.datasets[0].value   = data[measure];

				window[`${measure}-gauge`].update();
			});

			change_btn_label(data.rele_state);
		} else {
			change_btn_label(2);
			reset_charts('gauge');
		}
	})
	.catch(_ => {
		reset_charts('gauge');
	});
}

function update_line_charts(device_id, interval) {
	request('/devices/measures/interval', { device_id, interval }, 'get')
	.then(res => {
		const labels = res.labels;
		const values = res.values;

		const charts_measures = Object.keys(values);

		charts_measures.forEach(measure => {
			const measure_values = values[measure];

			measures[measure].configs.line_chart.data.labels = labels;

			if (Array.isArray(measure_values)) {
				measures[measure].configs.line_chart.data.datasets[0].data = measure_values;
			} else {
				measures[measure].configs.line_chart.data.datasets[0].data = measure_values.min;
				measures[measure].configs.line_chart.data.datasets[1].data = measure_values.max;
				measures[measure].configs.line_chart.data.datasets[2].data = measure_values.avg;
			}

			window[`${measure}-line`].update();
		});
	})
	.catch(_ => {
		reset_charts('line');
	});
}

function reset_charts(chart_type) {
	const charts_measures = Object.keys(measures);

	charts_measures.forEach(measure => {
		if (chart_type === 'gauge') {
			measures[measure].configs.gauge_chart.data.datasets[0].data[0] = 0;
			measures[measure].configs.gauge_chart.data.datasets[0].value   = 0;
		} else if (chart_type === 'line') {
			measures[measure].configs.line_chart.data.labels = [];
			measures[measure].configs.line_chart.data.datasets.forEach(dataset => {
				dataset.data = [];
			});
		}

		window[`${measure}-${chart_type}`].update();
	});	
}