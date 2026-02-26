import requests

def fetch_arbeitnow_jobs(query: str, results_per_page: int = 20):
    url = "https://arbeitnow.com/api/job-board-api"
    print(f"Fetching ArbeitNow for query: {query}")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        all_jobs = data.get("data", [])
        print(f"Total jobs from ArbeitNow: {len(all_jobs)}")
        
        filtered_jobs = [
            j for j in all_jobs 
            if query.lower() in j.get("title", "").lower() 
            or query.lower() in j.get("description", "").lower()
            or any(query.lower() in t.lower() for t in j.get("tags", []))
        ]
        

        print(f"Filtered jobs: {len(filtered_jobs)}")
        if len(filtered_jobs) > 0:
            print(f"First match: {filtered_jobs[0]['title']}")
            print(f"Date: {filtered_jobs[0]['created_at']}")
            
        return filtered_jobs
    except Exception as e:
        print(f"Error: {e}")
        return []



ADZUNA_APP_ID = "679d6946"
ADZUNA_API_KEY = "34a6b99b5aa3f77e94d96629aacbdbef"

def fetch_adzuna_jobs(query: str, location: str = "in", results_per_page: int = 20):
    url = f"https://api.adzuna.com/v1/api/jobs/{location}/search/1"
    
    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_API_KEY,
        "results_per_page": results_per_page,
        "what": query,
        "content-type": "application/json"
    }
    
    print(f"Fetching Adzuna for query: {query}")
    try:
        response = requests.get(url, params=params, timeout=10)
        # print(response.status_code)
        # print(response.text[:200])
        response.raise_for_status()
        data = response.json()
        
        results = data.get("results", [])
        print(f"Total jobs from Adzuna: {len(results)}")
        if len(results) > 0:
            print(f"First match: {results[0]['title']}")
            print(f"Date: {results[0].get('created')}")
        return results
    except Exception as e:
        print(f"Error Adzuna: {e}")
        return []

fetch_adzuna_jobs("Backend Developer")
fetch_arbeitnow_jobs("Backend Developer")
