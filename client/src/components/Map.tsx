import { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl, { MapboxGeoJSONFeature } from 'mapbox-gl'
import {
	useGetDistrictsQuery,
	useGetMunicipalitiesQuery,
	useGetRentalListingsQuery,
	useGetSaleListingsQuery,
} from '../services/crawler'
import { listingsToGeoJSON } from '../lib/mapHelper'
import { VisibilitySettings } from '../types/Visibility'

const mapStyles = [
	'streets-v12',
	'outdoors-v12',
	'light-v11',
	'dark-v11',
	'satellite-v9',
	'satellite-streets-v12',
	'navigation-day-v1',
	'navigation-night-v1',
] as const

type Props = {}

const Map = (props: Props) => {
	const mapNode = useRef(null)
	const [style, setStyle] = useState<(typeof mapStyles)[number]>('streets-v12')
	const [map, setMap] = useState<mapboxgl.Map>()
	const [visibilitySettings, setVisibilitySettings] = useState<VisibilitySettings>({
		rentalListings: true,
		saleListings: true,
		districts: true,
		municipalities: true,
	})
	const [districtSelection, setDistrictSelection] = useState<MapboxGeoJSONFeature>()
	const { data: rentalListings } = useGetRentalListingsQuery()
	const { data: saleListings } = useGetSaleListingsQuery()
	const { data: districts } = useGetDistrictsQuery()
	const { data: municipalities } = useGetMunicipalitiesQuery()

	let hoverDistrict: number | string | undefined

	useEffect(() => {
		if (!mapNode.current) return
		setMap(
			new mapboxgl.Map({
				container: mapNode.current,
				style: `mapbox://styles/mapbox/${style}`,
				center: [24.945831, 60.192059],
				zoom: 12,
				accessToken: import.meta.env.VITE_MAPBOX_API_KEY,
			}),
		)
	}, [])

	useEffect(() => {
		if (!map || !municipalities) return
		map.addSource('municipalities', { type: 'geojson', data: municipalities })
		map.addLayer({
			id: 'municipality-line',
			type: 'line',
			source: 'municipalities',
			paint: { 'line-color': 'purple', 'line-width': 1 },
		})
		map.addLayer({
			id: 'municipality-name',
			type: 'symbol',
			source: 'municipalities',
			layout: {
				'text-field': ['get', 'name'],
				'text-size': 20,
			},
			paint: {
				'text-opacity': 0.75,
			},
		})
	}, [map, municipalities])

	useEffect(() => {
		if (!map || !districts) return
		map.addSource('districts', { type: 'geojson', data: districts })
		map.addLayer({
			id: 'district-fill',
			type: 'fill',
			source: 'districts',
			paint: {
				'fill-color': 'purple',
				'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.2, 0.05],
			},
		})
		map.addLayer({
			id: 'district-line',
			type: 'line',
			source: 'districts',
			paint: {
				'line-color': 'purple',
				'line-width': 4,
				'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.05],
				'line-blur': 3,
			},
		})
		map.addLayer({
			id: 'district-name',
			type: 'symbol',
			source: 'districts',
			layout: {
				'text-field': ['get', 'name'],
			},
		})
		map.on('mousemove', 'district-fill', e => {
			if (!e.features) return
			if (e.features.length > 0) {
				const featureId = e.features[0].id
				if (hoverDistrict === featureId) return
				if (hoverDistrict && hoverDistrict !== featureId) {
					map.setFeatureState({ source: 'districts', id: hoverDistrict }, { hover: false })
				}
				map.setFeatureState({ source: 'districts', id: featureId }, { hover: true })
				hoverDistrict = featureId
			}
		})

		map.on('mouseleave', 'district-fill', () => {
			if (hoverDistrict) {
				map.setFeatureState({ source: 'districts', id: hoverDistrict }, { hover: false })
				hoverDistrict = undefined
			}
		})

		map.on('click', 'district-fill', e => {
			if (e.features) setDistrictSelection(e.features[0])
		})

		console.log('districts done')
	}, [map, districts])

	useEffect(() => {
		if (!map || !rentalListings) return
		map.addSource('rentalListings', listingsToGeoJSON(rentalListings))
		map.addLayer({
			id: 'rentalListings-circles',
			type: 'circle',
			source: 'rentalListings',
			paint: {
				'circle-color': '#FF0000',
				'circle-opacity': 0.5,
				'circle-radius': 10,
				'circle-blur': 0,
			},
		})

		console.log('rentals done')
	}, [map, rentalListings])

	useEffect(() => {
		if (!map || !saleListings) return
		map.addSource('saleListings', listingsToGeoJSON(saleListings))
		map.addLayer({
			id: 'saleListings-circles',
			type: 'circle',
			source: 'saleListings',
			paint: {
				'circle-color': 'green',
				'circle-opacity': 0.5,
				'circle-radius': 10,
			},
		})
		console.log('sales done')
	}, [map, saleListings])

	useEffect(() => {
		if (!map) return
		map.setLayoutProperty(
			'rentalListings-circles',
			'visibility',
			visibilitySettings.rentalListings ? 'visible' : 'none',
		)
		map.setLayoutProperty(
			'saleListings-circles',
			'visibility',
			visibilitySettings.saleListings ? 'visible' : 'none',
		)
		map.setLayoutProperty('district-fill', 'visibility', visibilitySettings.districts ? 'visible' : 'none')
		map.setLayoutProperty('district-line', 'visibility', visibilitySettings.districts ? 'visible' : 'none')
		map.setLayoutProperty('district-name', 'visibility', visibilitySettings.districts ? 'visible' : 'none')
		map.setLayoutProperty('municipality-line', 'visibility', visibilitySettings.municipalities ? 'visible' : 'none')
		map.setLayoutProperty('municipality-name', 'visibility', visibilitySettings.municipalities ? 'visible' : 'none')
	}, [visibilitySettings])

	useEffect(() => {
		if (!map) return
		map.setStyle(`mapbox://styles/mapbox/${style}`)
	}, [style])

	useEffect(() => {}, [])

	return (
		<div className="h-full w-full bg-green-200">
			<div id="side-panel" className="absolute z-10 top-5 right-5 grid gap-2">
				<div className="bg-stone-100  rounded-md shadow p-3">
					<h1 className="text-xl font-bold">Condo Crawler 0.1</h1>
					<hr />
					<div className="grid">
						<h2 className="mb-2">Overlays</h2>
						<label className="cursor-pointer select-none">
							<input
								type="checkbox"
								className="mr-1"
								onChange={e =>
									setVisibilitySettings({
										...visibilitySettings,
										rentalListings: !visibilitySettings.rentalListings,
									})
								}
								checked={visibilitySettings.rentalListings}
							/>
							<span>Rental listings</span>
						</label>
						<label className="cursor-pointer select-none">
							<input
								type="checkbox"
								className="mr-1"
								onChange={e =>
									setVisibilitySettings({
										...visibilitySettings,
										saleListings: !visibilitySettings.saleListings,
									})
								}
								checked={visibilitySettings.saleListings}
							/>
							<span>Sales listings</span>
						</label>
						<label className="cursor-pointer select-none">
							<input
								type="checkbox"
								className="mr-1"
								onChange={e =>
									setVisibilitySettings({
										...visibilitySettings,
										districts: !visibilitySettings.districts,
									})
								}
								checked={visibilitySettings.districts}
							/>
							<span>Districts</span>
						</label>
						<label className="cursor-pointer select-none">
							<input
								type="checkbox"
								className="mr-1"
								onChange={e =>
									setVisibilitySettings({
										...visibilitySettings,
										municipalities: !visibilitySettings.municipalities,
									})
								}
								checked={visibilitySettings.municipalities}
							/>
							<span>Municipalities</span>
						</label>
					</div>
					<hr />
					<div className="grid">
						<h2 className="mb-2">Map style</h2>
						<select onChange={e => setStyle(e.target.value as (typeof mapStyles)[number])}>
							{mapStyles.map(style => (
								<option>{style}</option>
							))}
						</select>
					</div>
				</div>
				<div id="selection" className="bg-stone-100  rounded-md shadow p-3">
					{districtSelection ? districtSelection.properties?.name : 'no selection'}
				</div>
			</div>
			<div ref={mapNode} className="w-full h-full"></div>
		</div>
	)
}

export default Map
