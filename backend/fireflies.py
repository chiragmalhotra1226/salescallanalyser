import requests
import time
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

API_KEY = os.getenv("FIREFLIES_API_KEY", "")
URL = "https://api.fireflies.ai/graphql"

def upload_audio(file_url: str) -> str:
    """
    Attempting the most minimal GraphQL query to avoid 'AudioUploadStatus' validation errors.
    """
    # We are only asking for SUCCESS and MESSAGE. 
    # If the API is auto-returning an ID, we will find it in the raw JSON.
    query = """
    mutation($input: AudioUploadInput!) {
      uploadAudio(input: $input) {
        success
        message
      }
    }
    """

    response = requests.post(
        URL,
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "query": query,
            "variables": {
                "input": {
                    "url": file_url
                }
            }
        }
    )
    
    res = response.json()

    # Log the full response to your terminal so we can finally see the keys
    print(f"--- FIREFLIES RAW RESPONSE ---")
    print(res)

    if "errors" in res:
        error_msg = res['errors'][0].get('message', '')
        raise Exception(f"Fireflies API Error: {error_msg}")
    
    data = res.get("data", {}).get("uploadAudio", {})
    
    # We will search the dictionary for anything that looks like an ID
    # Checking for 'transcriptId', 'id', 'transcript_id', 'id' inside 'transcript'
    tid = (
        data.get("transcriptId") or 
        data.get("id") or 
        data.get("transcript", {}).get("id")
    )
    
    if not tid:
        # If the mutation succeeded but gave no ID, it might be an older API version
        # that expects a different query.
        raise Exception(f"Mutation successful but ID field is missing. Response: {data}")
            
    return tid
    
def wait_for_transcript(transcript_id: str, timeout=300):
    """
    Poll Fireflies until transcript is ready
    """
    query = """
    query($id: ID!) {
      transcript(id: $id) {
        sentences {
          text
          speaker_name
          start_time
        }
      }
    }
    """

    start = time.time()

    while True:
        if time.time() - start > timeout:
            raise Exception("Fireflies polling timed out after 5 minutes.")

        response = requests.post(
            URL,
            headers={"Authorization": f"Bearer {API_KEY}"},
            json={"query": query, "variables": {"id": transcript_id}},
        )
        
        res = response.json()
        
        if "errors" in res:
            raise Exception(f"Fireflies Polling Error: {res['errors'][0].get('message', res['errors'])}")

        data = res.get("data", {}).get("transcript")

        if data and data.get("sentences"):
            return data

        time.sleep(5)