import { RentalListing, SaleListing } from '../models/listing'
import { DatabaseStorage } from '../storage/databaseStorage'

export type ScrapedPrice = {
	price: number
	unit: string
}

export type Listing = RentalListing | SaleListing

export const isRentalListing = (listing: Listing): listing is RentalListing => Object.keys(listing).includes('rent')

export const isSaleListing = (listing: Listing): listing is SaleListing => Object.keys(listing).includes('price')

type Left<T> = {
	left: T
	right?: never
}

type Right<U> = {
	left?: never
	right: U
}

export type Either<T, U> = NonNullable<Left<T> | Right<U>>

export type SaveRentalFunction = DatabaseStorage['saveRentalListings']
export type SaveSaleFunction = DatabaseStorage['saveSaleListings']

export type Coordinates = {
	lat: number
	lon: number
}
