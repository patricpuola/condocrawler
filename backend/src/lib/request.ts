import https from 'https'

export async function makeGetRequest<T>(url: string): Promise<T> {
	return new Promise((resolve, reject) => {
		https
			.get(url, res => {
				let data = ''

				res.on('data', chunk => {
					data += chunk
				})

				res.on('end', () => {
					try {
						const parsedData = JSON.parse(data)
						resolve(parsedData)
					} catch (error) {
						reject(error)
					}
				})
			})
			.on('error', error => {
				reject(error)
			})
	})
}
