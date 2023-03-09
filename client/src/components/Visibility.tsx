import { capitalizeCamelCase } from '../lib/stringHelper'
import { VisibilitySettings } from '../types/Visibility'

type Props = {
	settings: VisibilitySettings
	setSettings: (settings: VisibilitySettings) => void
}

const Visibility = ({ settings, setSettings }: Props) => {
	return (
		<div className="grid">
			<h2 className="my-2 font-bold">Overlays</h2>
			{Object.keys(settings).map(setting => (
				<label className="cursor-pointer select-none">
					<input
						type="checkbox"
						className="mr-1"
						onChange={e =>
							setSettings({
								...settings,
								[setting]: !settings[setting as keyof VisibilitySettings],
							})
						}
						checked={settings[setting as keyof VisibilitySettings]}
					/>
					<span>{capitalizeCamelCase(setting)}</span>
				</label>
			))}
		</div>
	)
}

export default Visibility
