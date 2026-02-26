import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

def send_job_application_email(
    company_email: str,
    job_title: str,
    company_name: str,
    applicant_name: str,
    applicant_email: str,
    applicant_skills: list,
    resume_path: str = None
):
    """Send job application email"""
    
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        return {"success": False, "message": "Email credentials not configured"}
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = company_email
        msg['Subject'] = f"Job Application - {job_title}"
        
        # Email body
        body = f"""
Dear Hiring Manager at {company_name},

I am writing to express my interest in the {job_title} position.

Name: {applicant_name}
Email: {applicant_email}
Skills: {', '.join(applicant_skills)}

I have attached my resume for your review. I am confident that my skills and experience make me a strong candidate for this role.

I would welcome the opportunity to discuss how I can contribute to your team.

Thank you for your consideration.

Best regards,
{applicant_name}
{applicant_email}

---
This application was sent via Career Agent AI
"""
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Attach resume if provided
        if resume_path and os.path.exists(resume_path):
            with open(resume_path, "rb") as attachment:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename= resume_{applicant_name}.pdf",
                )
                msg.attach(part)
        
        # Send email
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_EMAIL, company_email, text)
        server.quit()
        
        return {"success": True, "message": "Email sent successfully"}
        
    except Exception as e:
        return {"success": False, "message": str(e)}