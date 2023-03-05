export const isRentalListing = (listing: Listing): listing is RentalListing => Object.keys(listing).includes('rent')

export const isSaleListing = (listing: Listing): listing is SaleListing => Object.keys(listing).includes('price')

export interface RentalListing {
	id?: number
	title: string
	url: string
	rent: number
	rentUnit: string
	imageUrl: string
	streetAddress: string
	city: string
	postalCode: string
	district: string
	location: { x: number; y: number }
	site: string
	siteUid: string
	districtId: number
	dateUpdated?: string
	dateCreated?: string
}

export interface SaleListing {
	id?: number
	title: string
	url: string
	price: number
	priceUnit: string
	imageUrl: string
	streetAddress: string
	city: string
	postalCode: string
	district: string
	location: { x: number; y: number }
	site: string
	siteUid: string
	districtId: number
	dateUpdated?: string
	dateCreated?: string
}

export type Listing = RentalListing | SaleListing
