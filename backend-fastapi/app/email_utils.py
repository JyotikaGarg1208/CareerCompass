import os
from aiosmtplib import SMTP
from email.message import EmailMessage

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

async def send_interview_reminder(to: str, job_title: str, company: str, date: str):
    msg = EmailMessage()
    msg["From"] = EMAIL_USER
    msg["To"] = to
    msg["Subject"] = f"Reminder: Interview for {job_title} at {company}"
    msg.set_content(
        f"You have an interview scheduled!\n\nPosition: {job_title}\nCompany: {company}\nDate: {date}\n\nAll the best!"
    )
    async with SMTP(hostname=EMAIL_HOST, port=EMAIL_PORT, start_tls=True) as smtp:
        await smtp.login(EMAIL_USER, EMAIL_PASS)
        await smtp.send_message(msg)
