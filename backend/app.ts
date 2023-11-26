import express from 'express'
import bodyParser from 'body-parser'
import { Client } from '@elastic/enterprise-search'

const app = express()

const port = process.env.PORT || 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/api/user/preferences', async (req, res) => {
  const client = await new Client({
    url: 'https://0ad42cf775234ba1a5a86b93f010a06a.ent-search.us-central1.gcp.cloud.es.io/',
    auth: {
      token: 'search-xkcbmhnb3angyddqhsrmzcxi',
    },
  })

  const body = await client.app.getTopClicksAnalytics({
    engine_name: 'movies',
    body: {
      filters: {
        tag: req.body.userId,
      },
      page: {
        size: 10,
      },
    },
  })

  res.status(200).json({ body })
})

app.listen(port, () => console.log(`Listening on port ${port}`))
