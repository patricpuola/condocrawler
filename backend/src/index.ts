import chalk from 'chalk'
import { startApi } from './api'
import { runReplay } from './lib/replay'
import { EtuoviScraper } from './scraper/etuoviScraper'
import { VuokraoviScraper } from './scraper/vuokraoviScraper'
import { getCoordinates } from './services/geocode'
import yargs from 'yargs'
import { getProgressBar } from './lib/cliHelper'
import { DatabaseStorage } from './storage/databaseStorage'
import { Listing } from './types/scraping'
import * as municipalityBorders from './geojson/municipalityBorders.json'
import * as districts from './geojson/districts.json'

const run = async () => {
	yargs.option('replay', {
		type: 'boolean',
		description: 'run last error source',
	})

	yargs.option('api', {
		type: 'boolean',
		description: 'run api',
	})

	yargs.option('scrape', {
		type: 'boolean',
		description: 'run scrapers',
	})

	yargs.option('geocode', {
		type: 'boolean',
		description: 'run geocoder',
	})

	yargs.option('district', {
		type: 'boolean',
		description: 'recalculate which district a listing belongs to',
	})

	yargs.option('setup', {
		type: 'boolean',
		description: 'initial setup, fill database',
	})

	const options = await yargs.argv

	if (options.api) startApi()
	if (options.replay) await replay()
	if (options.scrape) await scrape()
	if (options.geocode) await geocode()
	if (options.district) await district()
	if (options.setup) await setup()

	if (!options.api) process.exit(0)
}

const replay = async () => await runReplay()

const scrape = async () => {
	const storage = new DatabaseStorage()
	await storage.connect()
	await Promise.all([new VuokraoviScraper(storage).scrape(), new EtuoviScraper(storage).scrape()])
}

const geocode = async () => {
	const storage = new DatabaseStorage()
	await storage.connect()
	const addresses = await Promise.all([
		storage.getRentalAddressesWithoutCoordinates(),
		storage.getSaleAddressesWithoutCoordinates(),
	])

	const rentalBar = getProgressBar('Rental geocodes', chalk.green)
	rentalBar.start(addresses[0].length, 0, { entry: '' })
	for (const rentalListing of addresses[0]) {
		rentalBar.increment({ entry: rentalListing.streetAddress })
		const coords = await getCoordinates(`${rentalListing.streetAddress}, ${rentalListing.city}, Finland`)
		if (coords) {
			await storage.saveRentalCoordinates({ ...rentalListing, location: { x: coords.lon, y: coords.lat } })
		}
	}
	rentalBar.stop()

	const saleBar = getProgressBar('Sale geocodes', chalk.blue)
	saleBar.start(addresses[1].length, 0, { entry: '' })
	for (const saleListing of addresses[1]) {
		saleBar.increment({ entry: saleListing.streetAddress })
		const coords = await getCoordinates(`${saleListing.streetAddress}, ${saleListing.city}, Finland`)
		if (coords) {
			await storage.saveSaleCoordinates({ ...saleListing, location: { x: coords.lon, y: coords.lat } })
		}
	}
	saleBar.stop()
}

const district = async () => {
	const storage = new DatabaseStorage()
	await storage.connect()

	const [rentalListings, saleListings] = await Promise.all([
		storage.getRentalListings(null),
		storage.getSaleListings(null),
	])

	if (rentalListings.length === 0 && saleListings.length === 0) {
		console.log(chalk.red('no listings found in database'))
		return
	}

	const allListings = (rentalListings as Listing[]).concat(saleListings as Listing[])

	const districtBar = getProgressBar('Districts', chalk.magenta)
	districtBar.start(allListings.length, 0, { entry: '' })

	for (const listing of allListings) {
		districtBar.increment({ entry: listing.streetAddress })
		if (!listing.location) continue
		const districts = await storage.getDistrictsByPoint(listing.location.x, listing.location.y)
		if (districts.length === 0) continue
		if (districts.length === 1) {
			await storage.updateListingDistrict(listing, districts[0].id)
		} else {
			const districtWithName = districts.find(district => !!district.name?.length)
			if (districtWithName) {
				await storage.updateListingDistrict(listing, districtWithName.id)
			}
		}
	}
	districtBar.stop()

	return
}

const setup = async () => {
	const storage = new DatabaseStorage()
	await storage.connect()

	const municipalityBar = getProgressBar('Municipality', chalk.green)
	municipalityBar.start(municipalityBorders.features.length, 0, { entry: '' })
	for (const feat of municipalityBorders.features) {
		const { nimi, kunta, tietopalvelu_id } = feat.properties
		municipalityBar.increment({ entry: nimi || '' })
		await storage.saveMunicipality(nimi, tietopalvelu_id.toString(), kunta, feat.geometry)
	}
	municipalityBar.stop()

	const districtBar = getProgressBar('District', chalk.blue)
	districtBar.start((districts as any).features.length, 0, { entry: '' })
	for (const feat of (districts as any).features) {
		const { nimi, kokotun, tietopalvelu_id } = feat.properties
		districtBar.increment({ entry: nimi || '' })
		await storage.saveDistrict(nimi, tietopalvelu_id.toString(), kokotun, feat.geometry)
	}
	districtBar.stop()
}

run()
