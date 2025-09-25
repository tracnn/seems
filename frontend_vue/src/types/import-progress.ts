export interface ImportProgressData {
  success: boolean
  phase: string
  message: string
  row?: number
  inserted?: number
  total?: number
}

export interface SSEEventData {
  event: string
  data: ImportProgressData
  at: string
}

export interface SSEEvent {
  data: SSEEventData
}

export enum ImportPhase {
  PARSING_EXCEL = 'PARSING_EXCEL',
  INSERTING_SLOTS = 'INSERTING_SLOTS',
  INSERTED_SLOTS = 'INSERTED_SLOTS',
  ERROR = 'ERROR'
}

export interface ImportProgressState {
  isImporting: boolean
  currentPhase: ImportPhase | null
  progress: number
  message: string
  inserted: number
  total: number
  errors: Array<{
    row: number
    message: string
  }>
  isCompleted: boolean
  isError: boolean
  lastUpdateTime: string | null
}
