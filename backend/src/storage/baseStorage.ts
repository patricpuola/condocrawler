import { RentalListing, SaleListing } from '../models/listing'

export abstract class BaseStorage {
	abstract saveRentalListings(listings: RentalListing[]): Promise<void>
	abstract saveSaleListings(listings: SaleListing[]): Promise<void>
}
