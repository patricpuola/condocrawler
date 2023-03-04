import { load } from 'cheerio'
import { RentalListing } from '../models/listing'
import { BaseScraper } from './baseScraper'
import { getChromeDriver } from '../lib/webDriver'
import { By, Key, WebDriver, WebElement } from 'selenium-webdriver'
import { dismissPrompt, wait, waitFor } from '../lib/driverHelper'
import { capitalizeFirstLetter, parsePrice } from '../lib/parseHelper'
import { saveReplay } from '../lib/replay'
import { BaseStorage } from '../storage/baseStorage'

export interface VuokraoviProcessParams {
	pageSource: string
}

export class VuokraoviScraper extends BaseScraper {
	readonly site = 'vuokraovi.com'
	storage: BaseStorage

	constructor(storage: BaseStorage) {
		super()
		this.storage = storage
	}

	async scrape(): Promise<void> {
		const driver = await getChromeDriver()
		await driver.get('https://www.vuokraovi.com/')

		await dismissPrompt(driver, By.id('almacmp-modal-layer1'), By.id('almacmp-modalConfirmBtn'), 'cookie')
		await dismissPrompt(driver, By.id('interstitialContainer'), By.id('interstitialCloseLink'), 'full screen ad')

		const search = await driver.findElement(By.id('inputLocationOrRentalUniqueNo'))
		search.click
		await search.sendKeys('Helsinki')
		await wait(1000)
		await search.sendKeys(Key.ENTER)
		const searchButtonDiv = await driver.findElement(By.className('row-quick-search-btn'))
		const button = await searchButtonDiv.findElement(By.css('button'))
		await button.click()

		do {
			await waitFor(driver, By.name('listorder'))

			const pageSource = await driver.getPageSource()
			try {
				const listings = await this.process({ pageSource })
				this.storage.saveRentalListings(listings)
			} catch (e) {
				await saveReplay(this.constructor.name, { pageSource }, e)
				throw e
			}
		} while (await this.moreResults(driver))

		await driver.close()
		return
	}

	async process(params: VuokraoviProcessParams): Promise<RentalListing[]> {
		const listings: RentalListing[] = []
		const { pageSource } = params
		const $ = load(pageSource)

		// Extract data for each listing on the page using cheerio and add it to the listings array
		$('.list-item-container').each((_, elem) => {
			const details = $(elem)
				.children('div')
				.first()
				.children('a')
				.first()
				.children('div')
				.eq(1)
				.children('ul')
				.first()
				.children()
			const title = capitalizeFirstLetter(details.slice(0, 2).text().trim().replace(/\n+/g, ' '))
			const priceElement = details.eq(3)
			if (!priceElement || priceElement.text() === '') return
			const { price, unit } = parsePrice(priceElement.text(), '€')
			const image = $(elem)
				.children('div')
				.first()
				.children('a')
				.first()
				.children('div')
				.first()
				.children('img')
				.first()
			const imageUrl = image.attr('src') ?? ''
			const { streetAddress, district, city } = this.parseAddress(image.attr('alt'))
			const siteUid = this.parseUid($(elem).find('.list-item-link').attr('href'))

			listings.push({
				title,
				url: '',
				rent: price,
				rentUnit: unit,
				imageUrl,
				streetAddress,
				district,
				city,
				site: this.site,
				siteUid,
				postalCode: '12345',
			})
		})

		return listings
	}

	async moreResults(driver: WebDriver): Promise<Boolean> {
		const pageLinks = await driver.findElements(By.css('.pagination a'))
		if (pageLinks.length === 0) return false
		const next = pageLinks.at(-1) as WebElement
		if (!(await next.getAttribute('href')).endsWith('#')) {
			try {
				await next.click()
			} catch (e) {
				await dismissPrompt(driver, By.css('.modal-dialog'), By.css('button.close'), 'random modal', 500)
				await wait(500)
				await next.click()
			}
			return true
		}
		return false
	}

	parseAddress(addressBlob: string | undefined) {
		if (!addressBlob) return { streetAddress: '', district: '', city: '' }
		const [streetAddress, district, city] = addressBlob
			.split(',', 3)
			.map(s => capitalizeFirstLetter(s.trim().replace(/\s{2,}/, ' ')))
		return { streetAddress, district, city }
	}

	parseUid(link: string | undefined): string {
		if (!link) return ''
		const nums = link.split('/')
		const id = nums.at(-1)?.match(/\d+/)
		return id ? id[0] : ''
	}
}
