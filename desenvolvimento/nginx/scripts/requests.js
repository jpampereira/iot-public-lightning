const url = 'http://localhost:1880';

async function request(endpoint, params, method) {
	try {
		const res = await axios[method](url + endpoint, { params });
		return res.data;
	} catch (e) {
		throw e;
	}
}