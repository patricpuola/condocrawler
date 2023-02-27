import { RentalListing, SaleListing } from '../models/listing'

interface ListingRow {
	id: number
	title: string
	url: string
	image_url: string
	street_address: string
	city: string
	postal_code: string
	borough: string
	site: string
	site_uid: string
	date_updated: string
	date_created: string
	lat: number
	lon: number
}

interface RentalListingRow extends ListingRow {
	rent: number
	rent_unit: string
}

interface SaleListingRow extends ListingRow {
	price: number
	price_unit: string
}

export const rentalMapper = ({
	id,
	title,
	url,
	rent,
	rent_unit,
	image_url,
	street_address,
	city,
	postal_code,
	borough,
	site,
	site_uid,
	date_updated,
	date_created,
	lat,
	lon,
}: RentalListingRow): RentalListing => ({
	id,
	title,
	url,
	rent,
	rentUnit: rent_unit,
	imageUrl: image_url,
	streetAddress: street_address,
	city,
	postalCode: postal_code,
	borough,
	site,
	siteUid: site_uid,
	lat,
	lon,
	dateCreated: date_created,
	dateUpdated: date_updated,
})

export const saleMapper = ({
	id,
	title,
	url,
	price,
	price_unit,
	image_url,
	street_address,
	city,
	postal_code,
	borough,
	site,
	site_uid,
	date_updated,
	date_created,
	lat,
	lon,
}: SaleListingRow): SaleListing => ({
	id,
	title,
	url,
	price,
	priceUnit: price_unit,
	imageUrl: image_url,
	streetAddress: street_address,
	city,
	postalCode: postal_code,
	borough,
	site,
	siteUid: site_uid,
	lat,
	lon,
	dateCreated: date_created,
	dateUpdated: date_updated,
})
