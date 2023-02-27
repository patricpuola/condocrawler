import chalk from 'chalk'
import { EtuoviProcessParams, EtuoviScraper } from '../scraper/etuoviScraper'
import { VuokraoviProcessParams, VuokraoviScraper } from '../scraper/vuokraoviScraper'
import { tmpDelete, tmpLoad, tmpSave } from './tmpFile'
import { MockStorage } from '../storage/mockStorage'

const LAST_DEBUG_FILE = 'lastCrash.json'

const ScraperClasses = {
	EtuoviScraper,
	VuokraoviScraper,
}

const catchString = (e: unknown): string => {
	let error: string = ''
	if (e instanceof Error) {
		error = e.message
	} else if (typeof e === 'string') {
		error = e
	}
	return error
}

export const saveReplay = async (
	className: string,
	processParams: EtuoviProcessParams | VuokraoviProcessParams,
	catchedError: unknown,
) => {
	await tmpSave(
		LAST_DEBUG_FILE,
		JSON.stringify({ scraper: className, processParams, error: catchString(catchedError) }, undefined, 5),
	)
	console.log(chalk.yellow(`Replay saved to ${LAST_DEBUG_FILE}`))
}

export const runReplay = async () => {
	console.log(chalk.green('REPLAY'))
	const data = await tmpLoad(LAST_DEBUG_FILE)
	if (!data) throw new Error('No crash data found')
	const debug = JSON.parse(data)
	try {
		const scraperName = debug.scraper as keyof typeof ScraperClasses
		const storage = new MockStorage()
		const scraper = new ScraperClasses[scraperName](storage)
		console.log(chalk.green(`running ${scraperName}.process()`))
		await scraper.process(debug.processParams)
	} catch (error) {
		const errorString = catchString(error)
		console.log(chalk.red(errorString))
		if (errorString === debug.error) {
			console.log(chalk.grey('no change'))
		}
	}
}

export const deleteReplay = async () => await tmpDelete(LAST_DEBUG_FILE)
