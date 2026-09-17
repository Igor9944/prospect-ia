from prospectai.services.google_ai_service import get_google_ai
from prospectai.services.supabase_client import get_supabase


class _Lazy:
    def __init__(self, factory):
        self._factory = factory

    def __getattr__(self, name):
        return getattr(self._factory(), name)


supabase = _Lazy(get_supabase)
google_ai = _Lazy(get_google_ai)


def __getattr__(name: str):
    if name == "google_search":
        from prospectai.services.google_search import google_search as instance
        return instance
    if name == "enrichment":
        from prospectai.services.enrichment import enrichment as instance
        return instance
    if name == "gmail":
        from prospectai.services.gmail_service import gmail as instance
        return instance
    raise AttributeError(name)
