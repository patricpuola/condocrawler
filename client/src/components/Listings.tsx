import { Layer, Source } from 'react-map-gl'
import { Listing } from '../types/Listing'
import { listingsToFeatureCollection } from '../lib/mapHelper'

type Props = {
	id: string
	listings: Listing[]
	visible: boolean
	color: string
}

const Listings = ({ id, listings, visible, color }: Props) => {
	return (
		<Source id={id} type="geojson" data={listingsToFeatureCollection(listings)} cluster={true}>
			<Layer
				id={`${id}-circles-clusters`}
				type="circle"
				paint={{
					'circle-color': color,
					'circle-radius': ['interpolate', ['linear'], ['get', 'point_count'], 2, 20, 40, 30],
					'circle-blur': 0,
					'circle-stroke-color': 'white',
					'circle-stroke-width': 1,
				}}
				layout={{ visibility: visible ? 'visible' : 'none' }}
				filter={['has', 'point_count']}
				source={id}
			></Layer>
			<Layer
				id={`${id}-circles-clusters-count`}
				type="symbol"
				layout={{
					visibility: visible ? 'visible' : 'none',
					'text-field': '{point_count_abbreviated}',
					'text-size': [
						'interpolate',
						['linear'],
						['get', 'point_count'],
						// when zoom is 0, set each feature's circle radius to the value of its "rating" property
						2,
						20,
						// when zoom is 10, set each feature's circle radius to four times the value of its "rating" property
						40,
						30,
					],
					'icon-allow-overlap': true,
					'text-ignore-placement': true,
				}}
				filter={['has', 'point_count']}
				source={id}
			></Layer>
			<Layer
				id={`${id}-circles`}
				type="circle"
				paint={{
					'circle-color': color,
					'circle-radius': 10,
					'circle-blur': 0,
					'circle-stroke-color': 'black',
					'circle-stroke-width': 1,
				}}
				layout={{ visibility: visible ? 'visible' : 'none' }}
				filter={['!', ['has', 'point_count']]}
				source={id}
			></Layer>
		</Source>
	)
}

export default Listings
