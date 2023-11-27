import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { Client } from '@elastic/enterprise-search'

const app = express()
app.use(cors())

const port = process.env.PORT ?? 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', async (req, res) => {
  res.send('Hello World!')
})

app.post('/api/user/preferences', async (req, res) => {
  const client = new Client({
    url: 'https://info4105.ent.us-central1.gcp.cloud.es.io/',
    auth: {
      token: 'private-pya69tudggevgncorqtwkrvv',
    },
  })

  const body = await client.app.getTopClicksAnalytics({
    engine_name: 'movies-engine',
    // engine_name: 'movies-engine-2010s', // For testing
    body: {
      filters: {
        tag: req.body.user.username, // TODO change to ID
      },
      page: {
        size: 5,
      },
    },
  })

  res.status(200).json({ body })
})

app.listen(port, () => console.log(`Listening on port ${port}`))
