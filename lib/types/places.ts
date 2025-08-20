// Google Places API types and interfaces

export interface PlaceLocation {
  lat: number
  lng: number
}

export interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

export interface PlaceGeometry {
  location: PlaceLocation
  viewport?: {
    northeast: PlaceLocation
    southwest: PlaceLocation
  }
}

export interface PlacePhoto {
  height: number
  width: number
  photo_reference: string
  html_attributions: string[]
}

export interface PlaceOpeningHours {
  open_now: boolean
  periods?: Array<{
    close?: { day: number; time: string }
    open: { day: number; time: string }
  }>
  weekday_text?: string[]
}

export interface GooglePlace {
  place_id: string
  name: string
  formatted_address: string
  geometry: PlaceGeometry
  address_components: AddressComponent[]
  international_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  photos?: PlacePhoto[]
  opening_hours?: PlaceOpeningHours
  types: string[]
  price_level?: number
}

export interface ParsedAddress {
  street_number: string
  street_name: string
  city: string
  state: string
  state_code: string
  country: string
  country_code: string
  postal_code: string
  county: string
  district: string
  sublocality: string
  neighborhood: string
  formatted_address: string
}

export interface LocationDetails extends ParsedAddress {
  place_id: string
  name: string
  coordinates: PlaceLocation
  phone?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  photos?: PlacePhoto[]
  opening_hours?: PlaceOpeningHours
  types: string[]
  price_level?: number
}

export interface PlacesSearchRequest {
  query: string
  location?: PlaceLocation
  radius?: number
  type?: string
  language?: string
  region?: string
  minprice?: number
  maxprice?: number
  opennow?: boolean
}

export interface PlacesSearchResponse {
  results: GooglePlace[]
  status: string
  error_message?: string
  next_page_token?: string
}

export interface AutocompleteRequest {
  input: string
  location?: PlaceLocation
  radius?: number
  language?: string
  types?: string
  components?: string
  strictbounds?: boolean
}

export interface AutocompletePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
    main_text_matched_substrings: Array<{
      offset: number
      length: number
    }>
  }
  types: string[]
  terms: Array<{
    offset: number
    value: string
  }>
}

export interface AutocompleteResponse {
  predictions: AutocompletePrediction[]
  status: string
  error_message?: string
}
