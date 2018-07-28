import Header from '@components/Header'
import SongPage from '@pages/Song.page'
import * as google from '@services/google'
import * as i18n from '@services/i18n'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { CURRENT_SONG_VERSION, Song, SONG_MIME_TYPE } from './model'
import registerServiceWorker from './registerServiceWorker'

const App = () =>
  <BrowserRouter>
    <div>
      <Header />
      <Switch>
        <Route exact path='/song/create/:folderId' render={({ history, match: { params } }) => {
          const song: Song = {
            version: CURRENT_SONG_VERSION,
            title: 'Untitled Song',
            author: 'Unknown Author',
            chords: [],
            lyrics: '',
          }

          google
            .createFile(
              {
                name: `${song.author} - ${song.title}`,
                mimeType: SONG_MIME_TYPE,
                parents: [params.folderId],
                // TODO: Thumbnails? https://developers.google.com/drive/api/v3/file#uploading_thumbnails
                // contentHints: {
                //   thumbnail: {
                //     image: 'iVBORw0KGgoAAAANSUhEUgAAANwAAAAUCAYAAADm4VNYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQU' +
                //       'AAAAJcEhZcwAADsQAAA7EAZUrDhsAAABaSURBVHhe7dMxAcAgEMDALzo61r-zaoAFDZnulijI87_fHiCxboGA4SBkOAgZD' +
                //       'kKGg5DhIGQ4CBkOQoaDkOEgZDgIGQ5ChoOQ4SBkOAgZDkKGg5DhIGQ4yMwcJVwCVCif97cAAAAASUVORK5CYII',
                //     mimeType: 'image/png',
                //   },
                // },
              }, JSON.stringify(song))
            .then(songId => history.push(`/song/${songId}/edit/`))

          return null
        }} />
        <Route exact path='/song/:songId/edit/' render={({ match: { params } }) => <SongPage edit {...params} />} />
        <Route exact path='/song/:songId/' render={({ match: { params } }) => <SongPage {...params} />} />
      </Switch>
    </div>
  </BrowserRouter >

async function launch() {
  await Promise.all([
    google.init(),
    i18n.init(),
  ])

  ReactDOM.render(<App />, document.getElementById('root'))
  registerServiceWorker()
}
launch()
