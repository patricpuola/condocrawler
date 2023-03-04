// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import { RentalListing, SaleListing } from '../types/Listing'

// Define a service using a base URL and expected endpoints
export const crawlerApi = createApi({
	reducerPath: 'crawlerApi',
	baseQuery: retry(fetchBaseQuery({ baseUrl: 'http://localhost:3000/' }), { maxRetries: 2 }),
	endpoints: builder => ({
		getRentalListings: builder.query<RentalListing[], void>({
			query: () => 'listings/rental?limit=100',
		}),
		getSaleListings: builder.query<SaleListing[], void>({
			query: () => 'listings/sale?limit=100',
		}),
		getDistricts: builder.query<GeoJSON.FeatureCollection, void>({
			query: () => 'districts',
		}),
		getMunicipalities: builder.query<GeoJSON.FeatureCollection, void>({
			query: () => 'municipalities',
		}),
	}),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetRentalListingsQuery, useGetSaleListingsQuery, useGetDistrictsQuery, useGetMunicipalitiesQuery } =
	crawlerApi
