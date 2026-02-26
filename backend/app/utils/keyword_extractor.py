import re
import json

class KeywordExtractor:
    # Skill Dictionaries
    SKILLS_DB = {
        "Frontend Developer": [
            "react", "angular", "vue", "svelte", "html", "css", "javascript", "typescript", 
            "redux", "bootstrap", "tailwind", "sass", "webpack", "jest", "cypress"
        ],
        "Backend Developer": [
            "python", "django", "flask", "fastapi", "node", "express", "java", "spring", 
            "go", "golang", "rust", "c#", ".net", "ruby", "rails", "php", "laravel",
            "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch"
        ],
        "Full Stack Developer": [], # Combination of Frontend + Backend (handled in logic)
        "Data Scientist": [
            "python", "r", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", 
            "keras", "matplotlib", "seaborn", "sql", "tableau", "powerbi", "hadoop", "spark"
        ],
        "DevOps Engineer": [
            "docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "gitlab ci", 
            "github actions", "terraform", "ansible", "linux", "bash", "monitoring", "prometheus", "grafana"
        ],
        "Mobile Developer": [
            "swift", "ios", "kotlin", "android", "flutter", "react native", "objective-c", "dart"
        ]
    }

    # Flattened list for quick lookup
    ALL_SKILLS = set(skill for skills in SKILLS_DB.values() for skill in skills)

    @staticmethod
    def extract_email(text):
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(email_pattern, text)
        return match.group(0) if match else "Not Found"

    @staticmethod
    def extract_phone(text):
        # Basic phone extraction - can be improved
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        match = re.search(phone_pattern, text)
        return match.group(0) if match else "Not Found"

    @classmethod
    def extract_skills(cls, text):
        found_skills = set()
        text_lower = text.lower()
        
        # Simple string matching for now (could use regex for boundary checking)
        for skill in cls.ALL_SKILLS:
            # Check for word boundaries to avoid partial matches (e.g., "go" in "google")
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.add(skill)
        
        return list(found_skills)

    @classmethod
    def infer_role(cls, skills):
        max_count = 0
        best_role = "Backend Developer" # Default fallback
        
        scores = {role: 0 for role in cls.SKILLS_DB}
        
        # Calculate scores based on matched skills
        for skill in skills:
            for role, role_skills in cls.SKILLS_DB.items():
                if skill in role_skills:
                    scores[role] += 1
        
        # Handle Full Stack Logic (if high frontend AND backend scores)
        if scores["Frontend Developer"] > 2 and scores["Backend Developer"] > 2:
            return "Full Stack Developer"
            
        # Find highest score
        for role, score in scores.items():
            if score > max_count:
                max_count = score
                best_role = role
                
        return best_role

    @staticmethod
    def extract_projects(text):
        # simplistic heuristic: look for "Projects" section and grab some lines
        projects = []
        lines = text.split('\n')
        capture = False
        project_count = 0
        
        # Extended keywords for project section
        project_keywords = ["projects", "key projects", "academic projects", "professional projects", "project experience", "technical projects"]
        
        for line in lines:
            normalized_line = line.strip().lower()
            
            # Check for start of projects section
            if any(keyword in normalized_line for keyword in project_keywords):
                # Ensure it's likely a header (short length)
                if len(normalized_line) < 40:
                    capture = True
                    continue
            
            if capture:
                # Stop if we hit another likely header
                # stricter check: line must be short and capitalized or standard section name
                if len(normalized_line) < 40 and any(header in normalized_line for header in ["education", "experience", "skills", "certifications", "languages", "achievements", "interests", "references"]):
                    break
                
                # Filter out likely junk/empty lines
                if len(line.strip()) > 5: 
                     projects.append(line.strip())
                     project_count += 1
                     if project_count >= 15: # increased limit to capture more context
                         break
                         
        if not projects:
             return ["Project details not parsed. Please add them manually."]
             
        return projects

    @staticmethod
    def extract_name(text):
        # Heuristic: Name is often the first line or among the first few lines
        lines = text.split('\n')
        for line in lines[:5]: # Check first 5 lines
            clean_line = line.strip()
            # If line is not empty and not a common header
            if clean_line and len(clean_line) < 50 and not any(header in clean_line.lower() for header in ["resume", "curriculum vitae", "cv", "bio", "profile"]):
                # Simple capitalization check - usually names are Title Cased
                return clean_line.title()
        return "Candidate"

    @classmethod
    def process_resume(cls, text):
        skills = cls.extract_skills(text)
        role = cls.infer_role(skills)
        email = cls.extract_email(text)
        projects = cls.extract_projects(text)
        name = cls.extract_name(text)
        
        return {
            "name": name, 
            "email": email,
            "skills": skills,
            "projects": projects,
            "experience": "Experience details require manual review.",
            "job_role": role
        }
