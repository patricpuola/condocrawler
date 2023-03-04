import { FeatureCollection } from 'geojson'
import { Listing } from '../types/Listing'
import { GeoJSONSource, GeoJSONSourceRaw } from 'mapbox-gl'

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
