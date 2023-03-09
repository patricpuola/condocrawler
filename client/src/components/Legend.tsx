type Props = {}

const Legend = (props: Props) => {
	return (
		<div>
			<h2 className="my-2 font-bold">Legend</h2>
			<div className="flex gap-1">
				<div className="w-6 h-6 rounded-full bg-orange-500"></div>
				<div>Rental listing</div>
				<div className="w-6 h-6 rounded-full bg-sky-500"></div>
				<div>Sale Listing</div>
			</div>
		</div>
	)
}

export default Legend
