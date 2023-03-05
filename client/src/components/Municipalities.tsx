import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'
import { Layer, Source } from 'react-map-gl'

type Props = {
	municipalities: FeatureCollection<Geometry, GeoJsonProperties>
	visible: boolean
}

const Municipalities = ({ municipalities, visible }: Props) => {
	return (
		<Source id="municipalities" type="geojson" data={municipalities}>
			<Layer
				id="municipality-line"
				type="line"
				paint={{ 'line-color': 'purple', 'line-width': 1 }}
				layout={{ visibility: visible ? 'visible' : 'none' }}
			></Layer>
			<Layer
				id="municipality-name"
				type="symbol"
				layout={{
					'text-field': ['get', 'name'],
					'text-size': 20,
					visibility: visible ? 'visible' : 'none',
				}}
				paint={{ 'text-opacity': 0.75 }}
			></Layer>
		</Source>
	)
}

export default Municipalities
