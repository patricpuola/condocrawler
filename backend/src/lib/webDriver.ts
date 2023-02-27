import { Builder, Locator, WebDriver, WebElement } from 'selenium-webdriver'
import { Options } from 'selenium-webdriver/chrome'

export const getChromeDriver = async () => {
	const chromeOptions: Options = new Options()
	chromeOptions.set('headless', false)
	return await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build()
}
