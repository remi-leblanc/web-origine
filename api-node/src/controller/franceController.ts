import { AppDataSource } from "../data-source";
import * as puppeteer from 'puppeteer';
import axios from 'axios';

import { Company } from "../entity/Company"
import { Address } from "../entity/Address"
import { Person } from "../entity/Person"
import { Token } from "../entity/Token"
import { cp } from "fs"

const companyRepo = AppDataSource.getRepository(Company)
const addressRepo = AppDataSource.getRepository(Address)
const personRepo = AppDataSource.getRepository(Person)

const LEGAL_LINK_TEXTCONTENT_SCOPE = [
	'Mentions légales',
	'Infos légales',
	'CGU'
]

var authToken: Token;
var websiteHost: string;
var baseUrl: string;

export const companyCheck = async (req, res) => {
	authToken = res.locals.authToken

	var response = {}

	//We check if there is an url parameter in the request body
	const tabUrl = req.body.url
	if (!tabUrl) {
		response = {
			code: 400,
			message: 'You must provide an URL parameter'
		}
		return res.json(response)
	}

	websiteHost = (new URL(tabUrl)).hostname;

	//We check if we already have a company with this website
	let existingCompany = await companyRepo.findOne({
		where: {
			website: websiteHost
		},
		relations: {
			addresses: true,
			owners: true
		}
	})
	if (existingCompany) {
		response = {
			code: 200,
			data: formatResponseData(existingCompany),
			url: websiteHost
		}
		return res.json(response)
	}

	//No existing company, so we'll start to browse the website

	baseUrl = "https://" + websiteHost + "/"

	//Open browser and wait the footer to load
	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.goto(baseUrl)
	try {
		await page.waitForSelector('footer', { timeout: 3000 })
	} catch {

	}

	//Try to find the SIREN on the homepage, usually in the footer
	let siren = await findSirenInPage(page)
	if (!siren) {
		//No SIREN on the homepage/footer, trying to find legal pages links
		try {
			await goToLegalPage(page)
		} catch {
			response = {
				code: 404,
				message: 'Impossible to find a legal page',
				url: websiteHost
			}
			await browser.close();
			return res.json(response)
		}

		//Try to find a SIREN in the legal page
		siren = await findSirenInPage(page)
		if (!siren) {
			response = {
				code: 404,
				message: 'SIREN not found',
				url: websiteHost
			}
			await browser.close();
			return res.json(response)
		}
	}

	//We found a SIREN! So we call the Insee API to get the company's infos
	const inseeResult = await callInseeApi(siren)
	if (!inseeResult) {
		response = {
			code: 500,
			message: 'Error while fetching Insee API',
			url: websiteHost
		}
		await browser.close();
		return res.json(response)
	}

	//We got the infos from the API, we persist the data to the database

	const createdAt = new Date()

	let company = await createCompany(inseeResult, createdAt)
	if (company == false) {
		await browser.close();
		throw new Error('Incomplete company data')
	}
	let address = await createAddress(inseeResult, createdAt)
	if (address !== false) {
		await addressRepo.save(address)
		company.addresses.push(address)
	}
	let person = await createPerson(inseeResult, createdAt)
	if (person !== false) {
		await personRepo.save(person)
		company.owners.push(person)
	}
	await companyRepo.save(company)

	response = {
		code: 200,
		data: formatResponseData(company)
	}
	await browser.close();
	return res.json(response)
}

async function goToLegalPage(page: puppeteer.Page) {
	const links = await page.$$('a, span')
	for (const name of LEGAL_LINK_TEXTCONTENT_SCOPE) {
		for (const link of links.reverse()) {
			let text = await link.evaluate(el => el.textContent)
			if (text.trim() === name) {
				await page.evaluate((el: HTMLElement) => {
					el.removeAttribute('target')
					el.click()
				}, link)
				await page.waitForNavigation({ waitUntil: 'networkidle0' })
				return true
			}
		}
	}
	throw new Error("Legal page not found")
}

async function findSirenInPage(page: puppeteer.Page) {
	const hostParts = websiteHost.split('.')
	let text = await page.$eval('body', (el: HTMLElement) => {
		return el.innerText
	})
	let words = text.split(/\n/)

	let sirenOptions = []
	let sirenHint = 0
	for (const word of words) {

		// Check full host: (www.)example.com
		if (word.toLowerCase().includes(websiteHost)) {
			sirenHint++
		}

		// Check host name: example
		if (word.toLowerCase().includes(hostParts[hostParts.length - 2])) {
			sirenHint++
		}

		// Check main host without spaces: thisisanexample(.com)
		if (word.toLowerCase().replace(/ /g, '').includes(hostParts[hostParts.length - 2])) {
			sirenHint++
		}

		const regex = /(?<!(FR)|(FR )|\d|(\d ))\d{3} ?\d{3} ?\d{3}(?!€|( ?euros?))/gi
		let matches = regex.exec(word)

		if (matches) {
			sirenOptions.push({
				siren: matches[0].replace(/ /g, ''),
				hint: sirenHint
			})
			sirenHint = 0
		}
	}

	if (!sirenOptions.length) {
		return false
	}
	sirenOptions.sort((a, b) => b.hint - a.hint)
	return sirenOptions[0].siren
}

