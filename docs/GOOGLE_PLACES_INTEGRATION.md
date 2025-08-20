# Google Places API Integration

This project now includes comprehensive Google Places API integration for address autocomplete, place search, and geocoding functionality.

## Setup

### 1. Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API** - For place search and autocomplete
   - **Geocoding API** - For address to coordinates conversion
   - **Maps JavaScript API** - For maps integration (if needed)

4. Create an API key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Restrict the key to your domain for production use
   - Add the key to your environment variables

### 2. Environment Configuration

Add your API key to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important**: The API key must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

### 3. API Quota and Billing

- Google Places API has usage quotas
- Set up billing in Google Cloud Console for production use
- Monitor usage through the Google Cloud Console

## Features

### 1. Address Input with Autocomplete

```tsx
import { AddressInput } from '@/components/shared/AddressInput'

function MyComponent() {
  const handleAddressChange = (location) => {
    console.log('Selected location:', location)
    // Contains: coordinates, formatted address, parsed components
  }

  return (
    <AddressInput
      label="Delivery Address"
      placeholder="Enter address..."
      onChange={handleAddressChange}
      showCurrentLocationButton={true}
      required
    />
  )
}
```

### 2. Places Search

```tsx
import { PlacesSearch } from '@/components/shared/PlacesSearch'

function MyComponent() {
  const handlePlaceSelect = (place) => {
    console.log('Selected place:', place)
    // Contains: name, address, coordinates, ratings, photos, etc.
  }

  return (
    <PlacesSearch
      placeholder="Search for restaurants, hotels..."
      onPlaceSelect={handlePlaceSelect}
      showFilters={true}
    />
  )
}
```

### 3. Custom Hooks

```tsx
import { 
  useSearchPlaces, 
  useAutocomplete, 
  useGeocode,
  useCurrentLocation 
} from '@/lib/hooks/useGooglePlaces'

function MyComponent() {
  // Search places
  const searchMutation = useSearchPlaces()
  
  // Autocomplete suggestions
  const { data: suggestions } = useAutocomplete('pizza restaurant', {
    enabled: true,
    location: { lat: 40.7128, lng: -74.0060 }
  })
  
  // Geocoding
  const geocodeMutation = useGeocode()
  
  // Current location
  const { location, getCurrentLocation } = useCurrentLocation()
}
```

### 4. Direct API Usage

```tsx
import { googlePlacesService } from '@/lib/services/googlePlaces'

// Search places
const places = await googlePlacesService.searchPlaces({
  query: 'coffee shops near me',
  location: { lat: 40.7128, lng: -74.0060 },
  radius: 5000
})

// Geocode address
const location = await googlePlacesService.geocodeAddress('1600 Amphitheatre Parkway, Mountain View, CA')

// Reverse geocode
const address = await googlePlacesService.reverseGeocode(37.4419, -122.1430)
```

## API Endpoints

The integration includes several API endpoints:

- `GET /api/places/search` - Search for places
- `GET /api/places/autocomplete` - Get autocomplete suggestions  
- `GET /api/places/geocode` - Geocode addresses
- `GET /api/places/[placeId]` - Get place details

## Data Structure

### LocationDetails Interface

```typescript
interface LocationDetails {
  place_id: string
  name: string
  formatted_address: string
  coordinates: { lat: number; lng: number }
  
  // Parsed address components
  street_number: string
  street_name: string
  city: string
  state: string
  country: string
  postal_code: string
  
  // Optional place data
  phone?: string
  website?: string
  rating?: number
  photos?: PlacePhoto[]
  opening_hours?: PlaceOpeningHours
  types: string[]
}
```

## Integration Examples

### Package Form Integration

The `PackageForm` component now uses Google Places API for pickup and delivery addresses:

```tsx
// Automatically integrated in PackageForm
// Users get autocomplete for pickup/delivery addresses
// Coordinates are automatically extracted and saved
```

### Trip Form Integration

Similar integration can be added to trip forms for origin/destination addresses.

## Error Handling

The integration includes comprehensive error handling:

- Network failures
- API quota exceeded
- Invalid API keys
- No results found
- Geolocation denied

## Best Practices

1. **Rate Limiting**: The API has usage limits - implement debouncing for autocomplete
2. **Caching**: Results are cached for 5-30 minutes to reduce API calls
3. **Fallbacks**: Always provide manual input options if API fails
4. **Security**: Restrict API keys to specific domains in production
5. **Monitoring**: Track API usage through Google Cloud Console

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Ensure the key is prefixed with `NEXT_PUBLIC_`
   - Check that required APIs are enabled
   - Verify domain restrictions

2. **No Autocomplete Suggestions**
   - Check browser console for errors
   - Verify API quota hasn't been exceeded
   - Ensure input length is > 2 characters

3. **Geocoding Fails**
   - Check address format
   - Try with different address components
   - Verify API is enabled

### Debug Mode

Set environment variable for debugging:

```bash
DEBUG_GOOGLE_PLACES=true
```

## Demo Page

Visit `/examples/places` to see a live demonstration of all features.

## Cost Considerations

- **Autocomplete**: ~$0.017 per session
- **Places Search**: ~$0.032 per request  
- **Geocoding**: ~$0.005 per request
- **Place Details**: ~$0.017 per request

Monitor usage and set up billing alerts in Google Cloud Console.
