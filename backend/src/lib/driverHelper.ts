import { By, Locator, WebDriver, WebElement, until } from 'selenium-webdriver'
import { asyncFilter } from './generalHelpers'

export const safeFindElement = async (
	context: WebDriver | WebElement,
	locator: Locator,
	throwOnNotFound: Boolean = false,
): Promise<WebElement | null> => {
	for (let el of await context.findElements(locator)) {
		return el
	}

	if (throwOnNotFound) throw new Error(`unable to find element: ${locator.toString()}`)

	return null
}

/**
 * Clicks away the cookie prompt if found
 * @param driver
 * @param prompt
 * @param dismissButton
 * @returns Promise<boolean>
 */
export const dismissPrompt = async (
	driver: WebDriver,
	prompt: Locator,
	dismissButton: Locator,
	promptName: string = 'prompt',
	wait: number = 5000,
): Promise<boolean> => {
	try {
		await driver.wait(until.elementLocated(prompt), wait)
		const button = await safeFindElement(driver, dismissButton)
		if (!button) {
			console.error(`unable to find ${promptName}} dismiss button`)
			return false
		}
		await button.click()
		console.info(`${promptName} cleared`)
		return true
	} catch (error) {
		// No cookie prompt was displayed, or it could not be found
	}

	console.warn(`${promptName} not detected`)
	return false
}

// Quite unreliable with SPAs
export const waitForPageLoad = async (driver: WebDriver, wait: number = 5000) => {
	await driver.wait(async () => {
		const readyState = await driver.executeScript('return document.readyState')
		return readyState === 'complete'
	}, wait)
}

export const waitForElementText = async (
	driver: WebDriver,
	locator: Locator,
	regex: RegExp,
	timeout: number = 5000,
) => {
	try {
		await driver.wait(until.elementLocated(locator))
		const element = await driver.findElement(locator)
		await driver.wait(until.elementTextMatches(element, regex), timeout)
	} catch {
		throw new Error(`timeout reached waiting for ${locator.toString()}`)
	}
}

export const waitFor = async (driver: WebDriver, locator: Locator, timeout: number = 5000): Promise<void> => {
	try {
		await driver.wait(until.elementLocated(locator), timeout)
	} catch {
		throw new Error(`timeout reached waiting for ${locator.toString()}`)
	}
}

export const wait = async (timeout: number) => {
	return new Promise(resolve => setTimeout(resolve, timeout))
}

export const findButton = async (
	driver: WebDriver,
	locator: Locator,
	text: string,
	scrollTo: boolean = false,
): Promise<WebElement> => {
	const findText = text.toLowerCase()
	const buttons = await driver.findElements(locator)
	const matchingButtons = await asyncFilter(buttons, async btn =>
		(await btn.getText()).toLowerCase().includes(findText),
	)

	/*const matchingButtons = buttons.filter(async btn => {
		return (await btn.getText()).toLowerCase().includes(findText)
	})*/

	if (matchingButtons.length == 0) {
		throw new Error(`findButton() could not find ${locator.toString()} with text "${text}"`)
	}
	if (matchingButtons.length > 1) {
		console.warn(`findButton() found more than one ${locator.toString()} with text "${text}"`)
	}

	if (scrollTo) {
		const buffer = 300
		const { y } = await matchingButtons[0].getRect()
		const scrollY = y < 300 ? y : y - 300
		await driver.executeScript(`window.scrollTo(0, ${scrollY})`)
	}

	return matchingButtons[0]
}

export const findCommonClass = async (elements: WebElement[]): Promise<string> => {
	const classCountMap = new Map<string, number>()

	await Promise.all(
		elements.map(async element => {
			const classAttribute = await element.getAttribute('class')
			const classes = classAttribute.split(' ')
			classes.forEach(cls => {
				if (classCountMap.has(cls)) {
					classCountMap.set(cls, (classCountMap.get(cls) as number) + 1)
				} else {
					classCountMap.set(cls, 1)
				}
			})
		}),
	)

	return [...classCountMap.entries()].reduce(
		(acc, [cls, count]) => {
			return count > acc.count ? { cls, count } : acc
		},
		{ cls: '', count: 0 },
	).cls
}
