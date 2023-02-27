import fs from 'fs/promises'

const TMP_FOLDER = './tmp'

export const tmpSave = async (filename: string, data: string) => {
	const fullPath = `${TMP_FOLDER}/${filename}`
	await fs.writeFile(fullPath, data)
}

export const tmpLoad = async (filename: string): Promise<string | null> => {
	const fullPath = `${TMP_FOLDER}/${filename}`
	try {
		return await fs.readFile(fullPath, { encoding: 'utf8' })
	} catch {
		return null
	}
}

export const tmpDelete = async (filename: string): Promise<boolean> => {
	const fullPath = `${TMP_FOLDER}/${filename}`
	return (await fs.unlink(fullPath)) === undefined
}
