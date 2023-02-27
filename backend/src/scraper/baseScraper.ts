import { Listing } from '../types/scraping'

export abstract class BaseScraper {
	abstract readonly site: string
	abstract process(params: {}): Promise<Listing[]>
}
