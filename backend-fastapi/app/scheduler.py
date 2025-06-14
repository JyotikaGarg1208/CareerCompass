import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.ext.asyncio import AsyncSession
from .database import async_session
from .models import JobApplication, User
from .email_utils import send_interview_reminder
from sqlalchemy.future import select
from datetime import datetime, timedelta

async def send_reminders():
    async with async_session() as db:
        tomorrow = datetime.utcnow() + timedelta(days=1)
        now = datetime.utcnow()
        jobs = (await db.execute(
            select(JobApplication).where(
                JobApplication.status == "Interview",
                JobApplication.interview_date >= now,
                JobApplication.interview_date < tomorrow
            )
        )).scalars().all()

        for job in jobs:
            user = (await db.execute(select(User).where(User.id == job.user_id))).scalars().first()
            if user and job.interview_date:
                await send_interview_reminder(
                    user.email,
                    job.position,
                    job.company,
                    job.interview_date.strftime("%Y-%m-%d %H:%M")
                )

def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(lambda: asyncio.create_task(send_reminders()), "cron", hour=7)
    scheduler.start()
