const btn = window.document.getElementsByClassName('btn-on-off')[0];

let btn_state = 2;

//****************** IN BACKGROUND *********************/

const btn_opts = {
	'0': { color: '#008000', text: 'Ligar',          hover: { color: '#005c00', cursor: 'pointer', font: 'bold'}  },  // Off
	'1': { color: '#ff0000', text: 'Desligar ',      hover: { color: '#a30000', cursor: 'pointer', font: 'bold' } },  // On
	'2': { color: '#808080', text: 'Ligar/Desligar', hover: { color: '#808080', cursor: 'default', font: 'normal' } } // Unknown
};

function change_btn_label(status) {
	// Change button label only if has rele state change since last verification
	if (status !== btn_state) {
		// Get configs to apply in button
		const configs = btn_opts[status];

		// Get button elements
		const btn_hover = window.document.styleSheets[0];

		// Apply new style
		btn.style.backgroundColor = configs.color;
		btn.innerHTML = configs.text;
		btn_hover.insertRule(`.btn-on-off:hover { font-weight: ${configs.hover.font} }`, 0);
		btn_hover.insertRule(`.btn-on-off:hover { background-color: ${configs.hover.color} }`, 0);
		btn_hover.insertRule(`.btn-on-off:hover { cursor: ${configs.hover.cursor} }`, 0);

		btn_state = status;
	}
}

/******************* ON PAGE REQUEST *******************/

btn.onclick = function() {
	if (btn_state !== 2) {
		let action = 'D';
		if (btn_state === 0) {
			action = 'L';
		}

		request('/monitoring/change-status', action, 'get')
		.then()
		.catch(console.log);
	}
}