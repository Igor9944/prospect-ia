from prospectai.models.campaign import Campaign, CampaignCreate, CampaignUpdate
from prospectai.models.prospect import (
    NOT_AVAILABLE,
    Prospect,
    ProspectCreate,
    ProspectStatus,
    ProspectUpdate,
)
from prospectai.models.ai_schemas import (
    AIAnalysisResult,
    AIEmailResult,
    AIScoreResult,
    GoogleSearchResponse,
    GoogleSearchResult,
    InteractionCreate,
    SearchQueriesResult,
)

__all__ = [
    "Campaign",
    "CampaignCreate",
    "CampaignUpdate",
    "Prospect",
    "ProspectCreate",
    "ProspectUpdate",
    "ProspectStatus",
    "NOT_AVAILABLE",
    "AIScoreResult",
    "AIEmailResult",
    "AIAnalysisResult",
    "GoogleSearchResult",
    "GoogleSearchResponse",
    "SearchQueriesResult",
    "InteractionCreate",
]
