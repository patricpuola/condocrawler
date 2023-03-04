export type DistrictRow = {
	id: number
	vendor_id?: string
	district_id?: string
	name?: string
	boundary: Array<Array<{ x: number; y: number }>>
}

export const districtGeoMapper = ({ id, vendor_id, district_id, name, boundary }: DistrictRow): GeoJSON.Feature => ({
	type: 'Feature',
	id: id || undefined,
	properties: {
		vendorId: vendor_id,
		districtId: district_id,
		name,
	},
	geometry: {
		type: 'Polygon',
		coordinates: boundary.map(area => area.map(({ x, y }) => [x, y] as GeoJSON.Position)),
	},
})
