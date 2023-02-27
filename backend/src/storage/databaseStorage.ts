import { RentalListing, SaleListing } from '../models/listing'
import { BaseStorage } from './baseStorage'

export class DatabaseStorage extends BaseStorage {
	async saveRentalListings(listings: RentalListing[]): Promise<void> {
		console.log('saving not implemented yet')
		console.log(listings)
	}

	async saveSaleListings(listings: SaleListing[]): Promise<void> {
		console.log('saving not implemented yet')
		console.log(listings)
	}
}
