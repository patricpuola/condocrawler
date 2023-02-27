import { RentalListing, SaleListing } from '../models/listing'
import { BaseStorage } from './baseStorage'
export class MockStorage extends BaseStorage {
	async saveRentalListings(listings: RentalListing[]): Promise<void> {}

	async saveSaleListings(listings: SaleListing[]): Promise<void> {}
}
