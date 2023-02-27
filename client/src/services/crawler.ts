// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RentalListing, SaleListing } from '../types/Listing'
import { GeoJSONSourceRaw } from 'mapbox-gl'

// Define a service using a base URL and expected endpoints
export const crawlerApi = createApi({
	reducerPath: 'crawlerApi',
	baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/' }),
	endpoints: builder => ({
		getRentalListings: builder.query<RentalListing[], void>({
			query: () => 'listings/rental?limit=100',
		}),
		getSaleListings: builder.query<SaleListing[], void>({
			query: () => 'listings/sale?limit=100',
		}),
	}),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetRentalListingsQuery, useGetSaleListingsQuery } = crawlerApi
