import json
import re
from ..ai_client import get_ai_client, MODEL_NAME

class AIResumeParser:
    @staticmethod
    def parse_resume(text: str) -> dict:
        client = get_ai_client()
        if not client:
            raise Exception("AI Client not initialized")

        prompt = f"""
        You are an expert Resume Parser. Analyze the following resume text and extract the details in strictly valid JSON format.
        
        Resume Text:
        {text[:10000]}  # Truncate to avoid token limits if necessary, though 2.0 Flash has large context
        
        Required JSON Structure:
        {{
            "name": "Candidate Name (Title Case)",
            "email": "candidate@example.com",
            "technical_skills": ["List", "of", "Hard/Technical Skills"],
            "soft_skills": ["List", "of", "Interpersonal/Soft Skills"],
            "projects": ["Detailed description of project 1", "Detailed description of project 2"],
            "experience": "Summary of work experience (max 100 words)",
            "job_role": "Inferred Job Role (e.g., Backend Developer, Data Scientist, etc.)"
        }}
        
        Rules:
        1. CRITICAL: DO NOT INVENT or HALLUCINATE any skills. 
        2. CRITICAL: ONLY extract skills that are EXPLICITLY MENTIONED in the resume text. If a skill is heavily implied but not stated, DO NOT include it.
        3. If information is missing, use empty strings or empty lists.
        4. Infer the 'job_role' based on the skills and experience.
        5. 'projects' should be a list of strings, where each string is a self-contained summary of a project found in the resume. Catch ALL projects.
        6. Categorize all found skills strictly into technical skills (e.g., Python, React, AWS) and soft skills (e.g., Leadership, Communication).
        7. Return ONLY the JSON string, no markdown formatting (no ```json).
        """

        import time
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model=MODEL_NAME,
                    contents=prompt,
                    config={
                        'response_mime_type': 'application/json'
                    }
                )
                
                raw_text = response.text.strip()
                # Clean up potential markdown code blocks
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                    
                data = json.loads(raw_text)
                return data
                
            except Exception as e:
                if "429" in str(e) and attempt < max_retries - 1:
                    print(f"DEBUG: Rate limit hit (429). Retrying in {2**(attempt+1)} seconds...")
                    time.sleep(2**(attempt+1))
                    continue
                
                print(f"AI Parsing Error: {e}")
                raise e
