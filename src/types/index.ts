export interface Rule {
    id: number
    match: string
    replace: string
    enabled: boolean
    isEditing: boolean
}

export interface HeaderRule {
    id: number
    match: string
    headerName: string
    headerValue: string
    enabled: boolean
    isEditing: boolean
    type: 'request' | 'response'
}