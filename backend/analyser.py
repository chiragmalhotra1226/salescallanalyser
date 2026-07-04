import os
import json
import re
from dotenv import load_dotenv
from pathlib import Path
import google.generativeai as genai

# 🔥 LOAD ENV HERE (IMPORTANT)
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def analyse_calls(full_text: str, job_id: str):
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
Return ONLY valid JSON.
No markdown.
No explanations.

Analyze these calls:

{full_text}

Return:

- vitals (0-100)
- scorecards (0-10)
- talk_metrics
- executive_summary
- call_narrative
- parent_intent
- key_points (array)
- objections (array)
- agent_improvements (array)
- calls (array with call_id, summary, conversion_probability)

Ensure JSON is valid.
"""

    response = model.generate_content(prompt)

    raw = response.text

    clean = re.sub(r"```json|```", "", raw).strip()

    try:
        data = json.loads(clean)
    except:
        raise Exception(f"Invalid JSON from Gemini:\n{raw}")

    data["result_id"] = job_id

    return data