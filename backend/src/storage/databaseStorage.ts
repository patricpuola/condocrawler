import { RentalListing, SaleListing } from '../models/listing'
import { BaseStorage } from './baseStorage'
import mysql, { OkPacket } from 'mysql2/promise'
import { rentalMapper, saleMapper } from './listingMapping'
import { Listing, isRentalListing } from '../types/scraping'
import { DistrictRow, districtGeoMapper } from './districtMapping'

const DEFAULT_LISTING_LIMIT = 30

export class DatabaseStorage extends BaseStorage {
	db!: mysql.Connection

	constructor() {
		super()
	}

	async connect(): Promise<void> {
		this.db = await mysql.createConnection({
			host: process.env.MYSQL_HOST,
			user: process.env.MYSQL_USER,
			database: process.env.MYSQL_DB,
			password: process.env.MYSQL_PASS,
		})
	}

	validNewListing({ city, streetAddress, site, siteUid }: Listing): Boolean {
		if (!city || !streetAddress || !site || siteUid) return false
		return true
	}

	async saveDiff<T extends RentalListing | SaleListing>(newListing: T, oldListing: T): Promise<Boolean> {
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

		const insertHistory = await this.db.prepare(
			'INSERT INTO listings_history (property, old_value, new_value, site, site_uid) VALUES (?, ?, ?, ?, ?)',
		)

		for (const prop in changes) {
			const typedProp = prop as keyof T
			insertHistory.execute([
				prop,
				oldListing[typedProp] ?? '',
				newListing[typedProp] ?? '',
				oldListing.site,
				oldListing.siteUid,
			])
		}

		return true
	}

	async saveRentalListings(listings: RentalListing[]): Promise<void> {
		const insert = await this.db.prepare(
			'INSERT INTO rental_listings (title, url, rent, rent_unit, image_url, street_address, city, postal_code, district, site, site_uid) VALUES (?, ?, ? ,?, ?, ?, ? ,? ,?, ?, ?)',
		)

		const update = await this.db.prepare(
			`UPDATE rental_listings SET title = ?, url = ?, rent = ?, rent_unit = ?, image_url = ?, street_address = ?, city = ?, postal_code = ?, district = ?, date_updated = NOW() WHERE site = ? AND site_uid = ?`,
		)

		const select = await this.db.prepare('SELECT * FROM rental_listings WHERE site = ? AND site_uid = ? LIMIT 1')

		listings.map(async i => {
			console.log('processing: ', i)
			const [rows, _] = await select.execute([i.site, i.siteUid])
			if (!Array.isArray(rows)) {
				return
			}
			if (rows.length === 0) {
				if (!this.validNewListing(i)) return
				await insert.execute([
					i.title,
					i.url,
					i.rent,
					i.rentUnit,
					i.imageUrl,
					i.streetAddress,
					i.city,
					i.postalCode,
					i.district,
					i.site,
					i.siteUid,
				])
			} else {
				const res = rows[0] as any
				const oldListing: RentalListing = {
					title: res.title,
					url: res.url,
					rent: res.rent_per_month,
					rentUnit: res.rent_unit,
					imageUrl: res.image_url,
					streetAddress: res.street_address,
					city: res.city,
					postalCode: res.postal_code,
					district: res.district,
					location: res.location,
					site: res.site,
					siteUid: res.site_uid,
				}
				if (await this.saveDiff(i, oldListing)) {
					await update.execute([
						i.title,
						i.url,
						i.rent,
						i.rentUnit,
						i.imageUrl,
						i.streetAddress,
						i.city,
						i.postalCode,
						i.district,
						i.site,
						i.siteUid,
					])
				}
			}
		})
	}

	async saveSaleListings(listings: SaleListing[]): Promise<void> {
		const insert = await this.db.prepare(
			'INSERT INTO sale_listings (title, url, price, price_unit, image_url, street_address, city, postal_code, district, site, site_uid) VALUES (?, ?, ? ,?, ?, ?, ? ,? ,?, ?, ?)',
		)

		const update = await this.db.prepare(
			`UPDATE sale_listings SET title = ?, url = ?, price = ?, price_unit = ?, image_url = ?, street_address = ?, city = ?, postal_code = ?, district = ?, date_updated = NOW() WHERE site = ? AND site_uid = ?`,
		)

		const select = await this.db.prepare('SELECT * FROM sale_listings WHERE site = ? AND site_uid = ? LIMIT 1')

		listings.map(async i => {
			console.log('processing: ', i)
			const [rows, _] = await select.execute([i.site, i.siteUid])
			if (!Array.isArray(rows)) {
				return
			}
			if (rows.length === 0) {
				if (!this.validNewListing(i)) return
				insert.execute([
					i.title,
					i.url,
					i.price,
					i.priceUnit,
					i.imageUrl,
					i.streetAddress,
					i.city,
					i.postalCode,
					i.district,
					i.site,
					i.siteUid,
				])
			} else {
				const res = rows[0] as any
				const oldListing: SaleListing = {
					title: res.title,
					url: res.url,
					price: res.price,
					priceUnit: res.price_unit,
					imageUrl: res.image_url,
					streetAddress: res.street_address,
					city: res.city,
					postalCode: res.postal_code,
					district: res.district,
					location: res.location,
					site: res.site,
					siteUid: res.site_uid,
				}
				if (await this.saveDiff(i, oldListing)) {
					update.execute([
						i.title,
						i.url,
						i.price,
						i.priceUnit,
						i.imageUrl,
						i.streetAddress,
						i.city,
						i.postalCode,
						i.district,
						i.site,
						i.siteUid,
					])
				}
			}
		})
	}

