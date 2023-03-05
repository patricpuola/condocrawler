export type PriceData = {
	count: number
	high: number
	low: number
	median: number
	highPerSquareMeter: number
	lowPerSquareMeter: number
	medianPerSquareMeter: number
}

export type PriceDataByDistrict = PriceData & {
	districts: Map<number, PriceData>
}
