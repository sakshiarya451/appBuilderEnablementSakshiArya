/*
* <license header>
*/

import React from 'react'
import { Provider, defaultTheme, Grid, View } from '@adobe/react-spectrum'
import ErrorBoundary from 'react-error-boundary'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import SideBar from './SideBar'
import ActionsForm from './ActionsForm'
import { Home } from './Home'
import { About } from './About'
import { Chatbot } from './Chatbot'

function App (props) {
  console.log('runtime object:', props.runtime)
  console.log('ims object:', props.ims)

  props.runtime.on('configuration', ({ imsOrg, imsToken, locale }) => {
    console.log('configuration change', { imsOrg, imsToken, locale })
  })
  props.runtime.on('history', ({ type, path }) => {
    console.log('history change', { type, path })
  })

  return (
    <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
      <Router>
        <Provider theme={defaultTheme} colorScheme={'light'}>
          <Grid
            areas={['sidebar content']}
            columns={['256px', '1fr']}
            rows={['auto']}
            height='100vh'
            gap='size-0'
          >
            <View gridArea='sidebar' backgroundColor='gray-200' padding='size-200'>
              <SideBar />
            </View>
            <View gridArea='content' height='100vh' overflow='hidden'>
              <Routes>
                <Route path='/' element={<View padding='size-200'><Home /></View>} />
                <Route path='/chatbot' element={<Chatbot ims={props.ims} />} />
                <Route path='/actions' element={<View padding='size-200'><ActionsForm runtime={props.runtime} ims={props.ims} /></View>} />
                <Route path='/about' element={<View padding='size-200'><About /></View>} />
              </Routes>
            </View>
          </Grid>
        </Provider>
      </Router>
    </ErrorBoundary>
  )

  function onError (e, componentStack) { }

  function fallbackComponent ({ componentStack, error }) {
    return (
      <React.Fragment>
        <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Something went wrong :(</h1>
        <pre>{componentStack + '\n' + error.message}</pre>
      </React.Fragment>
    )
  }
}

export default App
