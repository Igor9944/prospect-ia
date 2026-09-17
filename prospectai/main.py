"""API HTTP ProspectAI — lecture / écriture via Supabase."""

from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
import re

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from prospectai.config import config
from prospectai.models.prospect import NOT_AVAILABLE, ProspectUpdate
from prospectai.services.google_ai_service import get_google_ai
from prospectai.services.supabase_client import get_supabase
from prospectai.utils.validators import unavailable

app = FastAPI(title="ProspectAI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _iso(value: Optional[datetime]) -> Optional[str]:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


def _campaign_payload(campaign, prospects: list) -> dict:
    total = len(prospects)
    contacted = {"Contacté", "Relancé", "Répondu", "Converti", "Gagné"}
    replied = {"Répondu", "Converti", "Gagné"}
    sent = sum(1 for p in prospects if p.status in contacted)
    replies = sum(1 for p in prospects if p.status in replied)
    target = campaign.nb_prospects_target or 1
    progress = min(100, round(100 * total / target)) if target else 0
    reply_rate = round(100 * replies / sent, 1) if sent else None
    created = campaign.created_at
    date_label = created.strftime("%d %b %Y") if created else NOT_AVAILABLE
    status = campaign.status or "Active"
    return {
        "id": str(campaign.id),
        "name": campaign.name,
        "status": status,
        "sector": campaign.sector,
        "location": campaign.location,
        "progress": progress,
        "prospects": total,
        "sent": sent,
        "replies": replies,
        "reply_rate": reply_rate,
        "date": date_label,
        "created_at": _iso(campaign.created_at),
        "score_threshold": campaign.score_threshold,
        "nb_prospects_target": campaign.nb_prospects_target,
    }


def _prospect_payload(prospect) -> dict:
    score = float(prospect.ai_score or 0)
    return {
        "id": str(prospect.id),
        "prospect_id": prospect.prospect_id,
        "campaign_id": str(prospect.campaign_id),
        "name": unavailable(prospect.company_name),
        "domain": unavailable(prospect.domain),
        "website_url": prospect.website_url,
        "contact": unavailable(prospect.contact_name),
        "contact_role": unavailable(prospect.contact_role),
        "email": unavailable(prospect.email),
        "phone": unavailable(prospect.phone),
        "sector": unavailable(prospect.sector),
        "location": unavailable(prospect.location),
        "size_category": unavailable(prospect.size_category),
        "employee_count": prospect.employee_count,
        "revenue": unavailable(prospect.revenue),
        "founded_year": prospect.founded_year,
        "description": unavailable(prospect.description),
        "score": round(score, 1),
        "status": prospect.status,
        "last": unavailable(prospect.last_action),
        "justification": unavailable(prospect.ai_justification),
        "positive_signals": prospect.ai_positive_signals or [],
        "negative_signals": prospect.ai_negative_signals or [],
        "missing_data": prospect.ai_missing_data or [],
        "commercial_signals": prospect.commercial_signals or [],
        "sources": prospect.sources or {},
        "created_at": _iso(prospect.created_at),
        "updated_at": _iso(prospect.updated_at),
    }


@app.get("/api/health")
async def health():
    missing = config.missing(("SUPABASE_URL", "SUPABASE_KEY", "GOOGLE_AI_API_KEY"))
    return {
        "ok": not missing,
        "missing": missing,
        "project": config.SUPABASE_URL,
        "ai": "google-gemini",
        "model": config.GOOGLE_AI_MODEL,
    }


def _ai_http_error(exc: Exception) -> HTTPException:
    text = re.sub(r"key=[^&\s'\"]+", "key=***", str(exc))
    return HTTPException(status_code=502, detail=f"Gemini: {text[:280]}")


async def _resolve_prospect(prospect_id: str):
    db = get_supabase()
    try:
        prospect = await db.get_prospect(UUID(prospect_id))
    except ValueError:
        prospect = None
    if not prospect:
        prospect = await db.get_prospect_by_id(prospect_id)
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect introuvable")
    return db, prospect


def _prospect_context(prospect) -> dict:
    return {
        "company_name": prospect.company_name,
        "domain": prospect.domain,
        "website_url": prospect.website_url,
        "sector": prospect.sector,
        "sub_sector": prospect.sub_sector,
        "location": prospect.location,
        "phone": prospect.phone,
        "email": prospect.email,
        "employee_count": prospect.employee_count,
        "size_category": prospect.size_category,
        "revenue": prospect.revenue,
        "revenue_status": prospect.revenue_status,
        "founded_year": prospect.founded_year,
        "products_services": prospect.products_services,
        "description": prospect.description,
        "digital_presence": prospect.digital_presence,
        "commercial_signals": prospect.commercial_signals,
        "sources": prospect.sources,
        "ai_score": prospect.ai_score,
    }


def _campaign_context(campaign) -> dict:
    return {
        "name": campaign.name,
        "target_type": campaign.target_type,
        "sector": campaign.sector,
        "location": campaign.location,
        "keywords_include": campaign.keywords_include,
        "keywords_exclude": campaign.keywords_exclude,
        "size_criteria": campaign.size_criteria,
        "commercial_signal": campaign.commercial_signal,
        "score_threshold": campaign.score_threshold,
    }


async def _score_one(db, prospect, campaign):
    ai = get_google_ai()
    result = await ai.score_prospect(_prospect_context(prospect), _campaign_context(campaign))
    threshold = campaign.score_threshold or 7
    new_status = prospect.status
    if prospect.status in {"À qualifier", "À valider"}:
        new_status = "Qualifié" if result.score >= threshold else "Rejeté"
    updated = await db.update_prospect(
        prospect.id,
        ProspectUpdate(
            ai_score=float(result.score),
            ai_justification=result.justification,
            ai_positive_signals=result.signaux_positifs,
            ai_negative_signals=result.signaux_negatifs,
            ai_missing_data=result.donnees_manquantes,
            status=new_status,
            last_action="Scoring Gemini",
        ),
    )
    return updated or prospect


@app.post("/api/prospects/{prospect_id}/score")
async def score_prospect(prospect_id: str):
    db, prospect = await _resolve_prospect(prospect_id)
    campaign = await db.get_campaign(prospect.campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne introuvable")
    try:
        scored = await _score_one(db, prospect, campaign)
    except Exception as exc:
        raise _ai_http_error(exc) from exc
    return _prospect_payload(scored)


@app.post("/api/prospects/{prospect_id}/remark")
async def remark_prospect(prospect_id: str):
    db, prospect = await _resolve_prospect(prospect_id)
    campaign = await db.get_campaign(prospect.campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne introuvable")
    ai = get_google_ai()
    try:
        remark = await ai.remark_prospect(_prospect_context(prospect), _campaign_context(campaign))
    except Exception as exc:
        raise _ai_http_error(exc) from exc
    await db.create_interaction(
        {
            "prospect_id": str(prospect.id),
            "type": "ai_remark",
            "content": remark,
        }
    )
    updated = await db.update_prospect(
        prospect.id,
        ProspectUpdate(last_action="Remarque Gemini"),
    )
    payload = _prospect_payload(updated or prospect)
    payload["remark"] = remark
    return payload


@app.post("/api/score")
async def score_all(campaign_id: Optional[UUID] = Query(default=None)):
    db = get_supabase()
    prospects = await db.get_prospects(campaign_id=campaign_id)
    campaigns = {c.id: c for c in await db.get_campaigns()}
    scored = []
    errors = []
    for prospect in prospects:
        campaign = campaigns.get(prospect.campaign_id)
        if not campaign:
            errors.append({"id": str(prospect.id), "error": "campagne introuvable"})
            continue
        try:
            updated = await _score_one(db, prospect, campaign)
            scored.append(_prospect_payload(updated))
        except Exception as exc:
            errors.append({"id": str(prospect.id), "name": prospect.company_name, "error": re.sub(r"key=[^&\s'\"]+", "key=***", str(exc))[:200]})
    return {"scored": len(scored), "errors": errors, "prospects": scored}


@app.get("/api/campaigns")
async def list_campaigns():
    db = get_supabase()
    campaigns = await db.get_campaigns()
    prospects = await db.get_prospects()
    by_campaign: dict[str, list] = {}
    for prospect in prospects:
        by_campaign.setdefault(str(prospect.campaign_id), []).append(prospect)
    return [_campaign_payload(c, by_campaign.get(str(c.id), [])) for c in campaigns]


@app.get("/api/campaigns/{campaign_id}")
async def get_campaign(campaign_id: UUID):
    db = get_supabase()
    campaign = await db.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne introuvable")
    prospects = await db.get_prospects(campaign_id=campaign_id)
    return {
        **_campaign_payload(campaign, prospects),
        "prospects_list": [_prospect_payload(p) for p in prospects],
    }


@app.get("/api/prospects")
async def list_prospects(campaign_id: Optional[UUID] = Query(default=None)):
    db = get_supabase()
    prospects = await db.get_prospects(campaign_id=campaign_id)
    return [_prospect_payload(p) for p in prospects]


@app.get("/api/prospects/{prospect_id}")
async def get_prospect(prospect_id: str):
    db = get_supabase()
    prospect = None
    try:
        prospect = await db.get_prospect(UUID(prospect_id))
    except ValueError:
        prospect = await db.get_prospect_by_id(prospect_id)
    if not prospect:
        prospect = await db.get_prospect_by_id(prospect_id)
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect introuvable")
    campaign = await db.get_campaign(prospect.campaign_id)
    interactions = await db.get_interactions_by_prospect(prospect.id)
    return {
        **_prospect_payload(prospect),
        "campaign_name": campaign.name if campaign else NOT_AVAILABLE,
        "interactions": interactions,
    }


@app.get("/api/stats")
async def stats():
    db = get_supabase()
    campaigns = await db.get_campaigns()
    prospects = await db.get_prospects()
    statuses = Counter(p.status for p in prospects)
    scores = [float(p.ai_score or 0) for p in prospects]
    avg = round(sum(scores) / len(scores), 1) if scores else 0
    contacted = sum(1 for p in prospects if p.status in {"Contacté", "Relancé", "Répondu", "Converti", "Gagné"})
    converted = sum(1 for p in prospects if p.status in {"Converti", "Gagné"})
    buckets = [0] * 10
    for score in scores:
        idx = min(9, max(0, int(score)))
        buckets[idx] += 1
    by_campaign = []
    for campaign in campaigns:
        group = [p for p in prospects if p.campaign_id == campaign.id]
        qualified = sum(1 for p in group if float(p.ai_score or 0) >= (campaign.score_threshold or 7))
        by_campaign.append(
            {
                "id": str(campaign.id),
                "name": campaign.name,
                "prospects": len(group),
                "qualified": qualified,
            }
        )
    return {
        "total_prospects": len(prospects),
        "total_campaigns": len(campaigns),
        "average_score": avg,
        "contacted": contacted,
        "converted": converted,
        "conversion_rate": round(100 * converted / len(prospects), 1) if prospects else 0,
        "statuses": dict(statuses),
        "score_histogram": buckets,
        "campaigns": by_campaign,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("prospectai.main:app", host="0.0.0.0", port=8000, reload=True)