	async saveRentalCoordinates(rentalListing: Partial<RentalListing>): Promise<boolean> {
		if (!rentalListing.location) return false
		const [rows, _] = await this.db.execute(
			'UPDATE rental_listings SET location = POINT(?, ?) WHERE street_address = ? AND city = ?',
			[rentalListing.location.x, rentalListing.location.y, rentalListing.streetAddress, rentalListing.city],
		)

		return (rows as OkPacket).affectedRows > 0
	}

	async saveSaleCoordinates(saleListing: Partial<SaleListing>): Promise<boolean> {
		if (!saleListing.location) return false
		const [rows, _] = await this.db.execute(
			'UPDATE sale_listings SET location = POINT(?, ?) WHERE street_address = ? AND city = ?',
			[saleListing.location.x, saleListing.location.y, saleListing.streetAddress, saleListing.city],
		)

		return (rows as OkPacket).affectedRows > 0
	}

	async getRentalAddressesWithoutCoordinates(): Promise<Partial<RentalListing>[]> {
		const [rows, _] = await this.db.execute(
			'SELECT DISTINCT street_address, city, location FROM rental_listings WHERE location IS NULL GROUP BY street_address, city',
		)

		if (!Array.isArray(rows)) return []

		return (rows as any[]).map(({ street_address, city, location }) => ({
			streetAddress: street_address,
			city,
			location,
		}))
	}

	async getSaleAddressesWithoutCoordinates(): Promise<Partial<RentalListing>[]> {
		const [rows, _] = await this.db.execute(
			'SELECT DISTINCT street_address, city, location FROM sale_listings WHERE location IS NULL GROUP BY street_address, city',
		)

		if (!Array.isArray(rows)) return []

		return (rows as any[]).map(({ street_address, city, location }) => ({
			streetAddress: street_address,
			city,
			location,
		}))
	}

	async getRentalListings(limit: number | null = DEFAULT_LISTING_LIMIT): Promise<RentalListing[]> {
		const limitClause = Number.isInteger(limit) ? `LIMIT ${limit}` : ''
		const [rows, _] = await this.db.execute(
			`SELECT * FROM rental_listings WHERE location IS NOT NULL ${limitClause}`,
		)

		if (!Array.isArray(rows)) return []

		return (rows as any[]).map(rentalMapper)
	}

	async getSaleListings(limit: number | null = DEFAULT_LISTING_LIMIT): Promise<SaleListing[]> {
		const limitClause = Number.isInteger(limit) ? `LIMIT ${limit}` : ''
		const [rows, _] = await this.db.execute(`SELECT * FROM sale_listings WHERE location IS NOT NULL ${limitClause}`)

		if (!Array.isArray(rows)) return []

		return (rows as any[]).map(saleMapper)
	}

	async getDistricts(): Promise<DistrictRow[]> {
		const [rows, _] = await this.db.execute('SELECT * FROM districts')
		if (!Array.isArray(rows)) return []

		return rows as DistrictRow[]
	}

	async findDistricts(longitude: number, latitude: number): Promise<DistrictRow[]> {
		const [rows, _] = await this.db.execute('SELECT * FROM districts WHERE ST_Contains(boundary, POINT(?, ?))', [
			longitude,
			latitude,
		])
		if (!Array.isArray(rows)) return []

		return rows as DistrictRow[]
	}

	async updateListingDistrict(listing: Listing, districtId: number) {
		const listingTable = isRentalListing(listing) ? 'rental_listings' : 'sale_listings'

		const [rows, _] = await this.db.execute(`UPDATE ${listingTable} SET district_id = ? WHERE id = ? LIMIT 1`, [
			districtId,
			listing.id,
		])
		return (rows as OkPacket).affectedRows > 0
	}
}
