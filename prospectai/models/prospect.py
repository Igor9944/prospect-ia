"""Modèles Pydantic des prospects enrichis."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

PROSPECT_STATUSES = (
    "À qualifier",
    "Qualifié",
    "Rejeté",
    "À valider",
    "Contacté",
    "Relancé",
    "Répondu",
    "Converti",
    "Gagné",
    "Perdu",
    "Classé",
    "À relancer plus tard",
)

NOT_AVAILABLE = "non disponible"


class ProspectStatus:
    TO_QUALIFY = "À qualifier"
    QUALIFIED = "Qualifié"
    REJECTED = "Rejeté"
    TO_VALIDATE = "À valider"
    CONTACTED = "Contacté"
    FOLLOWED_UP = "Relancé"
    REPLIED = "Répondu"
    CONVERTED = "Converti"
    WON = "Gagné"
    LOST = "Perdu"
    ARCHIVED = "Classé"
    FOLLOW_LATER = "À relancer plus tard"


class ProspectBase(BaseModel):
    company_name: Optional[str] = None
    domain: Optional[str] = None
    website_url: Optional[str] = None
    sector: Optional[str] = None
    sub_sector: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    contact_name: Optional[str] = None
    contact_role: Optional[str] = None
    employee_count: Optional[int] = Field(default=None, ge=0)
    size_category: Optional[str] = None
    revenue: Optional[str] = None
    revenue_status: Optional[str] = None
    founded_year: Optional[int] = Field(default=None, ge=1000, le=2100)
    experience_years: Optional[int] = Field(default=None, ge=0)
    products_services: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    review_count: Optional[int] = Field(default=None, ge=0)
    digital_presence: Optional[str] = None
    commercial_signals: list[str] = Field(default_factory=list)
    sources: dict[str, Any] = Field(default_factory=dict)
    ai_score: float = Field(default=0, ge=0, le=10)
    ai_justification: Optional[str] = None
    ai_positive_signals: list[str] = Field(default_factory=list)
    ai_negative_signals: list[str] = Field(default_factory=list)
    ai_missing_data: list[str] = Field(default_factory=list)
    status: str = ProspectStatus.TO_QUALIFY
    last_action: Optional[str] = None
    followup_count: int = Field(default=0, ge=0)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in PROSPECT_STATUSES:
            raise ValueError(f"Statut invalide : {value}")
        return value

    @field_validator("revenue_status")
    @classmethod
    def validate_revenue_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        allowed = {"declared", "estimated", "unknown", "déclaré", "estimé", "inconnu"}
        if value not in allowed:
            return "unknown"
        return value

    @field_validator("domain", mode="before")
    @classmethod
    def normalize_domain(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        cleaned = str(value).lower().strip()
        cleaned = cleaned.replace("http://", "").replace("https://", "").replace("www.", "")
        cleaned = cleaned.split("/")[0].split("?")[0].split("#")[0]
        return cleaned or None

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: Optional[str]) -> Optional[str]:
        if value is None or str(value).strip() == "":
            return None
        text = str(value).strip()
        if text.lower() in {NOT_AVAILABLE, "n/a", "na", "none"}:
            return NOT_AVAILABLE
        return text

    @field_validator("ai_score", mode="before")
    @classmethod
    def coerce_score(cls, value: Any) -> float:
        if value is None or value == "":
            return 0.0
        return float(value)


class ProspectCreate(ProspectBase):
    campaign_id: UUID
    prospect_id: str


class ProspectUpdate(BaseModel):
    company_name: Optional[str] = None
    domain: Optional[str] = None
    website_url: Optional[str] = None
    sector: Optional[str] = None
    sub_sector: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    contact_name: Optional[str] = None
    contact_role: Optional[str] = None
    employee_count: Optional[int] = Field(default=None, ge=0)
    size_category: Optional[str] = None
    revenue: Optional[str] = None
    revenue_status: Optional[str] = None
    founded_year: Optional[int] = Field(default=None, ge=1000, le=2100)
    experience_years: Optional[int] = Field(default=None, ge=0)
    products_services: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    review_count: Optional[int] = Field(default=None, ge=0)
    digital_presence: Optional[str] = None
    commercial_signals: Optional[list[str]] = None
    sources: Optional[dict[str, Any]] = None
    ai_score: Optional[float] = Field(default=None, ge=0, le=10)
    ai_justification: Optional[str] = None
    ai_positive_signals: Optional[list[str]] = None
    ai_negative_signals: Optional[list[str]] = None
    ai_missing_data: Optional[list[str]] = None
    status: Optional[str] = None
    last_action: Optional[str] = None
    followup_count: Optional[int] = Field(default=None, ge=0)
    contact_date: Optional[datetime] = None
    next_followup_date: Optional[datetime] = None
    last_action_date: Optional[datetime] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        if value not in PROSPECT_STATUSES:
            raise ValueError(f"Statut invalide : {value}")
        return value


class Prospect(ProspectBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    campaign_id: UUID
    prospect_id: str
    contact_date: Optional[datetime] = None
    next_followup_date: Optional[datetime] = None
    last_action_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
