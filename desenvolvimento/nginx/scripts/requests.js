const url = 'http://localhost:1880';

async function request(endpoint, param, method) {
	if (method === 'get') {
		try {
			const res = await axios.get(url + endpoint, { params: { param } });
			return res.data;
		} catch (e) {
			throw e;
		}
	}
}