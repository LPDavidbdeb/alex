import os
import requests
import googlemaps
from dotenv import load_dotenv

def test_google_services():
    load_dotenv()
    
    # 1. Test Google Maps JavaScript API Key (Simple Geocoding request via HTTP)
    # Note: JavaScript API keys usually restrict themselves to certain referrers, 
    # but we can try a server-side check for validity.
    maps_key = os.getenv('GOOGLE_MAP_JAVASCRIPT_API_KEY')
    print(f"--- Testing Google Maps API Key: {maps_key[:10]}... ---")
    
    try:
        gmaps = googlemaps.Client(key=maps_key)
        # Geocode RM Logistic's address in Montreal
        geocode_result = gmaps.geocode('507 Place d\'Armes, Montréal, QC')
        if geocode_result:
            print("✅ Google Maps API: SUCCESS (Geocoding worked)")
        else:
            print("❌ Google Maps API: FAILED (Empty result)")
    except Exception as e:
        print(f"❌ Google Maps API: ERROR - {str(e)}")

    # 2. Test Google Places API Key
    places_key = os.getenv('GOOGLE_PLACES_API_KEY')
    print(f"\n--- Testing Google Places API Key: {places_key[:10]}... ---")
    
    try:
        # We can use the same client logic if the key supports it
        gplaces = googlemaps.Client(key=places_key)
        # Find RM Logistic
        place_result = gplaces.places('RM Logistic Montreal')
        if place_result.get('results'):
            print("✅ Google Places API: SUCCESS (Found place)")
        else:
            print("❌ Google Places API: FAILED (No results found)")
    except Exception as e:
        print(f"❌ Google Places API: ERROR - {str(e)}")

    # 3. Test Google OAuth Credentials (Client ID & Secret validity check)
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
    print(f"\n--- Testing Google OAuth Credentials ---")
    print(f"Client ID: {client_id[:20]}...")
    
    try:
        # A simple way to check if the secret/id pair is recognized by Google 
        # is to hit the token info or a public discovery endpoint, 
        # but the best server-side check without a user token is checking the configuration endpoint.
        auth_url = f"https://accounts.google.com/.well-known/openid-configuration"
        response = requests.get(auth_url)
        if response.status_code == 200:
            print("✅ Google OAuth Discovery: SUCCESS (Google Auth Servers online)")
            # Note: Validating ID/Secret usually requires a full OAuth flow with a redirect.
            # We can't easily verify the secret without an authorization code.
        else:
            print(f"❌ Google OAuth Discovery: FAILED (HTTP {response.status_code})")
            
    except Exception as e:
        print(f"❌ Google OAuth: ERROR - {str(e)}")

if __name__ == "__main__":
    test_google_services()
