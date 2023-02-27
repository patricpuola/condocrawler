import { By, Key, WebDriver } from 'selenium-webdriver'
import { dismissPrompt, findButton, findCommonClass, wait, waitFor, waitForElementText } from '../lib/driverHelper'
import { getChromeDriver } from '../lib/webDriver'
import { SaleListing } from '../models/listing'
import { BaseScraper } from './baseScraper'
import { load } from 'cheerio'
import { capitalizeFirstLetter, parsePrice } from '../lib/parseHelper'
import { saveReplay } from '../lib/replay'
import { BaseStorage } from '../storage/baseStorage'

export interface EtuoviProcessParams {
	pageSource: string
	commonListingClass: string
}

export class EtuoviScraper extends BaseScraper {
	readonly site = 'etuovi.fi'
	storage: BaseStorage

	constructor(storage: BaseStorage) {
		super()
		this.storage = storage
	}

	async scrape(): Promise<void> {
		const driver = await getChromeDriver()
		await driver.get('https://www.etuovi.com/')

		await dismissPrompt(driver, By.id('almacmp-modal-layer1'), By.id('almacmp-modalConfirmBtn'), 'cookie')
		await dismissPrompt(
			driver,
			By.id('interstitialContainer'),
			By.id('interstitialCloseLink'),
			'full screen ad',
			3000,
		)

		const search = await driver.findElement(By.css('input[placeholder="Sijainti tai kohdenumero"'))
		await search.click()
		await search.sendKeys('Helsinki')
		await wait(1000)
		await search.sendKeys(Key.ENTER)
		const button = await findButton(driver, By.css('button[type="submit"]'), 'HAE')
		button.click()

		await waitFor(driver, By.id('listPagePopper'))
		const listPagePopper = await driver.findElement(By.id('listPagePopper'))
		const listItems = await listPagePopper.findElements(By.xpath('following-sibling::div'))

		const commonListingClass = await findCommonClass(listItems)

		do {
			const pageSource = await driver.getPageSource()
			try {
				const listings = await this.process({ pageSource, commonListingClass })
				this.storage.saveSaleListings(listings)
			} catch (e) {
				await saveReplay(this.constructor.name, { pageSource, commonListingClass }, e)
				throw e
			}
		} while (await this.moreResults(driver))
	}

	async process(params: EtuoviProcessParams): Promise<SaleListing[]> {
		const listings: SaleListing[] = []
		const { pageSource, commonListingClass } = params
		const $ = load(pageSource)

		$(`.${commonListingClass}`).each((_, elem) => {
			const title = $(elem).find('div h5').first().text()
			const url = $(elem).find('div a').first().attr('href') || ''
			const { streetAddress, borough, city } = this.parseAddress($(elem).find('div h4').first().text())
			const imageUrl = $(elem).find('div img').first().attr('src') || ''
			const priceText = $(elem)
				.find('h6')
				.filter((_, el) => $(el).text() === 'Hinta')
				.first()

			const priceElement = priceText !== null ? priceText.next('span') : null
			if (!priceElement || priceElement.text() === '') return

			const { price, unit } = parsePrice($(priceElement).text(), '€')
			listings.push({
				title,
				url,
				price,
				priceUnit: unit,
				imageUrl,
				streetAddress,
				city,
				postalCode: '12345',
				borough,
				lat: null,
				lon: null,
				site: this.site,
				siteUid: this.parseUid(url),
			})
		})

		return listings
	}

	async moreResults(driver: WebDriver): Promise<Boolean> {
		const next = await driver.findElement(By.id('paginationNext'))
		if ((await next.getAttribute('disabled')) === null) {
			await next.click()
			await waitForElementText(driver, By.id('searchResultCount'), /\d+/)
			return true
		}
		return false
	}

	parseAddress(addressBlob: string | undefined) {
		if (!addressBlob) return { streetAddress: '', borough: '', city: '' }
		const [streetAddress, borough, city] = addressBlob
			.split(',', 3)
			.map(s => capitalizeFirstLetter(s.trim()).replace(/\s{2,}/, ' '))
		return { streetAddress, borough, city }
	}

	parseUid(link: string | undefined): string {
		if (!link) return ''
		const nums = link.split('/')
		const id = nums.at(-1)?.match(/(\w+)\??/)
		return id && id[1] ? id[1] : ''
	}
}
