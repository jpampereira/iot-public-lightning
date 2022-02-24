/* References:
 * - https://www.chartjs.org/docs/latest/
 * - https://www.npmjs.com/package/chartjs-gauge
 */

/******************* ON PAGE LOAD **********************/

function createCharts (chartConfig) {
	const charts = document.getElementsByClassName('charts');

	for (let chart of charts) {
		const measure = chart.dataset.measure;
		const type    = chart.dataset.type;

		let config = chartConfig(type, measures[measure]);
		measures[measure].configs[`${type}_chart`] = config;

		window[`${measure}-${type}`] = new Chart(chart, config);
	}
}

/********** ON PAGE REQUEST / IN BACKGROUND ************/

function updateGaugeCharts (device_name) {
	request('/devices/measures/last', { device_name }, 'get')
	.then(res => {
		const data = res[0];

		if (data !== undefined) {
			const chartsMeasures = Object.keys(measures);

			chartsMeasures.forEach(measure => {
				measures[measure].configs.gauge_chart.data.datasets[0].data[0] = data[measure];
				measures[measure].configs.gauge_chart.data.datasets[0].value   = data[measure];

				window[`${measure}-gauge`].update();
			});

			changeBtnLabel(data.rele_state);
		} else {
			changeBtnLabel(2);
			resetCharts('gauge');
		}
	})
	.catch(_ => {
		resetCharts('gauge');
	});
}

function updateLineCharts(device_name, interval) {
	request('/devices/measures/interval', { device_name, interval }, 'get')
	.then(res => {
		const labels = res.labels;
		const values = res.values;

		const chartsMeasures = Object.keys(values);

		chartsMeasures.forEach(measure => {
			const measureValues = values[measure];

			measures[measure].configs.line_chart.data.labels = labels;

			if (Array.isArray(measureValues)) {
				measures[measure].configs.line_chart.data.datasets[0].data = measureValues;
			} else {
				measures[measure].configs.line_chart.data.datasets[0].data = measureValues.min;
				measures[measure].configs.line_chart.data.datasets[1].data = measureValues.max;
				measures[measure].configs.line_chart.data.datasets[2].data = measureValues.avg;
			}

			window[`${measure}-line`].update();
		});
	})
	.catch(_ => {
		resetCharts('line');
	});
}

function resetCharts(chart_type) {
	const chartsMeasures = Object.keys(measures);

	chartsMeasures.forEach(measure => {
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