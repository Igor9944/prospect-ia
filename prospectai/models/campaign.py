"""Modèles Pydantic des campagnes."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CampaignBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    target_type: Optional[str] = None
    sector: Optional[str] = None
    location: Optional[str] = None
    keywords_include: list[str] = Field(default_factory=list)
    keywords_exclude: list[str] = Field(default_factory=list)
    size_criteria: Optional[str] = None
    commercial_signal: Optional[str] = None
    nb_prospects_target: int = Field(default=10, ge=1)
    score_threshold: int = Field(default=7, ge=0, le=10)
    status: str = "Active"


class CampaignCreate(CampaignBase):
    user_id: Optional[UUID] = None


class CampaignUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    target_type: Optional[str] = None
    sector: Optional[str] = None
    location: Optional[str] = None
    keywords_include: Optional[list[str]] = None
    keywords_exclude: Optional[list[str]] = None
    size_criteria: Optional[str] = None
    commercial_signal: Optional[str] = None
    nb_prospects_target: Optional[int] = Field(default=None, ge=1)
    score_threshold: Optional[int] = Field(default=None, ge=0, le=10)
    status: Optional[str] = None


class Campaign(CampaignBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
