import AppSearchAPIConnector from '@elastic/search-ui-app-search-connector'
import React, { useEffect, useState, useRef } from 'react'
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
  // engineName: 'movies-engine-2010s',
  endpointBase: 'https://info4105.ent.us-central1.gcp.cloud.es.io/',
})

const API_ADDRESS = 'http://localhost:5000/api'

type User = {
  id: string
  name: string
  username: string
  gender: string
  country: string
  favorites: string[]
}

type Boosts = {
  type: string
  value: string[]
  operation: string
  factor: number
}[]

type BoostsQuery = Record<string, Boosts>

const defaultConfig: SearchDriverOptions = {
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
      extract: {},
      id: {},
    },
    disjunctiveFacets: [''],
    facets: {},
  },
}

const fetchUserPreferences = async (currUser: User) => {
  const response = await fetch(`${API_ADDRESS}/user/preferences/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user: currUser }),
  })

  const body = await response.json()

  if (response.status !== 200) throw Error(body.message)

  return body
}

const App = () => {
  const [currUser, setCurrUser] = useState<User>()
  const [userPreferences, setUserPreferences] = useState<{
    favorites: { document_id: string; clicks: number }[]
  }>()
  const [config, setConfig] = useState<
    SearchDriverOptions & { searchQuery?: { boosts?: BoostsQuery } }
  >(defaultConfig)

  const docTitleRef = useRef<string>()

  useEffect(() => {
    const titleBoosts: Boosts = []
    if (currUser && userPreferences) {
      for (const fav of userPreferences.favorites) {
        titleBoosts.push({
          type: 'value',
          value: [fav.document_id], // TODO change to document title
          operation: 'multiply',
          factor: fav.clicks,
        })
      }

      setConfig((prevState) => ({
        ...prevState,
        searchQuery: {
          ...prevState.searchQuery,
          boosts: {
            // id: idBoosts,
            // ! TEMP - change to title boosts when analytics works again
            title: [
              {
                type: 'value',
                value: ["Mary and the Witch's Flower"],
                operation: 'multiply',
                factor: 1,
              },
            ],
          },
          analytics: {
            tags: [currUser.username], // TODO change to ID
          },
        },
      }))
    }
  }, [userPreferences, currUser])

  useEffect(() => {
    if (currUser) {
      fetchUserPreferences(currUser)
        .then((res) => {
          if (res.body.results.length > 0) {
            setUserPreferences({ favorites: res.body.results })
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [currUser])

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = users.find((user) => user.id === e.target.value)

    if (selectedUser) setCurrUser(selectedUser)
    else setCurrUser(undefined)
  }

  return (
    <div className="bg-neutral">
      <div className="flex w-full component-preview p-4 items-center justify-center gap-2">
        <select
          className="w-full max-w-xs bg-slate-50"
          name="users"
          id="users"
          value={currUser?.id}
          onChange={handleInputChange}
        >
          <option value={undefined}>No user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <SearchProvider config={config}>
        <WithSearch
          mapContextToProps={({ wasSearched }) => ({
            wasSearched,
          })}
        >
          {({ wasSearched }) => {
            return (
              <div className="flex justify-center items-center">
                <ErrorBoundary>
                  <Layout
                    className="bg-blue-500"
                    header={<SearchBox debounceLength={0} />}
                    bodyContent={
                      <Results
                        shouldTrackClickThrough
                        clickThroughTags={[
                          currUser?.id ?? 'no-id',
                          docTitleRef?.current ?? '',
                        ]}
                        resultView={({ result, onClickLink }) => {
                          return (
                            <div className="card p-4 shadow-xl">
                              <div>
                                <h4 className="font-bold text-slate-800 text-xl">
                                  {result?.title?.raw}
                                </h4>
                                <div>{result?.extract?.raw}</div>
                              </div>
                              <div>
                                {result?.genres?.raw.map((genre: string) => (
                                  <span key={genre}>{genre} </span>
                                ))}
                              </div>
                              <div>Release Year: {result?.year?.raw}</div>
                              <div>Score: {result?._meta.score}</div>
                              <button
                                className="btn"
                                id={docTitleRef.current}
                                onClick={() => {
                                  docTitleRef.current = result?.title?.raw
                                  onClickLink()
                                }}
                              >
                                Like
                              </button>
                            </div>
                          )
                        }}
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
  )
}

export default App
