from sqlalchemy.orm import declarative_base, mapped_column, Mapped, relationship
from sqlalchemy import String, DateTime, ForeignKey, Text
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True)
    hashed_password: Mapped[str] = mapped_column(String)

class JobApplication(Base):
    __tablename__ = "job_applications"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    company: Mapped[str] = mapped_column(String)
    position: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    applied_date: Mapped[datetime.datetime] = mapped_column(DateTime)
    interview_date: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
