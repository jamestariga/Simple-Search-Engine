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
import { User, Boosts, BoostsQuery } from './types/types'
import users from './components/data/users'
import Recommendation from './components/Recommendation/Recommendation'

const connector = new AppSearchAPIConnector({
  searchKey: 'search-xkqbex2iqsrpsgg53ydfm16r',
  engineName: 'movies-engine',
  // engineName: 'movies-engine-2010s',
  endpointBase: 'https://info4105.ent.us-central1.gcp.cloud.es.io/',
})

const API_ADDRESS = 'http://localhost:9999/api'

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
      cast: { raw: {} },
    },
    search_fields: {
      title: {},
      genres: {},
      extract: {},
      id: {},
      cast: {},
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
  const [currUser, setCurrUser] = useState<User>(users[0])
  const [userPreferences, setUserPreferences] = useState<{
    favorites: {
      document_id: string
      clicks: number
      title: string
      cast: string[]
      genres: string[]
    }[]
  }>()
  const [config, setConfig] = useState<
    SearchDriverOptions & { searchQuery?: { boosts?: BoostsQuery } }
  >(defaultConfig)

  useEffect(() => {
    const titleBoosts: Boosts = []
    const castsBoosts: Boosts = []
    const genresBoosts: Boosts = []
    if (currUser && userPreferences) {
      for (const fav of userPreferences.favorites) {
        if (fav.title !== '') {
          titleBoosts.push({
            type: 'value',
            value: [fav.title],
            operation: 'multiply',
            factor: fav.clicks * 10,
          })
        }

        const filteredCast = fav.cast.filter((cast) => cast !== '')

        if (filteredCast.length > 0) {
          castsBoosts.push({
            type: 'value',
            value: [...filteredCast],
            operation: 'multiply',
            factor: fav.clicks * 10,
          })
        }

        const filteredGenres = fav.genres.filter((genre) => genre !== '')

        genresBoosts.push({
          type: 'value',
          value: [...filteredGenres],
          operation: 'multiply',
          factor: fav.clicks * 10,
        })
      }
      if (currUser.username !== 'no-id') {
        setConfig((prevState) => ({
          ...prevState,
          searchQuery: {
            ...prevState.searchQuery,
            boosts: {
              title: titleBoosts,
              cast: castsBoosts,
              genres: genresBoosts,
            },
            analytics: {
              tags: [currUser.username],
            },
          },
        }))
      } else {
        setConfig(defaultConfig)
      }
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
  }

  return (
    <div className="bg-neutral">
      <div className="flex w-full component-preview p-4 items-center justify-center gap-2">
        <select
          className="w-full max-w-xs bg-slate-50 text-black"
          name="users"
          id="users"
          value={currUser.id}
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
                      <>
                        {currUser.id !== 'no-id' ? (
                          <Recommendation {...currUser} />
                        ) : null}
                        <Results
                          shouldTrackClickThrough
                          clickThroughTags={[currUser?.id ?? 'no-id']}
                          resultView={({ result, onClickLink }) => {
                            return (
                              <div className="card p-4 shadow-xl text-gray-500">
                                <div>
                                  <h4 className="font-bold text-slate-900 text-xl">
                                    {result?.title?.raw}
                                  </h4>
                                  <div>
                                    {result?.extract?.raw.substring(0, 250)} ...
                                  </div>
                                </div>
                                <div>
                                  {result?.cast?.raw.length ? (
                                    <div>
                                      Cast: {result.cast.raw.join(', ')}
                                    </div>
                                  ) : null}
                                </div>
                                <div>
                                  {result?.genres?.raw.map((genre: string) => (
                                    <span key={genre}>{genre} </span>
                                  ))}
                                </div>
                                <div>Release Year: {result?.year?.raw}</div>
                                <div>Score: {result?._meta.score}</div>
                                <button
                                  className="btn text-white bg-blue-500"
                                  onClick={() => {
                                    setCurrUser((prevState) => ({
                                      ...prevState,
                                      favorites: result?.title?.raw,
                                    }))
                                    onClickLink()
                                  }}
                                >
                                  Like
                                </button>
                              </div>
                            )
                          }}
                        />
                      </>
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
