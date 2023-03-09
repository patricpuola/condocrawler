import { capitalizeCamelCase } from '../lib/stringHelper'
import { DistrictHighlightOption, DistrictHighlights } from '../types/DistrictHighlights'

type Props = {
	highlight: DistrictHighlightOption
	setHighlight: (highlight: DistrictHighlightOption) => void
}

const DistrictHighlightSelector = ({ highlight, setHighlight }: Props) => {
	return (
		<div>
			<h2 className="my-2 font-bold">District Color</h2>
			<div className="grid">
				{DistrictHighlights.map((highlightOption, idx) => (
					<div>
						<input
							type="radio"
							name="districtHighlight[]"
							value={highlightOption}
							key={idx}
							id={'highlight_' + highlightOption}
							checked={highlight === highlightOption}
							onChange={e => setHighlight(e.target.value as DistrictHighlightOption)}
						/>
						<label htmlFor={'highlight_' + highlightOption} className="cursor-pointer select-none pl-2">
							{capitalizeCamelCase(highlightOption)}
						</label>
					</div>
				))}
			</div>
		</div>
	)
}

export default DistrictHighlightSelector
