import { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl from 'mapbox-gl'
import { useGetRentalListingsQuery, useGetSaleListingsQuery } from '../services/crawler'
import Supercluster, { PointFeature } from 'supercluster'
import { AnyProps } from 'supercluster'
import { listingsToFeatureCollection, listingsToGeoJSON } from '../lib/mapHelper'
import * as districtHelsinkiRegion from '../assets/districtHelsinkiRegion.json'
import { FeatureCollection } from 'geojson'
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
	const [clusterIndex, setClusterIndex] = useState<Supercluster>()
	const [visibilitySettings, setVisibilitySettings] = useState<VisibilitySettings>({
		rentalListings: true,
		saleListings: true,
		districts: true,
	})
	const { data: rentalListings } = useGetRentalListingsQuery()
	const { data: saleListings } = useGetSaleListingsQuery()

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

		map.addSource('districts', { type: 'geojson', data: districtHelsinkiRegion as FeatureCollection })
		map.addLayer({
			id: 'district-fill',
			type: 'fill',
			source: 'districts',
			paint: {
				'fill-color': 'purple',
				'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.2, 0.1],
			},
		})
		map.addLayer({
			id: 'district-line',
			type: 'line',
			source: 'districts',
			paint: {
				'line-color': 'purple',
				'line-width': 4,
				'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.2],
			},
		})
		map.addLayer({
			id: 'district-name',
			type: 'symbol',
			source: 'districts',
			layout: {
				'text-field': ['get', 'nimi'],
			},
		})

		map.on('mousemove', 'district-fill', e => {
			console.log('move')
			if (!e.features) return
			if (e.features.length > 0) {
				console.log('oujea')
				const featureId = e.features[0].id
				console.log('featureId', e.features[0])
				if (hoverDistrict === featureId) return
				if (hoverDistrict && hoverDistrict !== featureId) {
					map.setFeatureState({ source: 'districts', id: hoverDistrict }, { hover: false })
				}
				map.setFeatureState({ source: 'districts', id: featureId }, { hover: true })
				hoverDistrict = featureId
			}
		})

		map.on('mouseleave', 'district-fill', () => {
			console.log('leave')
			if (hoverDistrict) {
				console.log('dääm')
				map.setFeatureState({ source: 'districts', id: hoverDistrict }, { hover: false })
				hoverDistrict = undefined
			}
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
	}, [visibilitySettings])

	useEffect(() => {
		if (!map) return
		map.setStyle(`mapbox://styles/mapbox/${style}`)
	}, [style])

	/*
	useEffect(() => {
		const node = mapNode.current

		if (typeof window === 'undefined' || node === null) return

		setMap(
			new mapboxgl.Map({
				container: node,
				style: `mapbox://styles/mapbox/${style}`,
				center: [24.945831, 60.192059],
				zoom: 12,
				accessToken: import.meta.env.VITE_MAPBOX_API_KEY,
			}),
		)

		setClusterIndex(
			new Supercluster({
				radius: 40,
				maxZoom: 16,
			}),
		)
	}, [style])

	useEffect(() => {
		if (!map || !rentalListings || !clusterIndex) return
		const rentalListingFeatureCollection = listingsToFeatureCollection(rentalListings)

		if (!clusterInitiated) {
			map.addSource('rentalListingData', {
				type: 'geojson',
				data: rentalListingFeatureCollection,
			})
			setClusterInitiated(true)
		}
		/*
		
		map.addLayer({
			id: 'rentalListings',
			type: 'circle',
			source: 'rentalListingData',
			paint: {
			'circle-radius': 6,
			'circle-color': '#007cbf'
			}
		})

		clusterIndex?.load(rentalListingFeatureCollection.features as PointFeature<AnyProps>[])
*/

	/*const points: PointFeature<AnyProps>[] = [{
			type: "Feature",
			geometry: {
			  type: "Point",
			  coordinates: [ 24.945831, 60.192059 ]
			},
			properties: {
			  name: "Helsinki",
			  country: "Finland",
			  population: 883305,
			  timezone: "PST"
			},
			id: "test-point-1"
		  }]
		clusterIndex?.load(points)
		const featureCollection: GeoJSON.FeatureCollection = {
			type: 'FeatureCollection',
			features: clusterIndex?.getClusters([-180, -85, 180, 85], 2) as GeoJSON.Feature[]
		}
		
		const listingLayer: CircleLayer = {
			id: "listingLayer",
			type: "circle",
			source: {
				type: 'geojson',
				data: featureCollection
			}
		}

		console.log(listingLayer)
		rentalListings?.map(({lon, lat}) => {
			if (!lon || !lat || !map) return
			new mapboxgl.Marker({ color: 'purple'}).setLngLat([lon, lat]).addTo(map)})
		saleListings?.map(({lon, lat}) => {
			if (!lon || !lat || !map) return
			new mapboxgl.Marker({ color: 'green'}).setLngLat([lon, lat]).addTo(map)})
	}, [map, rentalListings, saleListings])

	useEffect(() => {
		if (!map || !clusterIndex) return
		map.on('moveend', function() {
			const bounds = map.getBounds()
			const clusters = clusterIndex.getClusters([bounds.getNorth(), bounds.getEast(), bounds.getSouth(), bounds.getWest()], map.getZoom())
		  
			const source = map.getSource('rentalListingData') as GeoJSONSource
			
			source.setData({
			  type: 'FeatureCollection',
			  features: clusters.map((cluster) => {
				if (cluster.properties.cluster) {
				  return {
					type: 'Feature',
					properties: {
					  cluster: true,
					  point_count: cluster.properties.point_count,
					  point_count_abbreviated: cluster.properties.point_count_abbreviated
					},
					geometry: {
					  type: 'Point',
					  coordinates: cluster.geometry.coordinates
					}
				  };
				} else {
				  return cluster;
				}
			  })
			})
		  
		  })
	}, [map, clusterIndex])

*/
	return (
		<div className="h-full w-full bg-green-200">
			<div
				id="control-panel"
				className="absolute bg-stone-100 z-10 top-5 right-5 rounded-md shadow p-3 grid gap-2"
			>
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
			<div ref={mapNode} className="w-full h-full"></div>
		</div>
	)
}

export default Map
