"""
Google Custom Search service for ProspectAI.
Handles web search operations for prospect discovery.
"""
import logging
from typing import List, Dict, Any, Optional
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from prospectai.config import config
from prospectai.models import GoogleSearchResponse, GoogleSearchResult

logger = logging.getLogger(__name__)

class GoogleSearchService:
    """Google Custom Search service wrapper."""
    
    def __init__(self):
        """Initialize the Google Custom Search service."""
        if not config.GOOGLE_API_KEY or not config.GOOGLE_CSE_ID:
            raise ValueError("Google API Key and CSE ID must be configured in .env")
        
        self.service = build(
            "customsearch", 
            "v1", 
            developerKey=config.GOOGLE_API_KEY,
            cache_discovery=False
        )
        logger.info("Google Custom Search service initialized")
    
    async def search(self, query: str, num_results: int = 10) -> GoogleSearchResponse:
        """
        Perform a Google Custom Search.
        
        Args:
            query: Search query string
            num_results: Number of results to return (max 10 per request)
            
        Returns:
            GoogleSearchResponse with search results
        """
        try:
            # Limit to max 10 results per request (API limitation)
            num_results = min(num_results, 10)
            
            result = self.service.cse().list(
                q=query,
                cx=config.GOOGLE_CSE_ID,
                num=num_results
            ).execute()
            
            # Convert to our response model
            search_response = GoogleSearchResponse(
                items=[
                    GoogleSearchResult(
                        title=item.get('title', ''),
                        snippet=item.get('snippet', ''),
                        link=item.get('link', '')
                    )
                    for item in result.get('items', [])
                ],
                searchInformation=result.get('searchInformation', {})
            )
            
            logger.info(f"Google search completed: '{query}' -> {len(search_response.items)} results")
            return search_response
            
        except HttpError as e:
            logger.error(f"Google API error: {e.resp.status} {e.content}")
            # Return empty response on error to avoid breaking workflow
            return GoogleSearchResponse(items=[], searchInformation={})
        except Exception as e:
            logger.error(f"Error performing Google search: {str(e)}")
            return GoogleSearchResponse(items=[], searchInformation={})
    
    async def search_multiple_queries(self, queries: List[str], results_per_query: int = 5) -> List[GoogleSearchResponse]:
        """
        Perform multiple searches in sequence.
        
        Args:
            queries: List of search queries
            results_per_query: Number of results per query
            
        Returns:
            List of GoogleSearchResponse objects
        """
        results = []
        for query in queries:
            try:
                result = await self.search(query, results_per_query)
                results.append(result)
                # Small delay to be respectful to the API
                import asyncio
                await asyncio.sleep(0.1)
            except Exception as e:
                logger.error(f"Error in search query '{query}': {str(e)}")
                results.append(GoogleSearchResponse(items=[], searchInformation={}))
        
        return results

# Global instance
google_search = GoogleSearchService()
