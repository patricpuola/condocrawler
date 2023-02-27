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
	borough: string
	lat: number | null
	lon: number | null
	site: string
	siteUid: string
	dateUpdated?: string
	dateCreated?: string
	// add other properties as needed
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
	borough: string
	lat: number | null
	lon: number | null
	site: string
	siteUid: string
	dateUpdated?: string
	dateCreated?: string
	// add other properties as needed
}
