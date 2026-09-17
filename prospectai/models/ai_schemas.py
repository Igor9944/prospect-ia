"""Schémas JSON structurés pour Gemini et les interactions."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class AIScoreResult(BaseModel):
    score: int = Field(..., ge=0, le=10)
    justification: str
    signaux_positifs: list[str] = Field(default_factory=list)
    signaux_negatifs: list[str] = Field(default_factory=list)
    donnees_manquantes: list[str] = Field(default_factory=list)


class AIEmailResult(BaseModel):
    objet: str = Field(..., min_length=1, max_length=200)
    corps: str = Field(..., min_length=10)


class AIAnalysisResult(BaseModel):
    categorie: str
    justification: str
    prochaine_action: str

    @field_validator("categorie")
    @classmethod
    def validate_category(cls, value: str) -> str:
        mapping = {
            "hesitant": "hésitant",
            "negatif": "négatif",
        }
        normalized = mapping.get(value.strip().lower(), value.strip().lower())
        allowed = {
            "intéressé",
            "hésitant",
            "négatif",
            "demande d'information",
            "hors sujet",
        }
        if normalized not in allowed:
            raise ValueError(f"Catégorie invalide : {value}")
        return normalized


class GoogleSearchResult(BaseModel):
    title: str = ""
    snippet: str = ""
    link: str = ""


class GoogleSearchResponse(BaseModel):
    items: list[GoogleSearchResult] = Field(default_factory=list)
    search_information: dict[str, Any] = Field(default_factory=dict)


class SearchQueriesResult(BaseModel):
    queries: list[str] = Field(default_factory=list)


class InteractionCreate(BaseModel):
    prospect_id: UUID
    type: str
    content: Optional[str] = None
    ai_analysis: Optional[dict[str, Any]] = None
    created_at: Optional[datetime] = None
