import * as sqlite3 from 'sqlite3'
import { RentalListing, SaleListing } from '../models/listing'
import { BaseStorage } from './baseStorage'
import { rentalMapper, saleMapper } from './listingMapping'

const DEFAULT_LISTING_LIMIT = 30
export class DevDatabaseStorage extends BaseStorage {
	db: sqlite3.Database

	constructor() {
		super()
		this.db = new sqlite3.Database('./tmp/dev.db')
	}

	saveDiff<T extends RentalListing | SaleListing>(newListing: T, oldListing: T): Boolean {
		const changes = {} as Record<keyof T, [any, any]>
		for (const key in newListing) {
			const listingKey = key as keyof T
			if (oldListing[listingKey] !== newListing[listingKey]) {
				changes[listingKey] = [oldListing[listingKey], newListing[listingKey]]
			}
		}

		if (Object.keys(changes).length === 0) {
			return false
		}

		const insertHistory = this.db.prepare(
			'INSERT INTO listings_history (property, old_value, new_value, site, site_uid) VALUES (?, ?, ?, ?, ?)',
		)

		for (const prop in changes) {
			const typedProp = prop as keyof T
			insertHistory.run(prop, oldListing[typedProp], newListing[typedProp], oldListing.site, oldListing.siteUid)
		}

		return true
	}

	async saveRentalListings(listings: RentalListing[]): Promise<void> {
		const insert = this.db.prepare(
			'INSERT INTO rental_listings (title, url, rent, rent_unit, image_url, street_address, city, postal_code, borough, site, site_uid) VALUES (?, ?, ? ,?, ?, ?, ? ,? ,?, ?, ?)',
		)

		const update = this.db.prepare(
			`UPDATE rental_listings SET title = ?, url = ?, rent = ?, rent_unit = ?, image_url = ?, street_address = ?, city = ?, postal_code = ?, borough = ?, date_updated = DateTime('now') WHERE site = ? AND site_uid = ?`,
		)

		listings.map(i => {
			console.log('processing: ', i)
			this.db.get(
				'SELECT * FROM rental_listings WHERE site = ? AND site_uid = ? LIMIT 1',
				[i.site, i.siteUid],
				(_, res) => {
					if (!res) {
						insert.run(
							i.title,
							i.url,
							i.rent,
							i.rentUnit,
							i.imageUrl,
							i.streetAddress,
							i.city,
							i.postalCode,
							i.borough,
							i.site,
							i.siteUid,
						)
					} else {
						const oldListing: RentalListing = {
							title: res.title,
							url: res.url,
							rent: res.rent_per_month,
							rentUnit: res.rent_unit,
							imageUrl: res.image_url,
							streetAddress: res.street_address,
							city: res.city,
							postalCode: res.postal_code,
							borough: res.borough,
							lat: res.lat,
							lon: res.lon,
							site: res.site,
							siteUid: res.site_uid,
						}
						if (this.saveDiff(i, oldListing)) {
							update.run(
								i.title,
								i.url,
								i.rent,
								i.rentUnit,
								i.imageUrl,
								i.streetAddress,
								i.city,
								i.postalCode,
								i.borough,
								i.site,
								i.siteUid,
							)
						}
					}
				},
			)
		})
	}

