import * as React from 'react'
import { ChangeEventHandler, KeyboardEventHandler, MouseEventHandler } from 'react'
import { DragComponent, Draggable, Droppable } from 'react-dragtastic'
import { compose, withHandlers, withProps, withState } from 'recompose'
import { Chord, Chords, Position, Song } from '../model'
import $ from './Song.module.scss'

const { max } = Math

// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// CHORD OVERLAY
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────

interface ChordsOverlayOuterProps {
  rows: number,
  cols: number,
  chords: Chords,
  setChords: (next: Chords) => void,
  disabled?: boolean,
}

interface ChordsOverlayInnerProps extends ChordsOverlayOuterProps {
  moveChordTo: (to: Position) => (chord: Position & { chord: Chord }) => void
  inputChord: (to: Position) => MouseEventHandler
  setChordInput: (i: { x: number, y: number, position: Position } | null) => void
  chordInput: { x: number, y: number, position: Position } | null
}

const ChordsOverlay = compose<ChordsOverlayInnerProps, ChordsOverlayOuterProps>(

  withState('chordInput', 'setChordInput', null),

  withHandlers<ChordsOverlayInnerProps, Partial<ChordsOverlayInnerProps>>({
    moveChordTo: ({ chords, setChords }) => to => chord => {
      setChords([
        ...chords.filter(({ col, row }) => col !== chord.col || row !== chord.row),
        { ...chord, ...to },
      ])
    },

    inputChord: ({ setChordInput }) => position => event => {
      setChordInput({ x: event.clientX, y: event.clientY, position })
    },
  })

)(({ disabled, rows, cols, chords, setChords, moveChordTo, inputChord, chordInput, setChordInput }) =>

  <div className={$.ChordsOverlay}>
    {[...Array(rows).keys()].map(row =>
      <div key={`${row}`}> {[...Array(cols).keys()].map(col => {
        const index = col + row * cols
        const chordEntry = chords.find(c => c.col === col && c.row === row)
        const chord = chordEntry && chordEntry.chord

        return disabled ? <div key={`${index}`} className={$.chord}>{chord}</div> :
          chord
            ? [
              <Draggable id={`${index}`} key={`${index}`} type='chord' delay={1} data={chordEntry}>{({ events }) =>
                <div className={`${$.chord} ${$.draggable}`}{...events}>{chord}</div>
              }</Draggable>,

              <DragComponent key={`~${index}`} for={`${index}`}>{({ x, y }) => (
                <div className={`${$.chord} ${$.dragging}`} style={{ left: x - 8, top: y - 8 }}>{chord}</div>
              )}</DragComponent>,
            ] :
            <Droppable key={`${index}`} accepts='chord' onDrop={moveChordTo({ col, row })}>{({ events, isDragging }) =>
              <div className={isDragging ? $.dropzone : $.chord} {...events} onDoubleClick={inputChord({ col, row })} />
            }</Droppable>
      }
      )} </div>
    )}

    <input className={$.ChordInput}
      ref={dom => {
        if (dom && chordInput) {
          dom.value = ''
          dom.focus()
        }
      }}
      style={chordInput ? { top: chordInput.y, left: chordInput.x } : { display: 'none' }}
      onBlur={() => setChordInput(null)}
      onKeyDown={event => {
        if (event.key === 'Enter' && chordInput) {
          setChords([...chords, { chord: event.currentTarget.value, ...chordInput.position }])
          setChordInput(null)
        }
      }}
    />
  </div >

)

// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// EDIT SONG
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────

interface SongOuterProps {
  song: Song,
  setSong: (next: Song) => void,
  disabled?: boolean,
}

interface SongInnerProps extends SongOuterProps {
  setChords: (chord: Chords) => void
  hasUnsavedChanges: boolean
  onLyricsChange: ChangeEventHandler<HTMLTextAreaElement>
  onLyricsKeyDown: KeyboardEventHandler<HTMLTextAreaElement>
  cols: number
  rows: number
}

const Song = compose<SongInnerProps, SongOuterProps>(

  withProps(({ song }: SongInnerProps) => {
    const verseLyrics = song.lyrics.split('\n')

    return {
      rows: max(verseLyrics.length, ...song.chords.map(({ row }) => row + 1)),
      cols: max(...verseLyrics.map(lyrics => lyrics.length), ...song.chords.map(({ col }) => col + 1)),
    }
  }),

  withHandlers<SongInnerProps, Partial<SongInnerProps>>({

    setChords: ({ song, setSong }) => chords => setSong({ ...song, chords }),

    onLyricsChange: ({ song, setSong }) => event => {
      setSong({ ...song, lyrics: event.target.value })
    },

    // TODO: Can we refactor this code to make it clearer?
    onLyricsKeyDown: ({ song, setSong }) => event => {

      if (event.shiftKey) {
        const caret = event.currentTarget.selectionEnd
        const rowsUntilCaret = song.lyrics.slice(0, caret).split('\n')
        const row = rowsUntilCaret.length - 1
        const col = rowsUntilCaret[row].length

        switch (event.key) {
          case 'Enter':
            return setSong({
              ...song,
              chords: song.chords.map(chord =>
                chord.row === row && chord.col >= col ? { ...chord, row: chord.row + 1, col: chord.col - col } :
                  chord.row > row ? { ...chord, row: chord.row + 1 } : chord
              ),
            })

          case ' ':
            return setSong({
              ...song,
              chords: song.chords.map(chord =>
                chord.row === row && chord.col >= col ? { ...chord, col: chord.col + 1 } : chord
              ),
            })

          case 'Backspace':
            setSong({
              ...song,
              chords: song.chords
                .filter(chord => chord.row !== row || chord.col !== col - 1)
                .map(chord => chord.row === row && chord.col >= col ? { ...chord, col: chord.col - 1 } : chord),
            })

            if (col === 0 && row > 0) {
              setSong({
                ...song,
                chords: song.chords.map(chord =>
                  chord.row === row ? { ...chord, row: chord.row - 1, col: chord.col + rowsUntilCaret[row - 1].length } :
                    chord.row > row ? { ...chord, row: chord.row - 1 } :
                      chord
                ),
              })
            }
            return

          case 'Delete':
            // TODO: Trigger lyrics deletion too (without sending the caret to the end of the textarea)
            setSong({
              ...song,
              chords: song.chords
                .filter(chord => chord.row !== row || chord.col !== col)
                .map(chord => chord.row === row && chord.col >= col ? { ...chord, col: chord.col - 1 } : chord),
            })
            event.preventDefault()

            if (song.lyrics[caret] === '\n') {
              setSong({
                ...song,
                chords: song.chords.map(chord =>
                  chord.row === row + 1 ? { ...chord, row, col: chord.col + col } :
                    chord.row > row ? { ...chord, row: chord.row - 1 } :
                      chord
                ),
              })
            }

            return
        }
      }

      // TODO: Move up/Down
      // TODO: Copy up/down
      // TODO: insert chord
      // TODO: What if there is an actual selection?
      // TODO: save

    },
  }),

)(({ song, disabled, rows, cols, setChords, onLyricsChange, onLyricsKeyDown }) =>
  <div className={$.EditSong}>
    <textarea disabled={disabled} rows={rows} cols={cols} value={song.lyrics} onChange={onLyricsChange} onKeyDown={onLyricsKeyDown} />
    <ChordsOverlay disabled={disabled} rows={rows} cols={cols} chords={song.chords} setChords={setChords} />
  </div>
)

export default Song