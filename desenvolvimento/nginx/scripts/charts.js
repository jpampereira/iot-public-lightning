/* References:
 * - https://www.chartjs.org/docs/latest/
 * - https://www.npmjs.com/package/chartjs-gauge
 */

function createCharts () {
	const charts = document.getElementsByClassName('charts');

	for (let chart of charts) {
		const measure = chart.dataset.measure;
		const type = chart.dataset.type;

		let config = chartConfig(type, measures[measure]);
		measures[measure].configs[`${type}Chart`] = config;

		window[`${measure}-${type}`] = new Chart(chart, config);
	}
}

function updateGaugeCharts (device_id) {
	request('/devices/measures/last', { device_id }, 'get')
	.then(res => {
		const data = res[0];

		if (data !== undefined) {
			const chartsMeasures = Object.keys(measures);

			chartsMeasures.forEach(measure => {
				measures[measure].configs.gaugeChart.data.datasets[0].data[0] = data[measure];
				measures[measure].configs.gaugeChart.data.datasets[0].value   = data[measure];

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

function updateLineCharts (device_id, interval) {
	request('/devices/measures/interval', { device_id, interval }, 'get')
	.then(res => {
		const labels = res.labels;
		const values = res.values;

		const chartsMeasures = Object.keys(values);

		chartsMeasures.forEach(measure => {
			const measureValues = values[measure];

			measures[measure].configs.lineChart.data.labels = labels;

			if (Array.isArray(measureValues)) {
				measures[measure].configs.lineChart.data.datasets[0].data = measureValues;
			} else {
				measures[measure].configs.lineChart.data.datasets[0].data = measureValues.min;
				measures[measure].configs.lineChart.data.datasets[1].data = measureValues.max;
				measures[measure].configs.lineChart.data.datasets[2].data = measureValues.avg;
			}

			window[`${measure}-line`].update();
		});
	})
	.catch(_ => {
		resetCharts('line');
	});
}

function resetCharts (chartType) {
	const chartsMeasures = Object.keys(measures);

	chartsMeasures.forEach(measure => {
		if (chartType === 'gauge') {
			measures[measure].configs.gaugeChart.data.datasets[0].data[0] = 0;
			measures[measure].configs.gaugeChart.data.datasets[0].value   = 0;
		} else if (chartType === 'line') {
			measures[measure].configs.lineChart.data.labels = [];
			measures[measure].configs.lineChart.data.datasets.forEach(dataset => {
				dataset.data = [];
			});
		}

		window[`${measure}-${chartType}`].update();
	});	
}