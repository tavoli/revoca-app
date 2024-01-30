export interface Target {
  bookId: number | null
  sentenceId: number | null
  pin: string | null
  context: string | null
}

export interface PostPin {
  book_id: number
  sentence_id: number
  pin: string
}

export interface Sentence {
  id: number
  sentence: string
}

export interface Pin {
  id: number
  pin: string
  synonyms: string[]
  definitions: string[]
  parts_of_speech: string[]
}
