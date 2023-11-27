import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { Client } from '@elastic/enterprise-search'

const app = express()
app.use(cors())

const port = process.env.PORT || 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', async (req, res) => {
  res.send('Hello World!')
})

app.post('/api/user/preferences', async (req, res) => {
  const client = await new Client({
    url: 'https://info4105.ent.us-central1.gcp.cloud.es.io/',
    auth: {
      token: 'private-pya69tudggevgncorqtwkrvv',
    },
  })

  const body = await client.app.getTopClicksAnalytics({
    engine_name: 'movies-engine',
    body: {
      filters: {
        tag: req.body.user,
      },
      page: {
        size: 10,
      },
    },
  })

  res.status(200).json({ body })
})

app.listen(port, () => console.log(`Listening on port ${port}`))
