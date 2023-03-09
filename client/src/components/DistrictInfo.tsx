import { PriceData, PriceDataByDistrict } from '../types/Statistics'

type Props = {
	district?: mapboxgl.MapboxGeoJSONFeature
	rentalStatistics: PriceDataByDistrict
	saleStatistics: PriceDataByDistrict
}

const DistrictInfo = ({ district, rentalStatistics, saleStatistics }: Props) => {
	const emptyPriceData: PriceData = {
		count: 0,
		low: 0,
		high: 0,
		median: 0,
		lowPerSquareMeter: 0,
		highPerSquareMeter: 0,
		medianPerSquareMeter: 0,
	}

	const formatter = new Intl.NumberFormat('fi-FI', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	})

	if (!district) {
		return <></>
	}

	if (typeof district.id !== 'number') {
		console.error('DistrictInfo: Invalid data', district)
		return (
			<div id="selection" className="bg-stone-100 rounded-md shadow p-3">
				<span>Invalid district data</span>
			</div>
		)
	}

	const rentalData = rentalStatistics.districts.get(district.id) || emptyPriceData
	const saleData = saleStatistics.districts.get(district.id) || emptyPriceData

	return (
		<div id="selection" className="bg-stone-100 rounded-md shadow p-3">
			<div className="text-xl text-center font-bold">{district.properties?.name || 'unknown district'}</div>
			<div>
				<div className="text-xl">Sale ({saleData.count})</div>
				<div className="grid grid-cols-2 pl-1">
					<div>High</div>
					<div>{formatter.format(saleData.high)}</div>
					<div>Median</div>
					<div>{formatter.format(saleData.median)}</div>
					<div>Low</div>
					<div>{formatter.format(saleData.low)}</div>
				</div>
				<hr />
				<div className="text-xl">Rental ({rentalData.count})</div>
				<div className="grid grid-cols-2 pl-1">
					<div>High</div>
					<div>{formatter.format(rentalData.high)}/kk</div>
					<div>Median</div>
					<div>{formatter.format(rentalData.median)}/kk</div>
					<div>Low</div>
					<div>{formatter.format(rentalData.low)}/kk</div>
				</div>
			</div>
		</div>
	)
}

export default DistrictInfo