	async saveSaleListings(listings: SaleListing[]): Promise<void> {
		const insert = this.db.prepare(
			'INSERT INTO sale_listings (title, url, price, price_unit, image_url, street_address, city, postal_code, borough, site, site_uid) VALUES (?, ?, ? ,?, ?, ?, ? ,? ,?, ?, ?)',
		)

		const update = this.db.prepare(
			`UPDATE sale_listings SET title = ?, url = ?, price = ?, price_unit = ?, image_url = ?, street_address = ?, city = ?, postal_code = ?, borough = ?, date_updated = DateTime('now') WHERE site = ? AND site_uid = ?`,
		)

		listings.map(i => {
			console.log('processing: ', i)
			this.db.get(
				'SELECT * FROM sale_listings WHERE site = ? AND site_uid = ? LIMIT 1',
				[i.site, i.siteUid],
				(_, res) => {
					if (!res) {
						insert.run(
							i.title,
							i.url,
							i.price,
							i.priceUnit,
							i.imageUrl,
							i.streetAddress,
							i.city,
							i.postalCode,
							i.borough,
							i.site,
							i.siteUid,
						)
					} else {
						const oldListing: SaleListing = {
							title: res.title,
							url: res.url,
							price: res.price,
							priceUnit: res.price_unit,
							imageUrl: res.image_url,
							streetAddress: res.street_address,
							city: res.city,
							postalCode: res.postal_code,
							borough: res.borough,
							lat: res.lat,
							lon: res.lon,
							site: res.site,
							siteUid: res.site_uid,
						}
						if (this.saveDiff(i, oldListing)) {
							update.run(
								i.title,
								i.url,
								i.price,
								i.priceUnit,
								i.imageUrl,
								i.streetAddress,
								i.city,
								i.postalCode,
								i.borough,
								i.site,
								i.siteUid,
							)
						}
					}
				},
			)
		})
	}

	async saveRentalCoordinates(rentalListing: Partial<RentalListing>): Promise<boolean> {
		return await new Promise<boolean>((resolve, reject) =>
			this.db.run(
				'UPDATE rental_listings SET lat = ?, lon = ? WHERE street_address = ? AND city = ?',
				rentalListing.lat,
				rentalListing.lon,
				rentalListing.streetAddress,
				rentalListing.city,
				(err: any, _: any) => {
					err ? reject(false) : resolve(true)
				},
			),
		)
	}

	async saveSaleCoordinates(saleListing: Partial<SaleListing>): Promise<boolean> {
		return await new Promise<boolean>((resolve, reject) =>
			this.db.run(
				'UPDATE sale_listings SET lat = ?, lon = ? WHERE street_address = ? AND city = ?',
				saleListing.lat,
				saleListing.lon,
				saleListing.streetAddress,
				saleListing.city,
				(err: any, _: any) => {
					err ? reject(false) : resolve(true)
				},
			),
		)
	}

	async getRentalAddressesWithoutCoordinates(): Promise<Partial<RentalListing>[]> {
		return new Promise((resolve, reject) => {
			this.db.all(
				'SELECT DISTINCT street_address, city, lat, lon FROM rental_listings WHERE lat IS NULL AND lon IS NULL GROUP BY street_address, city',
				(err, res) => {
					if (err) reject('Unable to retrieve addresses')
					if (!res) resolve([])
					resolve(
						res.map(({ street_address, city, lat, lon }) => ({
							streetAddress: street_address,
							city,
							lat,
							lon,
						})),
					)
				},
			)
		})
	}

	async getSaleAddressesWithoutCoordinates(): Promise<Partial<SaleListing>[]> {
		return new Promise((resolve, reject) => {
			this.db.all(
				'SELECT DISTINCT street_address, city, lat, lon FROM sale_listings WHERE lat IS NULL AND lon IS NULL GROUP BY street_address, city',
				(err, res) => {
					if (err) reject('Unable to retrieve addresses')
					if (!res) resolve([])
					resolve(
						res.map(({ street_address, city, lat, lon }) => ({
							streetAddress: street_address,
							city,
							lat,
							lon,
						})),
					)
				},
			)
		})
	}

	async getRentalListings(limit: number = DEFAULT_LISTING_LIMIT): Promise<RentalListing[]> {
		return new Promise((resolve, reject) => {
			this.db.all(
				'SELECT * FROM rental_listings WHERE lat IS NOT NULL AND lon IS NOT NULL LIMIT ?',
				limit,
				(err, res) => {
					if (err) reject('Unable rental listings')
					if (!res) resolve([])
					resolve(res.map(rentalMapper))
				},
			)
		})
	}

	async getSaleListings(limit: number = DEFAULT_LISTING_LIMIT): Promise<SaleListing[]> {
		return new Promise((resolve, reject) => {
			this.db.all(
				'SELECT * FROM sale_listings WHERE lat IS NOT NULL AND lon IS NOT NULL LIMIT ?',
				limit,
				(err, res) => {
					if (err) reject('Unable sale listings')
					if (!res) resolve([])
					resolve(res.map(saleMapper))
				},
			)
		})
	}
}
