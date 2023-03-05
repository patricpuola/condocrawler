export const capitalizeCamelCase = (camelCaseString: string) => {
	const words = camelCaseString.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ')
	const capitalizedFirstWord = words[0].charAt(0).toUpperCase() + words[0].slice(1)
	return capitalizedFirstWord + ' ' + words.slice(1).join(' ')
}
