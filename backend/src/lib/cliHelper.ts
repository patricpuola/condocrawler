import chalk from 'chalk'
import { Presets, SingleBar } from 'cli-progress'

export const getProgressBar = (
	title: string,
	barColor: chalk.Chalk = chalk.grey,
	entryColor: chalk.Chalk = chalk.magenta,
) =>
	new SingleBar(
		{
			format: `${title} ${barColor('{bar}')} {value}/{total} | ETA: {eta}s | ${entryColor('{entry}')}`,
			hideCursor: true,
		},
		Presets.shades_classic,
	)
