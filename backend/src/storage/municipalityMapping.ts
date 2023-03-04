export type MunicipalityRow = {
	id: number
	vendor_id?: string
	municipality_id?: string
	name?: string
	boundary: Array<Array<{ x: number; y: number }>>
}

export const municipalityGeoMapper = ({
	id,
	vendor_id,
	municipality_id,
	name,
	boundary,
}: MunicipalityRow): GeoJSON.Feature => ({
	type: 'Feature',
	id: id || undefined,
	properties: {
		vendorId: vendor_id,
		municipalityId: municipality_id,
		name,
	},
	geometry: {
		type: 'Polygon',
		coordinates: boundary.map(area => area.map(({ x, y }) => [x, y] as GeoJSON.Position)),
	},
})
