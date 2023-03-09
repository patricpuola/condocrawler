export const mapStyles = [
	'streets-v12',
	'outdoors-v12',
	'light-v11',
	'dark-v11',
	'satellite-v9',
	'satellite-streets-v12',
	'navigation-day-v1',
	'navigation-night-v1',
] as const

export type MapStyle = (typeof mapStyles)[number]
