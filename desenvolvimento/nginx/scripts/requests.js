const url = 'http://localhost:1880';

async function request(endpoint, params, method) {
	if (method === 'get') {
		try {
			const res = await axios.get(url + endpoint, { params });
			return res.data;
		} catch (e) {
			throw e;
		}
	}
}