import chalk from 'chalk'
import { startApi } from './api'
import { runReplay } from './lib/replay'
import { EtuoviScraper } from './scraper/etuoviScraper'
import { VuokraoviScraper } from './scraper/vuokraoviScraper'
import { getCoordinates } from './services/geocode'
import { DevDatabaseStorage } from './storage/devDatabaseStorage'
import yargs from 'yargs'
import { getProgressBar } from './lib/cliHelper'

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

	const options = await yargs.argv

	if (options.replay) replay()
	if (options.api) await startApi()
	if (options.scrape) scrape()
	if (options.geocode) geocode()
}

const replay = async () => await runReplay()

const scrape = async () => {
	const storage = new DevDatabaseStorage()
	await Promise.all([new VuokraoviScraper(storage).scrape(), new EtuoviScraper(storage).scrape()])
}

const geocode = async () => {
	const storage = new DevDatabaseStorage()
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
			await storage.saveRentalCoordinates({ ...rentalListing, ...coords })
		}
	}
	rentalBar.stop()

	const saleBar = getProgressBar('Sale geocodes', chalk.blue)
	saleBar.start(addresses[1].length, 0, { entry: '' })
	for (const saleListing of addresses[1]) {
		saleBar.increment({ entry: saleListing.streetAddress })
		const coords = await getCoordinates(`${saleListing.streetAddress}, ${saleListing.city}, Finland`)
		if (coords) {
			await storage.saveSaleCoordinates({ ...saleListing, ...coords })
		}
	}
	saleBar.stop()
}

run()
