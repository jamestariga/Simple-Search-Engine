import AppSearchAPIConnector from '@elastic/search-ui-app-search-connector'
import React, { useEffect, useState } from 'react'
import {
  ErrorBoundary,
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  WithSearch,
} from '@elastic/react-search-ui'
import { Layout } from '@elastic/react-search-ui-views'
import '@elastic/react-search-ui-views/lib/styles/styles.css'
import { SearchDriverOptions } from '@elastic/search-ui'
import users from './components/data/users'

const connector = new AppSearchAPIConnector({
  searchKey: 'search-xkqbex2iqsrpsgg53ydfm16r',
  engineName: 'movies-engine',
  endpointBase: 'https://info4105.ent.us-central1.gcp.cloud.es.io/',
})

const config: SearchDriverOptions = {
  alwaysSearchOnInitialLoad: true,
  apiConnector: connector,
  hasA11yNotifications: true,
  trackUrlState: true,
  searchQuery: {
    result_fields: {
      title: { raw: {} },
      genres: { raw: {} },
      year: { raw: {} },
      extract: { raw: {} },
    },
    search_fields: {
      title: {},
      genres: {},
      year: {},
      extract: {},
      id: {},
    },
    disjunctiveFacets: [''],
    facets: {},
  },
}

const App = () => {
  const [user, setUser] = useState<any>({})
  const [userPreferences, setUserPreferences] = useState<any>()
  const [configs, setConfigs] = useState<SearchDriverOptions>(config)

  useEffect(() => {
    const idBoosts = []
    if (userPreferences) {
      for (const fav of userPreferences?.favorites) {
        idBoosts.push({
          type: 'value',
          value: [fav.document_id],
          operation: 'multiply',
          factor: fav.clicks,
        })
      }

      console.log(idBoosts)
    }

    setConfigs({
      ...configs,
      searchQuery: {
        ...configs.searchQuery,
        boosts: {
          genres: idBoosts,
        },
        analytics: {
          tags: [user.username],
        },
      },
    })
  }, [userPreferences])

  console.log(configs)

  useEffect(() => {
    if (user) {
      fetchUserPreferences(user.id)
        .then((res) => {
          if (res.body.results.length > 0) {
            setUserPreferences({ favorites: res.body.results })
            console.log(res.body.results)
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [user])

  const fetchUserPreferences = async (userId: number) => {
    const response = await fetch(
      'http://localhost:5000/api/user/preferences/',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      }
    )

    const body = await response.json()

    if (response.status !== 200) throw Error(body.message)

    return body
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUser(users.find((user) => user.id === e.target.value))
  }

  return (
    <>
      <div className='bg-neutral'>
        <div className='flex w-full component-preview p-4 items-center justify-center gap-2'>
          <select
            className='w-full max-w-xs bg-slate-50'
            name='users'
            id='users'
            value={user.id}
            onChange={handleInputChange}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <SearchProvider config={config}>
          <WithSearch
            mapContextToProps={({ wasSearched }: any) => ({
              wasSearched,
            })}
          >
            {({ wasSearched }: any) => {
              return (
                <div className='flex justify-center items-center'>
                  <ErrorBoundary>
                    <Layout
                      className='bg-blue-500'
                      header={<SearchBox debounceLength={0} />}
                      // sideContent={<div></div>}
                      bodyContent={
                        <Results
                          titleField={'title' || 'name' || 'original_name'}
                          urlField='nps_link'
                          thumbnailField='image_url'
                          shouldTrackClickThrough
                          clickThroughTags={[user.id]}
                          resultView={({ result, onClickLink }: any) => (
                            <div className='card p-4 shadow-xl'>
                              <div>
                                <h4 className='font-bold text-slate-800 text-xl'>
                                  {result?.title?.raw}
                                </h4>
                                <div>{result?.extract?.raw}</div>
                              </div>
                              <div>
                                {result?.genres?.raw.map((genre: string) => (
                                  <span key={genre}>{genre} </span>
                                ))}
                                {result?.year?.raw}
                              </div>
                              <button className='btn' onClick={onClickLink}>
                                Click Me
                              </button>
                            </div>
                          )}
                        />
                      }
                      bodyHeader={
                        <React.Fragment>
                          {wasSearched && <PagingInfo />}
                          {wasSearched && <ResultsPerPage />}
                        </React.Fragment>
                      }
                      bodyFooter={<Paging />}
                    />
                  </ErrorBoundary>
                </div>
              )
            }}
          </WithSearch>
        </SearchProvider>
      </div>
    </>
  )
}

export default App
