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
		<Source id={id} type="geojson" data={listingsToFeatureCollection(listings)}>
			<Layer
				id={`${id}-circles`}
				type="circle"
				paint={{
					'circle-color': color,
					'circle-opacity': 0.5,
					'circle-radius': 10,
					'circle-blur': 0,
				}}
				layout={{ visibility: visible ? 'visible' : 'none' }}
			></Layer>
		</Source>
	)
}

export default Listings
