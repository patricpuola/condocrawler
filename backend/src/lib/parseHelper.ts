import { ScrapedPrice } from '../types/scraping'

export const parsePrice = (input: string, find: string): ScrapedPrice => {
	if (!input.includes(find)) {
		throw new Error(`parsePrice failed for [${input}], couldn't find ${find}`)
	}

	const cleanInput = input.replace(/[\n\s]/g, '').trim()

	const priceMatch = cleanInput.match(/(\d+(?:[.,]\d+)?)\s*(.*)/)?.slice(1)
	if (!priceMatch) {
		throw new Error(`parsePrice unable to parse: ${cleanInput}`)
	}

	return { price: Number(priceMatch[0].replace(',', '.')), unit: priceMatch[1] }
}

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
