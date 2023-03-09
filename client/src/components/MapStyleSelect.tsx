import { MapStyle as MapStyle, mapStyles } from '../types/Map'

type Props = {
	style: string
	setStyle: (style: MapStyle) => void
	mapStyles: typeof mapStyles
}

const MapStyleSelect = ({ style, setStyle, mapStyles }: Props) => {
	return (
		<div className="grid">
			<h2 className="my-2 font-bold">Map style</h2>
			<select onChange={e => setStyle(e.target.value as MapStyle)} value={style}>
				{mapStyles.map(mapStyle => (
					<option>{mapStyle}</option>
				))}
			</select>
		</div>
	)
}

export default MapStyleSelect
