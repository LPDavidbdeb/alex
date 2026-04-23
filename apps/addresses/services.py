import logging
import requests
import re
from typing import List, Dict, Any, Optional
from .models import Address, Country

logger = logging.getLogger(__name__)

class AddressService:
    """The 'Brain' for address management with strict international filtering."""
    
    def search(self, q: str, country_code: Optional[str] = None) -> List[Dict[str, Any]]:
        if len(q) < 3: return []
        
        url = "https://photon.komoot.io/api/"
        params: Dict[str, Any] = {
            "q": q,
            "limit": 10,
            "lang": "fr"
        }
        
        # FILTRAGE STRICT : Si un code pays est fourni, on force Photon à limiter les résultats
        if country_code:
            params["countrycode"] = country_code.lower()
        
        headers = {"User-Agent": "RM-Logistic-App/1.0"}
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            results = []
            features = data.get('features', [])
            
            # Extraction du numéro potentiel de la requête originale
            query_number = None
            num_match = re.match(r'^(\d+)', q.strip())
            if num_match:
                query_number = num_match.group(1)

            # Cache pays pour éviter N requêtes DB par feature
            country_cache: Dict[str, Optional[int]] = {}

            for feature in features:
                props = feature.get('properties', {})
                geom = feature.get('geometry', {})

                house_number = props.get('house_number') or query_number
                street = props.get('street') or props.get('name')
                city = props.get('city') or props.get('town') or props.get('village')
                state = props.get('state')
                postcode = props.get('postcode')
                country = props.get('country', 'Unknown')

                # Résolution country_ref_id depuis le code ISO2 retourné par Photon
                iso2_raw = props.get('countrycode', '').upper()
                if iso2_raw not in country_cache:
                    try:
                        obj = Country.objects.filter(iso2=iso2_raw).first() if iso2_raw else None
                        country_cache[iso2_raw] = obj.id if obj else None
                    except Exception as e:
                        logger.warning("Impossible de résoudre le pays '%s': %s", iso2_raw, e)
                        country_cache[iso2_raw] = None
                country_ref_id = country_cache[iso2_raw]

                # Construction du label international
                address_line = f"{house_number} {street}" if house_number else street
                parts = [address_line, city, postcode, state, country]
                label = ", ".join([str(p).strip() for p in parts if p])

                results.append({
                    "label": label,
                    "latitude": float(geom.get('coordinates', [0, 0])[1]),
                    "longitude": float(geom.get('coordinates', [0, 0])[0]),
                    "source": "OSM",
                    "raw_json": feature,
                    "country_ref_id": country_ref_id,
                })
            return results
        except Exception as e:
            logger.error("Erreur recherche adresse pour '%s': %s", q, e)
            return []

    def create_address(self, data: Dict[str, Any]) -> Address:
        return Address.objects.create(**data)
