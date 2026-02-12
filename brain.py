import os
import json
import time
from google import genai
from google.genai import types

# --- LEVEL 1: ABSOLUTE TRUTH (HLRL LOCKS) ---
# Hardcoded data for DFW as provided by the user.
DFW_HLRL_LOCKS = [
  { "dsoName": "Ideal Dental (DECA)", "geographicFocus": "National", "dentistCount": 136, "clinicCount": 65, "dentistsPerClinic": 2.09, "surgeonCount": 12, "priceDenture": 650, "priceTier1Low": 1000, "priceTier1High": 1500 },
  { "dsoName": "Smile Brands", "geographicFocus": "National", "dentistCount": 50, "clinicCount": 51, "dentistsPerClinic": 0.98, "surgeonCount": 8, "priceDenture": 650, "priceTier1Low": 950, "priceTier1High": 1350 },
  { "dsoName": "Jefferson Dental", "geographicFocus": "Regional", "dentistCount": 40, "clinicCount": 35, "dentistsPerClinic": 1.14, "surgeonCount": 6, "priceDenture": 550, "priceTier1Low": 699, "priceTier1High": 1100 },
  { "dsoName": "Pacific Dental (PDS)", "geographicFocus": "National", "dentistCount": 38, "clinicCount": 35, "dentistsPerClinic": 1.09, "surgeonCount": 10, "priceDenture": 700, "priceTier1Low": 1100, "priceTier1High": 1600 },
  { "dsoName": "Heartland Dental", "geographicFocus": "National", "dentistCount": 45, "clinicCount": 30, "dentistsPerClinic": 1.5, "surgeonCount": 8, "priceDenture": 1100, "priceTier1Low": 1100, "priceTier1High": 1600 },
  { "dsoName": "AD&I/DDS", "geographicFocus": "National", "dentistCount": 45, "clinicCount": 22, "dentistsPerClinic": 2.05, "surgeonCount": 6, "priceDenture": 599, "priceTier1Low": 800, "priceTier1High": 1200 },
  { "dsoName": "Aspen Dental", "geographicFocus": "National", "dentistCount": 19, "clinicCount": 20, "dentistsPerClinic": 0.95, "surgeonCount": 4, "priceDenture": 499, "priceTier1Low": 1100, "priceTier1High": 1400 },
  { "dsoName": "Great Expressions", "geographicFocus": "National", "dentistCount": 8, "clinicCount": 8, "dentistsPerClinic": 1, "surgeonCount": 2, "priceDenture": 850, "priceTier1Low": 850, "priceTier1High": 1250 },
  { "dsoName": "Sage Dental", "geographicFocus": "Regional", "dentistCount": 6, "clinicCount": 6, "dentistsPerClinic": 1, "surgeonCount": 1, "priceDenture": 800, "priceTier1Low": 900, "priceTier1High": 1350 },
  { "dsoName": "Archpoint ID", "geographicFocus": "Local", "dentistCount": 5, "clinicCount": 3, "dentistsPerClinic": 1.67, "surgeonCount": 2, "priceDenture": "TBD", "priceTier1Low": 1500, "priceTier1High": 3000 },
  { "dsoName": "ClearChoice", "geographicFocus": "Local", "dentistCount": 3, "clinicCount": 3, "dentistsPerClinic": 1, "surgeonCount": 3, "priceDenture": "TBD", "priceTier1Low": "TBD", "priceTier1High": "TBD" },
  { "dsoName": "Texas Implant & Dental", "geographicFocus": "Local", "dentistCount": 4, "clinicCount": 2, "dentistsPerClinic": 2, "surgeonCount": 1, "priceDenture": 895, "priceTier1Low": 895, "priceTier1High": 1700 },
  { "dsoName": "Fast New Smile", "geographicFocus": "Local", "dentistCount": 3, "clinicCount": 2, "dentistsPerClinic": 1.5, "surgeonCount": 3, "priceDenture": "TBD", "priceTier1Low": "TBD", "priceTier1High": "TBD" },
  { "dsoName": "Nuvia", "geographicFocus": "Local", "dentistCount": 4, "clinicCount": 2, "dentistsPerClinic": 2, "surgeonCount": 4, "priceDenture": "TBD", "priceTier1Low": 2500, "priceTier1High": 3000 },
  { "dsoName": "New Choice Dentures", "geographicFocus": "Local", "dentistCount": 3, "clinicCount": 1, "dentistsPerClinic": 3, "surgeonCount": 1, "priceDenture": 550, "priceTier1Low": 795, "priceTier1High": 1500 }
]

SYSTEM_INSTRUCTION = """
I. ROLE & PERSONA
You are the Lead Market Research Scientist for AD&I/DDS. Mission: Deliver "Data-Hardened" competitive intelligence.
Speak with scientific rigor.

II. OUTPUT PROTOCOLS
Produce strict JSON.
"""

class MarketIntelligenceBrain:
    def __init__(self):
        # Initialize Google GenAI Client
        api_key = os.environ.get("API_KEY")
        self.client = genai.Client(api_key=api_key)
        self.model_id = "gemini-2.0-flash" # Fast model for analysis

    def get_market_matrix(self, dma: str):
        """
        Returns the Competitive Matrix.
        Logic: Checks for L1 Locks (DFW). If found, returns static data.
        Else, asks AI to generate estimates.
        """
        if dma == "Dallas-Fort Worth":
            # Level 1 Lock triggered
            time.sleep(0.5) # Simulate processing
            return DFW_HLRL_LOCKS
        
        # Level 3: AI Discovery for other markets
        prompt = f"""
        Analyze the {dma} DMA. Identify top dental competitors.
        Return a JSON list of objects with keys:
        - dsoName (string)
        - geographicFocus (National/Regional/Local)
        - clinicCount (int)
        - dentistCount (int)
        - surgeonCount (int)
        - priceDenture (number or "TBD")
        - priceTier1Low (number or "TBD")
        - priceTier1High (number or "TBD")
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    tools=[types.Tool(google_search=types.GoogleSearch())]
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error: {e}")
            return []

    def get_competitor_details(self, dma: str, dso_name: str):
        """
        Page 2 Data: Deep dive into a specific DSO.
        """
        prompt = f"""
        Deep dive on "{dso_name}" in {dma}. 
        Return a JSON object with:
        - dentistNames: list of strings (real names found in public records)
        - surgeonNames: list of strings
        - evidenceSource: string (url or citation)
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    tools=[types.Tool(google_search=types.GoogleSearch())]
                )
            )
            return json.loads(response.text)
        except Exception as e:
            return {"dentistNames": [], "surgeonNames": [], "evidenceSource": "AI Lookup Failed"}

    def chat(self, user_input, history=None):
        """
        Research Lab Chat.
        """
        # Simple non-streaming implementation for Streamlit compatibility ease
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=user_input,
                config=types.GenerateContentConfig(
                     system_instruction=SYSTEM_INSTRUCTION,
                     tools=[types.Tool(google_search=types.GoogleSearch())]
                )
            )
            return response.text
        except Exception as e:
            return f"Error: {e}"

brain = MarketIntelligenceBrain()
