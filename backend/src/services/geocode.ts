import opencage from 'opencage-api-client'
import { Coordinates } from '../types/scraping'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { wait } from '../lib/driverHelper'
import { makeGetRequest } from '../lib/request'
import chalk from 'chalk'

export const getCoordinates = async (addressQuery: string, countryCode: string = 'fi'): Promise<Coordinates | null> => {
	return await geocodeMaps(addressQuery)
}

const geocodeMaps = async (addressQuery: string): Promise<Coordinates | null> => {
	const url = new URL('https://geocode.maps.co/search')
	url.searchParams.append('q', addressQuery)
	const result = await makeGetRequest<Array<Coordinates>>(url.toString())
	await wait(500) // poor rate-limit
	if (result.length > 0) {
		return { lat: result[0].lat, lon: result[0].lon }
	}
	return null
}

const mapboxGeocoder = async (addressQuery: string, countryCode: string): Promise<Coordinates | null> => {
	const geocoder = new MapboxGeocoder({
		accessToken: process.env.MAPBOX_API_KEY as string,
		enableEventLogging: false,
		countries: countryCode,
	})

	const proximity = geocoder.query(addressQuery).getProximity()

	//const geometry = data?.results[0]?.geometry
	//if (!geometry) return null

	return { lat: 0, lon: 0 }
}

const opencageGeocoder = async (addressQuery: string, countryCode: string): Promise<Coordinates | null> => {
	await wait(1200) // free tier max 1req/s
	const data = await opencage.geocode({
		q: addressQuery,
		countrycode: countryCode,
		no_annotations: 1,
		no_record: 1,
		roadinfo: 0,
		limit: 1,
		pretty: 1,
	})

	const geometry = data?.results[0]?.geometry
	if (!geometry) return null

	console.log(`${addressQuery} returned ${geometry.lat}, ${geometry.lon}`)
	return { lat: geometry.lat, lon: geometry.lng }
}
