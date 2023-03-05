import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'
import { PriceDataByDistrict } from '../types/Statistics'
import { Layer, MapboxGeoJSONFeature, Source, useMap } from 'react-map-gl'
import { colorDistricts } from '../lib/mapHelper'
import { VisibilitySettings } from '../types/Visibility'
import { useEffect, useState } from 'react'

type Props = {
	districts: FeatureCollection<Geometry, GeoJsonProperties>
	saleStatistics: PriceDataByDistrict
	rentalStatistics: PriceDataByDistrict
	visible: boolean
	listingHighlight: 'none' | 'sale' | 'rental'
	setSelectedDistrict: (district: MapboxGeoJSONFeature) => void
}

const Districts = ({
	districts,
	saleStatistics,
	rentalStatistics,
	visible,
	listingHighlight,
	setSelectedDistrict,
}: Props) => {
	const { current: map } = useMap()

	let hoverDistrict: number | string | undefined

	useEffect(() => {
		console.log(!!map, !!districts, !!saleStatistics, !!rentalStatistics)
		if (!map || !districts || !saleStatistics || !rentalStatistics) return
		console.log('asd')
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
			if (e.features) setSelectedDistrict(e.features[0])
		})

		console.log('districts done')
	}, [map, districts])

	return (
		<Source id="districts" type="geojson" data={colorDistricts(districts, saleStatistics, rentalStatistics)}>
			<Layer
				id="district-fill"
				type="fill"
				layout={{ visibility: visible ? 'visible' : 'none' }}
				paint={{
					'fill-color':
						listingHighlight === 'rental'
							? ['get', 'rentalColor']
							: listingHighlight === 'sale'
							? ['get', 'saleColor']
							: 'purple',
					'fill-opacity': [
						'case',
						[
							'any',
							['boolean', ['feature-state', 'hover'], false],
							['match', ['get', 'districtColor'], 'rental', false, 'sale', false, true],
						],
						0.2,
						0.6,
					],
				}}
			></Layer>
			<Layer
				id="district-line"
				type="line"
				layout={{ visibility: visible ? 'visible' : 'none' }}
				paint={{
					'line-color': 'purple',
					'line-width': 4,
					'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.05],
					'line-blur': 3,
				}}
			></Layer>
			<Layer
				id="district-name"
				type="symbol"
				layout={{
					'text-field': ['get', 'name'],
					visibility: visible ? 'visible' : 'none',
				}}
			></Layer>
		</Source>
	)
}

export default Districts
