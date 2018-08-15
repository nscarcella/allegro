import SongEditor from '@components/Song'
import { readFile } from '@services/google'
import { History } from 'history'
import { ChangeEventHandler } from 'react'
import * as React from 'react'
import { FiEdit as EditIcon, FiSave as SaveIcon } from 'react-icons/fi'
import { withRouter } from 'react-router'
import { compose, lifecycle, withHandlers, withState } from 'recompose'
import { Action, Sidebar } from '../components/Sidebar'
import { Song, SONG_MIME_TYPE } from '../model'
import { updateFile } from '../services/google'
import { t } from '../services/i18n'
import $ from './song.page.module.scss'

interface SongPageOuterProps {
  songId: string,
  edit: boolean,
}

interface SongPageInnerProps extends SongPageOuterProps {
  history: History,
  song: Song | null,
  setSong: (next: Song) => void,
  handleSaveChanges: (next: Song) => () => Promise<void>,
  handleTitleChange: ChangeEventHandler<HTMLInputElement>,
  handleAuthorChange: ChangeEventHandler<HTMLInputElement>,
}

const SongPage = compose<SongPageInnerProps, SongPageOuterProps>(
  withRouter,
  withState('song', 'setSong', null),

  withHandlers<SongPageInnerProps, Partial<SongPageInnerProps>>({
    handleSaveChanges: ({ history, song, songId }) => (next) => async () => {
      const name = `${song!.author} - ${song!.title}`
      await updateFile(songId, {
        name,
        mimeType: SONG_MIME_TYPE,
        contentHints: { indexableText: `<head><title>${name}</title></head><body>${song!.lyrics}</body>` },
      }, JSON.stringify(next))
      history.push('..')
    },

    handleTitleChange: ({ setSong, song }) => event => song && setSong({ ...song, title: event.target.value }),

    handleAuthorChange: ({ setSong, song }) => event => song && setSong({ ...song, author: event.target.value }),
  }),

  lifecycle<SongPageInnerProps, {}>({
    async componentDidMount() {
      const song = await readFile<Song>(this.props.songId)
      this.props.setSong(song)
    },
  }),

)(({ history, song, edit, setSong, handleSaveChanges, handleTitleChange, handleAuthorChange }) =>

  <div className={$.SongPage}>{
    song ? (
      edit ? (
        <div>
          <Sidebar>
            <Action name={t('Song.save')} Icon={SaveIcon} onClick={handleSaveChanges(song)} />
          </Sidebar>
          <div className={$.content}>
            <input className={$.title} value={song.title} onChange={handleTitleChange} />
            <input className={$.author} value={song.author} onChange={handleAuthorChange} />
            <SongEditor song={song} setSong={setSong} />
          </div>
        </div>
      ) : (
          <div>
            <Sidebar>
              <Action name={t('Song.edit')} Icon={EditIcon} onClick={async () => history.push('./edit/')} />
            </Sidebar>
            <div className={$.content}>
              <input disabled className={$.title} value={song.title} onChange={handleTitleChange} />
              <input disabled className={$.author} value={song.author} onChange={handleAuthorChange} />
              <SongEditor disabled song={song} setSong={setSong} />
            </div>
          </div>
        )
    ) : 'Aguantá'  // TODO:
  }</div>

)

export default SongPage