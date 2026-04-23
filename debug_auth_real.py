import requests
import json

BASE_URL = "http://localhost:8000/api/auth"

def check_real_login(email, password):
    print(f"🕵️ Test de connexion réelle pour : {email}")
    payload = {"email": email, "password": password}
    
    try:
        response = requests.post(
            f"{BASE_URL}/token", 
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"📡 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCÈS : Le serveur a renvoyé un token.")
            print(f"📦 Data: {json.dumps(response.json(), indent=2)}")
        elif response.status_code == 401:
            print("❌ ÉCHEC : Identifiants invalides (401).")
        elif response.status_code == 500:
            print("🔥 ERREUR SERVEUR (500) : Quelque chose a cassé dans le code.")
            print(f"📄 Détail: {response.text[:500]}")
        else:
            print(f"❓ Réponse inattendue ({response.status_code}): {response.text}")
            
    except Exception as e:
        print(f"🚨 Erreur de connexion au serveur : {e}")

if __name__ == "__main__":
    # Test avec le superuser que j'ai créé pour vous ou le vôtre
    check_real_login("admin@rmlogistic.com", "Admin123!")
