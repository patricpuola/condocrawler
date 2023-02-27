import express from 'express'
import apicache from 'apicache'
import { Request, Response } from 'express'
import { DevDatabaseStorage } from './storage/devDatabaseStorage'
import chalk from 'chalk'

export const startApi = () => {
	const port = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3000
	const host = process.env.API_HOST ? process.env.API_HOST : 'localhost'
	const app = express()
	const cache = apicache.middleware

	app.use(function (_, res, next) {
		res.header('Access-Control-Allow-Origin', '*')
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
		next()
	})

	app.get('/healthcheck', (req: Request, res: Response) => {
		res.sendStatus(200)
	})

	app.get('/listings/rental', cache('30 minutes'), async (req: Request, res: Response) => {
		const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined

		const storage = new DevDatabaseStorage()
		res.send(await storage.getRentalListings(limit))
	})

	app.get('/listings/sale', cache('30 minutes'), async (req: Request, res: Response) => {
		const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined

		const storage = new DevDatabaseStorage()
		res.send(await storage.getSaleListings(limit))
	})

	app.listen(port, host, () => console.log(chalk.blue('Server running on ') + chalk.yellow(`http://${host}:${port}`)))
}
