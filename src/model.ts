export const CURRENT_SONG_VERSION = 1
export const SONG_MIME_TYPE = 'application/song'


export interface Song {
  version: number,
  title: string,
  author: string,
  lyrics: Lyrics,
  chords: Chords,
}

export type Lyrics = string
export type Chord = string
export type Chords = ReadonlyArray<Position & { chord: Chord }>
export interface Position { col: number, row: number }