import AppSearchAPIConnector from '@elastic/search-ui-app-search-connector'
import React, { useState } from 'react'
import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  WithSearch,
} from '@elastic/react-search-ui'
import {
  BooleanFacet,
  Layout,
  SingleLinksFacet,
  SingleSelectFacet,
} from '@elastic/react-search-ui-views'
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
    },
    disjunctiveFacets: [''],
    facets: {},
  },
}

const App = () => {
  const [user, setUser] = useState<string>('johnDoe')

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUser(e.target.value)
  }

  return (
    <>
      <div>
        <select
          name='users'
          id='users'
          value={user}
          onChange={handleInputChange}
        >
          {users.map((user) => (
            <option key={user.id} value={user.username}>
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
              <div className='App'>
                <ErrorBoundary>
                  <Layout
                    header={<SearchBox debounceLength={0} />}
                    sideContent={<div></div>}
                    bodyContent={
                      <Results
                        titleField={'title' || 'name' || 'original_name'}
                        urlField='nps_link'
                        thumbnailField='image_url'
                        shouldTrackClickThrough
                        clickThroughTags={[user]}
                        resultView={({ result, onClickLink }: any) => (
                          <div>
                            <div>
                              <div>
                                <h4>{result?.title?.raw}</h4>
                                <div>{result?.extract?.raw}</div>
                              </div>
                              <div>
                                {result?.genres?.raw}
                                {result?.year?.raw}
                              </div>
                            </div>
                            <button onClick={onClickLink}>Click Me</button>
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
    </>
  )
}

export default App
