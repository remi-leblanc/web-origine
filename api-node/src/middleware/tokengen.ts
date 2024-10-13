import axios from 'axios'
import { AppDataSource } from "../data-source"
import { Token } from "../entity/Token"

const tokenRepo = AppDataSource.getRepository(Token)

export const tokengen = async (req, res, next) => {
	let authToken = await tokenRepo.findOneBy({ name: 'sirene' })

	let now = new Date()
	var diffHours = 0
	if (authToken) {
		diffHours = (authToken.expiresAt!.valueOf() - now.valueOf()) / 36e5;
	}
	if (!authToken || diffHours <= 1) {
		axios({
			method: 'post',
			url: 'https://api.insee.fr/token',
			headers: {
				"Authorization": "Basic " + Buffer.from(process.env.INSEE_CONSUMER_KEY + ":" + process.env.INSEE_SECRET_KEY).toString('base64'),
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			data: {
				grant_type: 'client_credentials'
			}
		})
			.then(async (response) => {
				let expiresAtDate = new Date()
				expiresAtDate.setSeconds(expiresAtDate.getSeconds() + response.data.expires_in)

				if (!authToken) {
					authToken = new Token()
					authToken.name = 'sirene'
					authToken.headerKey = 'Authorization'
				}

				authToken.headerValue = response.data.token_type + ' ' + response.data.access_token
				authToken.updatedAt = now
				authToken.expiresAt = expiresAtDate

				await tokenRepo.save(authToken)
			})
			.catch((error) => {
				console.error('Error:', error);
			})
	}
	res.locals.authToken = authToken
	next()
}