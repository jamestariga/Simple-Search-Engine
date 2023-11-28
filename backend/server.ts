import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { Client } from '@elastic/enterprise-search'

const app = express()
app.use(cors())

const port = process.env.PORT ?? 9999

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

  const response = await client.app.getTopClicksAnalytics({
    engine_name: 'movies-engine',
    // engine_name: 'movies-engine-2010s', // For testing
    body: {
      filters: {
        tag: req.body.user.username,
      },
      page: {
        size: 5,
      },
    },
  })

  const docIds = response.results.map((res) => res.document_id)

  const documentsResponse = await client.app.getDocuments({
    engine_name: 'movies-engine',
    documentIds: docIds,
  })

  if (!documentsResponse) {
    throw new Error('No documents found')
  }

  console.log(documentsResponse)

  const formattedResponse = response.results.map((res) => {
    const foundDocument = documentsResponse.find(
      (doc) => doc?.id === res.document_id
    )

    if (!foundDocument) {
      throw new Error('No document found')
    }

    return {
      ...res,
      title: foundDocument.title,
      cast: foundDocument.cast,
      genres: foundDocument.genres,
    }
  })

  res.status(200).json({ body: { results: formattedResponse } })
})

app.listen(port, () => console.log(`Listening on port ${port}`))
