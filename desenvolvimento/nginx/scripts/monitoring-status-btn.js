const btn = window.document.getElementsByClassName('btn-on-off')[0];

let btnState = 2;

//****************** IN BACKGROUND *********************/

// 0 = Off, 1 = On, 2 = Unknown
const btn_opts = {
	'0': { color: '#008000', text: 'Ligar',          hover: { cursor: 'pointer', font: 'bold'   }, active: { border: '1px inset #004d00', padding: '14px 29px' } },  
	'1': { color: '#ff0000', text: 'Desligar ',      hover: { cursor: 'pointer', font: 'bold'   }, active: { border: '1px inset #aa0000', padding: '14px 29px' } },
	'2': { color: '#808080', text: 'Ligar/Desligar', hover: { cursor: 'default', font: 'normal' }, active: { border: 'none',              padding: '15px 30px' } }
};

function changeBtnLabel(status) {
	// Change button label only if has rele state change since last verification
	if (status !== btnState) {
		// Get configs to apply in button
		const configs = btn_opts[status];

		// Get button pseudo-elements
		const btn_pseudo_elem = window.document.querySelector(':root').style;

		// Apply new style
		btn.style.backgroundColor = configs.color;
		btn.innerHTML = configs.text;

		btn_pseudo_elem.setProperty('--btn-weight',  configs.hover.font);
		btn_pseudo_elem.setProperty('--btn-cursor',  configs.hover.cursor);
		btn_pseudo_elem.setProperty('--btn-border',  configs.active.border);
		btn_pseudo_elem.setProperty('--btn-padding', configs.active.padding);

		btnState = status;
	}
}

/******************* ON PAGE REQUEST *******************/

btn.onclick = function() {
	if (btnState !== 2) {
		let action = 'D';
		if (btnState === 0) {
			action = 'L';
		}

		const device_name = form.elements.current_name.value;

		request('/devices/actions/on-off', { device_name, action }, 'get')
		.then()
		.catch(console.log);
	}
}