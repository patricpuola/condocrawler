import { useEffect, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapboxGeoJSONFeature } from 'mapbox-gl'
import Map from 'react-map-gl'
import {
	useGetDistrictsQuery,
	useGetMunicipalitiesQuery,
	useGetRentalListingsQuery,
	useGetSaleListingsQuery,
} from '../services/crawler'
import { getStatistics } from '../lib/mapHelper'
import { VisibilitySettings } from '../types/Visibility'
import { PriceDataByDistrict, PriceData } from '../types/Statistics'
import Districts from './Districts'
import Municipalities from './Municipalities'
import Listings from './Listings'
import DistrictInfo from './DistrictInfo'
import Visibility from './Visibility'
import { DistrictHighlightOption } from '../types/DistrictHighlights'
import DistrictHighlightSelector from './DistrictHighlightSelector'

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

const MapContainer = (props: Props) => {
	const [style, setStyle] = useState<(typeof mapStyles)[number]>('streets-v12')
	const [visibilitySettings, setVisibilitySettings] = useState<VisibilitySettings>({
		rentalListings: true,
		saleListings: true,
		districts: true,
		municipalities: true,
	})
	const [rentalStatistics, setRentalStatistics] = useState<PriceDataByDistrict>()
	const [saleStatistics, setSaleStatistics] = useState<PriceDataByDistrict>()

	const [listingHighlight, setListingHighlight] = useState<DistrictHighlightOption>('none')
	const [selectedDistrict, setSelectedDistrict] = useState<MapboxGeoJSONFeature>()
	const { data: rentalListings } = useGetRentalListingsQuery()
	const { data: saleListings } = useGetSaleListingsQuery()
	const { data: districts } = useGetDistrictsQuery()
	const { data: municipalities } = useGetMunicipalitiesQuery()

	useEffect(() => {
		if (!rentalListings) return
		setRentalStatistics(getStatistics(rentalListings))
	}, [rentalListings])

	useEffect(() => {
		if (!saleListings) return
		setSaleStatistics(getStatistics(saleListings))
	}, [saleListings])

	return (
		<div className="h-full w-full bg-green-200">
			<div id="side-panel" className="absolute z-10 top-5 right-5 grid gap-2">
				<div className="bg-stone-100  rounded-md shadow p-3">
					<h1 className="text-xl font-bold">Condo Crawler 0.2</h1>
					<hr />
					<Visibility settings={visibilitySettings} setSettings={setVisibilitySettings} />
					<hr />
					<div className="grid">
						<h2 className="mb-2">Map style</h2>
						<select onChange={e => setStyle(e.target.value as (typeof mapStyles)[number])}>
							{mapStyles.map(style => (
								<option>{style}</option>
							))}
						</select>
					</div>
					<DistrictHighlightSelector highlight={listingHighlight} setHighlight={setListingHighlight} />
				</div>
				{saleStatistics && rentalStatistics && (
					<DistrictInfo
						district={selectedDistrict}
						saleStatistics={saleStatistics}
						rentalStatistics={rentalStatistics}
					/>
				)}
			</div>
			<Map
				style={{ height: '100%', width: '100%' }}
				initialViewState={{ longitude: 24.945831, latitude: 60.192059, zoom: 12 }}
				mapStyle={`mapbox://styles/mapbox/${style}`}
				mapboxAccessToken={import.meta.env.VITE_MAPBOX_API_KEY}
			>
				{municipalities && (
					<Municipalities municipalities={municipalities} visible={visibilitySettings.municipalities} />
				)}
				{districts && saleStatistics && rentalStatistics && (
					<Districts
						districts={districts}
						saleStatistics={saleStatistics}
						rentalStatistics={rentalStatistics}
						visible={visibilitySettings.districts}
						listingHighlight={listingHighlight}
						setSelectedDistrict={setSelectedDistrict}
					/>
				)}
				{rentalListings && (
					<Listings
						id="rentalListings"
						listings={rentalListings}
						visible={visibilitySettings.rentalListings}
						color="red"
					/>
				)}
				{saleListings && (
					<Listings
						id="saleListings"
						listings={saleListings}
						visible={visibilitySettings.saleListings}
						color="green"
					/>
				)}
			</Map>
		</div>
	)
}

export default MapContainer