function formatResponseData(company: Company) {
	let responseData = {
		company: {
			siren: company.siren,
			siret: company.siret,
			name: company.name,
			website: company.website
		},
	}
	if (company.addresses.length) {
		let address = company.addresses[0]
		responseData['address'] = {
			number: address.number,
			streetType: address.streetType,
			streetName: address.streetName,
			city: address.city,
			postalCode: address.postalCode,
			regionCode: address.regionCode,
		}
	}
	if (company.owners.length) {
		let owner = company.owners[0]
		responseData['owner'] = {
			firstName: owner.firstName,
			lastName: owner.lastName
		}
	}
	return responseData
}
async function callInseeApi(siren: string) {
	return await axios({
		method: 'get',
		url: 'https://api.insee.fr/entreprises/sirene/V3.11/siret',
		headers: {
			[authToken.headerKey]: authToken.headerValue,
		},
		params: {
			q: 'siren:' + siren + ' AND etablissementSiege:true'
		},
	})
		.then((response) => {
			return response.data
		})
		.catch((error) => {

		})
}

async function callGeoApi(postalCode: string) {
	return await axios({
		method: 'get',
		url: 'https://geo.api.gouv.fr/communes',
		params: {
			codePostal: postalCode
		}
	})
		.then((response) => {
			return response.data
		})
		.catch((error) => {

		})
}

async function createCompany(inseeResult, createdAt: Date) {
	let shop = inseeResult.etablissements[0]

	let companyName = shop.uniteLegale.denominationUniteLegale
	if (!companyName) {
		companyName = shop.periodesEtablissement[0].enseigne1Etablissement
	}

	let newCompany = new Company()
	newCompany.siren = shop.siren
	newCompany.siret = shop.siret
	newCompany.name = companyName
	newCompany.country = 'FR'
	newCompany.website = websiteHost
	newCompany.createdAt = createdAt
	newCompany.updatedAt = createdAt
	newCompany.addresses = []
	newCompany.owners = []

	if (containsNull([newCompany.siren, newCompany.siret, newCompany.name, newCompany.country, newCompany.website])) {
		return false
	}

	let existingCompany = await companyRepo.findOneBy({
		siren: newCompany.siren,
		siret: newCompany.siret,
		name: newCompany.name,
		country: newCompany.country,
		website: newCompany.website,
	})
	if (existingCompany) {
		return existingCompany
	}

	await companyRepo.save(newCompany)
	return newCompany
}

async function createAddress(inseeResult, createdAt: Date) {
	let shop = inseeResult.etablissements[0]
	let shopAddress = shop.adresseEtablissement

	let newAddress = new Address()
	newAddress.number = shopAddress.numeroVoieEtablissement
	newAddress.streetName = shopAddress.libelleVoieEtablissement
	newAddress.streetType = shopAddress.typeVoieEtablissement
	newAddress.city = shopAddress.libelleCommuneEtablissement
	newAddress.postalCode = shopAddress.codePostalEtablissement
	newAddress.createdAt = createdAt
	newAddress.companies = []

	let cityData = await callGeoApi(newAddress.postalCode)
	if (cityData) {
		newAddress.regionCode = cityData[0].codeRegion
	}

	if (containsNull([newAddress.streetName, newAddress.city, newAddress.postalCode])) {
		return false
	}

	let existingAddress = await addressRepo.findOneBy({
		number: newAddress.number,
		streetName: newAddress.streetName,
		streetType: newAddress.streetType,
		city: newAddress.city,
		postalCode: newAddress.postalCode
	})
	if (existingAddress) {
		return existingAddress
	}

	await addressRepo.save(newAddress)
	return newAddress
}

async function createPerson(inseeResult, createdAt: Date) {
	let shop = inseeResult.etablissements[0]

	let ownerFirstName = shop.uniteLegale.prenomUsuelUniteLegale
	if (!ownerFirstName) {
		ownerFirstName = shop.uniteLegale.prenom1UniteLegale
	}

	let ownerLastName = shop.uniteLegale.nomUsageUniteLegale
	if (!ownerLastName) {
		ownerLastName = shop.uniteLegale.nomUniteLegale
	}

	let newPerson = new Person()
	newPerson.firstName = ownerFirstName
	newPerson.lastName = ownerLastName
	newPerson.createdAt = createdAt
	newPerson.updatedAt = createdAt
	newPerson.companies = []

	if (containsNull([newPerson.firstName, newPerson.lastName])) {
		return false
	}

	let existingPerson = await personRepo.findOneBy({
		firstName: newPerson.firstName,
		lastName: newPerson.lastName,
	})
	if (existingPerson) {
		return existingPerson
	}

	await personRepo.save(newPerson)
	return newPerson
}

function containsNull(array: any[]) {
	for (const val of array) {
		if (val === null) {
			return true
		}
	}
	return false
}

