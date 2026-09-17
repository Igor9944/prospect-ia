"""Client Google Gemini pour scoring, remarques et textes structurés."""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Optional

import httpx

from prospectai.config import config
from prospectai.models import AIAnalysisResult, AIEmailResult, AIScoreResult
from prospectai.models.ai_schemas import SearchQueriesResult
from prospectai.prompts.analysis_prompt import ANALYSIS_SYSTEM_PROMPT, ANALYSIS_USER_TEMPLATE
from prospectai.prompts.email_prompt import (
    EMAIL_SYSTEM_PROMPT,
    FOLLOWUP_EMAIL_TEMPLATE,
    INITIAL_EMAIL_TEMPLATE,
    QUERY_GENERATION_TEMPLATE,
)
from prospectai.prompts.scoring_prompt import SCORING_SYSTEM_PROMPT, SCORING_USER_TEMPLATE
from prospectai.utils.validators import unavailable

logger = logging.getLogger(__name__)

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


class GoogleAIService:
    def __init__(self) -> None:
        if not config.GOOGLE_AI_API_KEY:
            raise ValueError("GOOGLE_AI_API_KEY manquante dans .env")
        self.api_key = config.GOOGLE_AI_API_KEY
        self.model = config.GOOGLE_AI_MODEL
        self.timeout = config.HTTP_TIMEOUT_SECONDS + 25
        self._models = [
            self.model,
            "gemini-2.5-flash",
            "gemini-2.0-flash-001",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-flash-latest",
            "gemini-pro",
        ]

    async def _generate_json(self, system: str, user: str, temperature: float = 0.2) -> dict[str, Any]:
        last_error = "Gemini indisponible"
        seen: set[str] = set()
        for model in self._models:
            if not model or model in seen:
                continue
            seen.add(model)
            url = GEMINI_URL.format(model=model)
            payload = {
                "systemInstruction": {"parts": [{"text": system}]},
                "contents": [{"role": "user", "parts": [{"text": user}]}],
                "generationConfig": {
                    "temperature": temperature,
                    "responseMimeType": "application/json",
                },
            }
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(url, params={"key": self.api_key}, json=payload)
                if response.status_code == 404:
                    last_error = f"modèle {model} introuvable"
                    continue
                if response.status_code >= 400:
                    last_error = f"HTTP {response.status_code}: {response.text[:240]}"
                    if response.status_code in {400, 404}:
                        continue
                    raise ValueError(last_error)
                body = response.json()
            except httpx.HTTPError as exc:
                last_error = str(exc)
                continue
            text = (
                body.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            if not text:
                last_error = f"réponse vide ({model})"
                continue
            self.model = model
            cleaned = text.strip()
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
            parsed = json.loads(cleaned)
            if not isinstance(parsed, dict):
                raise ValueError("JSON Gemini invalide")
            return parsed
        raise ValueError(last_error)

    async def score_prospect(
        self, prospect_data: dict[str, Any], campaign_context: dict[str, Any]
    ) -> AIScoreResult:
        user = SCORING_USER_TEMPLATE.format(
            target_type=unavailable(campaign_context.get("target_type")),
            sector=unavailable(campaign_context.get("sector")),
            location=unavailable(campaign_context.get("location")),
            keywords_include=", ".join(campaign_context.get("keywords_include") or []) or "non disponible",
            keywords_exclude=", ".join(campaign_context.get("keywords_exclude") or []) or "non disponible",
            size_criteria=unavailable(campaign_context.get("size_criteria")),
            commercial_signal=unavailable(campaign_context.get("commercial_signal")),
            score_threshold=campaign_context.get("score_threshold", 7),
            company_name=unavailable(prospect_data.get("company_name")),
            domain=unavailable(prospect_data.get("domain")),
            website_url=unavailable(prospect_data.get("website_url")),
            prospect_sector=unavailable(prospect_data.get("sector")),
            sub_sector=unavailable(prospect_data.get("sub_sector")),
            prospect_location=unavailable(prospect_data.get("location")),
            employee_count=unavailable(
                None if prospect_data.get("employee_count") is None else str(prospect_data.get("employee_count"))
            ),
            size_category=unavailable(prospect_data.get("size_category")),
            revenue=unavailable(prospect_data.get("revenue")),
            revenue_status=unavailable(prospect_data.get("revenue_status")),
            founded_year=unavailable(
                None if prospect_data.get("founded_year") is None else str(prospect_data.get("founded_year"))
            ),
            products_services=unavailable(prospect_data.get("products_services")),
            description=unavailable(prospect_data.get("description")),
            digital_presence=unavailable(prospect_data.get("digital_presence")),
            commercial_signals=", ".join(prospect_data.get("commercial_signals") or []) or "non disponible",
            sources=json.dumps(prospect_data.get("sources") or {}, ensure_ascii=False),
        )
        raw = await self._generate_json(SCORING_SYSTEM_PROMPT, user, temperature=0.2)
        score = raw.get("score", 0)
        try:
            score_int = int(round(float(score)))
        except (TypeError, ValueError):
            score_int = 0
        score_int = max(0, min(10, score_int))
        return AIScoreResult(
            score=score_int,
            justification=str(raw.get("justification") or "non disponible"),
            signaux_positifs=list(raw.get("signaux_positifs") or []),
            signaux_negatifs=list(raw.get("signaux_negatifs") or []),
            donnees_manquantes=list(raw.get("donnees_manquantes") or []),
        )

    async def remark_prospect(
        self, prospect_data: dict[str, Any], campaign_context: dict[str, Any]
    ) -> str:
        system = (
            "Tu es un commercial B2B. Rédige une remarque courte (2 à 4 phrases) "
            "sur la pertinence du prospect. N'invente aucun fait, email ou téléphone. "
            "Réponds en JSON {\"remarque\": \"...\"}."
        )
        user = (
            f"Campagne: {unavailable(campaign_context.get('name'))} / "
            f"secteur {unavailable(campaign_context.get('sector'))} / "
            f"{unavailable(campaign_context.get('location'))}\n"
            f"Entreprise: {unavailable(prospect_data.get('company_name'))}\n"
            f"Domaine: {unavailable(prospect_data.get('domain'))}\n"
            f"Description: {unavailable(prospect_data.get('description'))}\n"
            f"Signaux: {', '.join(prospect_data.get('commercial_signals') or []) or 'non disponible'}\n"
            f"Score existant: {prospect_data.get('ai_score', 'non disponible')}\n"
        )
        raw = await self._generate_json(system, user, temperature=0.4)
        remark = str(raw.get("remarque") or "").strip()
        return remark or "non disponible"

    async def generate_email(
        self,
        prospect_data: dict[str, Any],
        campaign_context: dict[str, Any],
        email_type: str = "initial",
    ) -> AIEmailResult:
        if email_type == "followup":
            user = FOLLOWUP_EMAIL_TEMPLATE.format(
                followup_count=prospect_data.get("followup_count", 1),
                company_name=unavailable(prospect_data.get("company_name")),
                prospect_sector=unavailable(prospect_data.get("sector")),
                location=unavailable(prospect_data.get("location")),
                contact_date=unavailable(prospect_data.get("contact_date")),
            )
        else:
            user = INITIAL_EMAIL_TEMPLATE.format(
                sector=unavailable(campaign_context.get("sector")),
                company_name=unavailable(prospect_data.get("company_name")),
                prospect_sector=unavailable(prospect_data.get("sector")),
                location=unavailable(prospect_data.get("location")),
                description=unavailable(prospect_data.get("description")),
                products_services=unavailable(prospect_data.get("products_services")),
                commercial_signals=", ".join(prospect_data.get("commercial_signals") or []) or "non disponible",
                digital_presence=unavailable(prospect_data.get("digital_presence")),
            )
        raw = await self._generate_json(EMAIL_SYSTEM_PROMPT, user, temperature=0.5)
        return AIEmailResult(
            objet=str(raw.get("objet") or "Prise de contact"),
            corps=str(raw.get("corps") or "non disponible"),
        )

    async def analyze_reply(
        self, email_content: str, prospect_data: dict[str, Any]
    ) -> AIAnalysisResult:
        user = ANALYSIS_USER_TEMPLATE.format(
            company_name=unavailable(prospect_data.get("company_name")),
            sector=unavailable(prospect_data.get("sector")),
            email_content=email_content,
        )
        raw = await self._generate_json(ANALYSIS_SYSTEM_PROMPT, user, temperature=0.2)
        return AIAnalysisResult(
            categorie=str(raw.get("categorie") or "hors sujet"),
            justification=str(raw.get("justification") or "non disponible"),
            prochaine_action=str(raw.get("prochaine_action") or "non disponible"),
        )

    async def generate_queries(self, campaign_params: dict[str, Any]) -> list[str]:
        user = QUERY_GENERATION_TEMPLATE.format(
            target_type=unavailable(campaign_params.get("target_type")),
            sector=unavailable(campaign_params.get("sector")),
            location=unavailable(campaign_params.get("location")),
            keywords_include=", ".join(campaign_params.get("keywords_include") or []) or "non disponible",
            keywords_exclude=", ".join(campaign_params.get("keywords_exclude") or []) or "non disponible",
            size_criteria=unavailable(campaign_params.get("size_criteria")),
            commercial_signal=unavailable(campaign_params.get("commercial_signal")),
        )
        raw = await self._generate_json(EMAIL_SYSTEM_PROMPT, user, temperature=0.3)
        result = SearchQueriesResult(queries=list(raw.get("queries") or []))
        return [q for q in result.queries if q.strip()]


_instance: Optional[GoogleAIService] = None


def get_google_ai() -> GoogleAIService:
    global _instance
    if _instance is None:
        _instance = GoogleAIService()
    return _instance
