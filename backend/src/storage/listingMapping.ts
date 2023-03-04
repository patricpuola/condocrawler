import { RentalListing, SaleListing } from '../models/listing'

interface ListingRow {
	id: number
	title: string
	url: string
	image_url: string
	street_address: string
	city: string
	postal_code: string
	district: string
	site: string
	site_uid: string
	district_id: number | undefined
	date_updated: string
	date_created: string
	location: { x: number; y: number }
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
	district,
	site,
	site_uid,
	date_updated,
	date_created,
	location,
	district_id,
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
	district,
	site,
	siteUid: site_uid,
	location,
	districtId: district_id,
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
	district,
	site,
	site_uid,
	date_updated,
	date_created,
	location,
	district_id,
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
	district,
	site,
	siteUid: site_uid,
	location,
	districtId: district_id,
	dateCreated: date_created,
	dateUpdated: date_updated,
})
