import { FeatureCollection } from 'geojson'
import { Listing, RentalListing, SaleListing, isRentalListing } from '../types/Listing'
import { GeoJSONSourceRaw } from 'mapbox-gl'
import { PriceDataByDistrict } from '../types/Statistics'

const getMedian = (...numbers: number[]): number => {
	numbers.sort()
	if (numbers.length % 2 == 1) {
		return numbers[Math.floor(numbers.length / 2)]
	}

	return (numbers[numbers.length / 2 - 1] + numbers[numbers.length / 2]) / 2
}

export const listingsToFeatureCollection = (listings: Listing[]): FeatureCollection => {
	return {
		type: 'FeatureCollection',
		features: listings.map(({ id, title, city, district, streetAddress, location }) => {
			return {
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [location.x, location.y],
				},
				properties: {
					title,
					city,
					district,
					streetAddress,
				},
				id,
			}
		}),
	}
}

export const listingsToGeoJSON = (listings: Listing[]): GeoJSONSourceRaw => {
	return {
		type: 'geojson',
		data: listingsToFeatureCollection(listings),
	}
}

export const getStatistics = (listings: Listing[]): PriceDataByDistrict => {
	const statistics: PriceDataByDistrict = {
		count: 0,
		high: 0,
		low: 0,
		median: 0,
		highPerSquareMeter: 0,
		lowPerSquareMeter: 0,
		medianPerSquareMeter: 0,
		districts: new Map(),
	}
	const allPrices: number[] = []
	const districtPrices: Map<number, number[]> = new Map()
	if (isRentalListing(listings[0])) {
		for (const { rent, districtId } of listings as RentalListing[]) {
			if (!rent) continue
			allPrices.push(rent)
			if (districtPrices.has(districtId)) {
				districtPrices.set(districtId, [...(districtPrices.get(districtId) || []), rent])
			} else {
				districtPrices.set(districtId, [rent])
			}
		}
	} else {
		for (const { price, districtId } of listings as SaleListing[]) {
			if (!price) continue
			allPrices.push(price)
			if (districtPrices.has(districtId)) {
				districtPrices.set(districtId, [...(districtPrices.get(districtId) || []), price])
			} else {
				districtPrices.set(districtId, [price])
			}
		}
	}

	statistics.count = allPrices.length
	statistics.high = Math.max(...allPrices)
	statistics.low = Math.min(...allPrices)
	statistics.median = getMedian(...allPrices)
	for (const [districtId, prices] of districtPrices.entries()) {
		statistics.districts.set(districtId, {
			count: prices.length,
			high: Math.max(...prices),
			low: Math.min(...prices),
			median: getMedian(...prices),
			highPerSquareMeter: 0,
			lowPerSquareMeter: 0,
			medianPerSquareMeter: 0,
		})
	}

	return statistics
}

export const colorDistricts = (
	districts: GeoJSON.FeatureCollection,
	saleStatistics: PriceDataByDistrict,
	rentalStatistics: PriceDataByDistrict,
): GeoJSON.FeatureCollection => {
	const rentalPriceRange = rentalStatistics.high - rentalStatistics.low
	const salePriceRange = saleStatistics.high - saleStatistics.low

	const getColorProps = (districtId: number) => {
		let rentalColor = 'transparent'
		let saleColor = 'transparent'

		if (rentalStatistics.districts.has(districtId)) {
			const rentalPercentage =
				(rentalStatistics.districts.get(districtId)?.median || 0 - rentalStatistics.low) / rentalPriceRange
			const rentalHue = Math.floor(480 - rentalPercentage * 240)
			rentalColor = `hsl(${rentalHue}, 100%, 50%)`
		}

		if (saleStatistics.districts.has(districtId)) {
			const salePercentage =
				(saleStatistics.districts.get(districtId)?.median || 0 - saleStatistics.low) / salePriceRange
			const saleHue = Math.floor(480 - salePercentage * 240)
			saleColor = `hsl(${saleHue}, 100%, 50%)`
		}

		return { rentalColor, saleColor }
	}

	// properties is readonly, so we create a new object
	return {
		...districts,
		features: districts.features.map(feature =>
			typeof feature.id === 'number'
				? { ...feature, properties: { ...feature.properties, ...getColorProps(feature.id) } }
				: feature,
		),
	}
}
