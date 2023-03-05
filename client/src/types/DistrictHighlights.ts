export const DistrictHighlights = ['none', 'rental', 'sale'] as const

export type DistrictHighlightOption = (typeof DistrictHighlights)[number]
