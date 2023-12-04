import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { Client } from '@elastic/enterprise-search'
import { Client as ElasticClient } from '@elastic/elasticsearch'

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
  let formattedResponse: any[] = []
  if (docIds.length > 0) {
    const documentsResponse = await client.app.getDocuments({
      engine_name: 'movies-engine',
      documentIds: docIds,
    })

    if (!documentsResponse) {
      throw new Error('No documents found')
    }

    console.log(documentsResponse)

    formattedResponse = response.results.map((res) => {
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
  }

  res.status(200).json({ body: { results: formattedResponse } })
})

app.post('/api/user/similar', async (req, res) => {
  if (req.body.favorites === '') return res.send([])

  const client = new ElasticClient({
    cloud: {
      id: 'info4105:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQwNTI5MTZmMWM2MTY0ZGM2YjkxMmZmZWFlNGU2MDdlMiRlZjUwZjJlZmQ4MDk0NTlkYjc0M2Q1NmE5YjhkZGM5Nw==',
    },
    auth: {
      username: 'elastic',
      password: 'GchssHIi0OjeDzMMHJNfQnsS',
    },
  })

  const response = await client.search({
    index: 'movies-embed-new',
    query: {
      match: {
        title: req.body.favorites,
      },
    },
  })

  const data: any[] = response?.hits?.hits as any

  const body = await client.search({
    index: 'movies-embed-new',
    _source: ['title', 'extract'],

    knn: {
      field: 'ml.inference.extract.predicted_value',
      query_vector: data[0]._source.ml.inference.extract.predicted_value, // TODO: Give it a better type
      k: 10,
      num_candidates: 100,
    },
  })

  res.status(200).json({ data: body.hits.hits })
})

app.listen(port, () => console.log(`Listening on port ${port}`))
