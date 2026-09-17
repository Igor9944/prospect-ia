"""
Workflow 1: Recherche & Enrichissement
Handles searching for prospects and enriching their data.
"""
import asyncio
import logging
import re
from typing import List, Dict, Any
from uuid import UUID
from prospectai.config import config
from prospectai.services import supabase, google_ai, google_search, enrichment
from prospectai.models import CampaignCreate
from prospectai.utils.deduplication import generate_prospect_id
from prospectai.utils.logger import get_logger

logger = get_logger(__name__)

async def run_search_and_enrich(campaign_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main function for Workflow 1: Recherche & Enrichissement.
    
    Args:
        campaign_params: Dictionary containing campaign parameters
        
    Returns:
        Dictionary with results statistics
    """
    logger.info(f"Starting Workflow 1: Recherche & Enrichissement for campaign {campaign_params.get('name')}")
    
    stats = {
        'queries_generated': 0,
        'search_results': 0,
        'prospects_found': 0,
        'prospects_enriched': 0,
        'prospects_saved': 0,
        'errors': 0
    }
    
    try:
        logger.info("Generating search queries with Gemini...")
        logger.info("Generating search queries with Gemini...")
        queries = await _generate_search_queries(campaign_params)
        stats['queries_generated'] = len(queries)
        logger.info(f"Generated {len(queries)} search queries")
        
        # Step 2: Perform Google searches
        logger.info("Performing Google searches...")
        search_results = await _perform_searches(queries)
        stats['search_results'] = sum(len(r.items) for r in search_results)
        logger.info(f"Found {stats['search_results']} search results")
        
        # Step 3: Extract and deduplicate prospects
        logger.info("Extracting and deduplicating prospects...")
        prospects_data = await _extract_prospects_from_search_results(search_results, campaign_params)
        stats['prospects_found'] = len(prospects_data)
        logger.info(f"Found {len(prospects_data)} unique prospects")
        
        # Step 4: Enrich prospect data
        logger.info("Enriching prospect data...")
        enriched_prospects = await _enrich_prospects(prospects_data)
        stats['prospects_enriched'] = len(enriched_prospects)
        logger.info(f"Enriched {len(enriched_prospects)} prospects")
        
        # Step 5: Save to database
        logger.info("Saving prospects to database...")
        saved_count = await _save_prospects_to_db(enriched_prospects, campaign_params.get('id'))
        stats['prospects_saved'] = saved_count
        logger.info(f"Saved {saved_count} prospects to database")
        
        logger.info("Workflow 1 completed successfully")
        return stats
        
    except Exception as e:
        logger.error(f"Error in Workflow 1: {str(e)}")
        stats['errors'] += 1
        raise

async def _generate_search_queries(campaign_params: Dict[str, Any]) -> List[str]:
    """Génère des requêtes de recherche via Gemini, avec repli déterministe."""
    try:
        queries = await google_ai.generate_queries(campaign_params)
        if queries:
            return queries[:5]
    except Exception as exc:
        logger.warning("Gemini indisponible pour les requêtes (%s), repli local.", exc)

    queries: list[str] = []
    sector = campaign_params.get('sector', '')
    location = campaign_params.get('location', '')
    keywords_include = campaign_params.get('keywords_include', [])

    base_parts = []
    if sector:
        base_parts.append(sector)
    if location:
        base_parts.append(location)
    base_query = ' '.join(base_parts)

    if base_query:
        queries.append(f'"{base_query}" entreprise')

    if keywords_include:
        kw_part = ' '.join([f'"{kw}"' for kw in keywords_include[:3]])
        queries.append(f'{base_query} {kw_part}'.strip())

    if sector:
        queries.append(f'{sector} annuaire professionnel {location}')
        queries.append(f'{sector} actualités {location}')

    if campaign_params.get('commercial_signal'):
        queries.append(f'{campaign_params.get("commercial_signal")} {sector} {location}')

    queries = list(dict.fromkeys(q.strip() for q in queries if q and q.strip()))[:5]
    logger.info(f"Generated queries: {queries}")
    return queries

async def _perform_searches(queries: List[str]) -> List[Any]:
    """Perform Google searches for each query."""
    try:
        # Perform searches concurrently (but limit concurrency to be respectful)
        semaphore = asyncio.Semaphore(3)  # Max 3 concurrent searches
        
        async def search_with_semaphore(query):
            async with semaphore:
                try:
                    return await google_search.search(query, num_results=10)
                except Exception as e:
                    logger.warning(f"Search failed for query '{query}': {str(e)}")
                    return None
        
        tasks = [search_with_semaphore(query) for query in queries]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out failed searches
        valid_results = []
        for result in results:
            if isinstance(result, Exception):
                logger.warning(f"Search task failed: {str(result)}")
            elif result is not None:
                valid_results.append(result)
        
        return valid_results
        
    except Exception as e:
        logger.error(f"Error performing searches: {str(e)}")
        return []

async def _extract_prospects_from_search_results(
    search_results: List[Any], 
    campaign_params: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Extract prospect data from search results."""
    try:
        prospects = []
        seen_domains = set()
        
        for search_result in search_results:
            if not hasattr(search_result, 'items'):
                continue
                
            for item in search_result.items:
                try:
                    # Extract domain from URL
                    url = item.link
                    from urllib.parse import urlparse
                    parsed = urlparse(url)
                    domain = parsed.netloc.lower()
                    
                    # Remove www prefix
                    if domain.startswith('www.'):
                        domain = domain[4:]
                    
                    # Skip if domain is empty or too short
                    if not domain or len(domain) < 3:
                        continue
                    
                    # Skip known irrelevant domains
                    irrelevant_domains = {
                        'facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com',
                        'youtube.com', 'wikipedia.org', 'google.com', 'bing.com',
                        'yahoo.com', 'amazon.com', 'ebay.com', 'leboncoin.fr',
                        'pagesjaunes.fr', 'viadeo.fr', 'coinbase.com', 'github.com',
                        'stackoverflow.com', 'reddit.com', 'pinterest.com', 'tiktok.com',
                        'napster.com', 'spotify.com', 'netflix.com', 'twitch.tv'
                    }
                    
                    if any(irrelevant in domain for irrelevant in irrelevant_domains):
                        continue
                    
                    # Skip if we've already seen this domain
                    if domain in seen_domains:
                        continue
                    
                    # Extract company name from title
                    title = item.title
                    # Clean up common title patterns
                    title = re.sub(r'\s*\|\s*.*$', '', title)
                    title = re.sub(r'\s*-\s*.*$', '', title)
                    title = title.strip()
                    
                    # Skip if title is too short or generic
                    if not title or len(title) < 3:
                        continue
                    
                    generic_titles = {'accueil', 'home', 'welcome', 'bienvenue', 'page not found', '404'}
                    if title.lower() in generic_titles:
                        continue
                    
                    # Create prospect data
                    prospect_data = {
                        'company_name': title,
                        'domain': domain,
                        'website_url': url,
                        'sector': campaign_params.get('sector'),
                        'location': campaign_params.get('location'),
                        'prospect_id': generate_prospect_id(domain),
                        'sources': {
                            'search': {
                                'url': url,
                                'title': title,
                                'snippet': item.snippet,
                                'scraped_at': _get_timestamp()
                            }
                        }
                    }
                    
                    prospects.append(prospect_data)
                    seen_domains.add(domain)
                    
                except Exception as e:
                    logger.warning(f"Error extracting prospect from search result: {str(e)}")
                    continue
        
        logger.info(f"Extracted {len(prospects)} unique prospects from search results")
        return prospects
        
    except Exception as e:
        logger.error(f"Error extracting prospects from search results: {str(e)}")
        return []

async def _enrich_prospects(prospects_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Enrich prospect data with website scraping."""
    try:
        # Process prospects concurrently but limit to avoid overwhelming servers
        semaphore = asyncio.Semaphore(5)  # Max 5 concurrent enrichments
        
        async def enrich_with_semaphore(prospect_data):
            async with semaphore:
                try:
                    domain = prospect_data.get('domain')
                    company_name = prospect_data.get('company_name')
                    
                    if not domain:
                        return prospect_data
                    
                    # Enrich the prospect
                    enriched_data = await enrichment.enrich_prospect(domain, company_name)
                    
                    # Merge the data, giving preference to enriched data but keeping original as fallback
                    merged = prospect_data.copy()
                    for key, value in enriched_data.items():
                        if key == 'sources':
                            # Merge sources
                            if 'sources' not in merged:
                                merged['sources'] = {}
                            merged['sources'].update(value)
                        elif key not in merged or not merged[key]:
                            # Only use enriched data if original is missing or empty
                            merged[key] = value
                        elif key in ['commercial_signals'] and isinstance(value, list):
                            # Merge lists
                            merged[key] = list(set(merged[key] + value))
                    
                    return merged
                    
                except Exception as e:
                    logger.warning(f"Error enriching prospect {prospect_data.get('domain', 'unknown')}: {str(e)}")
                    # Return original data on enrichment failure
                    return prospect_data
        
        tasks = [enrich_with_semaphore(prospect) for prospect in prospects_data]
        enriched_prospects = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions
        valid_prospects = []
        for result in enriched_prospects:
            if isinstance(result, Exception):
                logger.warning(f"Enrichment task failed: {str(result)}")
            else:
                valid_prospects.append(result)
        
        logger.info(f"Enriched {len(valid_prospects)} prospects")
        return valid_prospects
        
    except Exception as e:
        logger.error(f"Error enriching prospects: {str(e)}")
        return prospects_data  # Return original data on failure

async def _save_prospects_to_db(
    prospects_data: List[Dict[str, Any]], 
    campaign_id: Optional[UUID]
) -> int:
    """Save enriched prospects to the database."""
    try:
        if not campaign_id:
            logger.error("No campaign ID provided for saving prospects")
            return 0
        
        saved_count = 0
        
        for prospect_data in prospects_data:
            try:
                # Check if prospect already exists
                prospect_id = prospect_data.get('prospect_id')
                if await prospect_exists(prospect_id):
                    logger.debug(f"Prospect already exists: {prospect_id}")
                    continue
                
                # Prepare prospect for insertion
                prospect_to_save = {
                    'campaign_id': str(campaign_id),
                    'prospect_id': prospect_id,
                    'company_name': prospect_data.get('company_name'),
                    'domain': prospect_data.get('domain'),
                    'website_url': prospect_data.get('website_url'),
                    'sector': prospect_data.get('sector'),
                    'sub_sector': prospect_data.get('sub_sector'),
                    'location': prospect_data.get('location'),
                    'phone': prospect_data.get('phone'),
                    'email': prospect_data.get('email'),
                    'employee_count': prospect_data.get('employee_count'),
                    'size_category': prospect_data.get('size_category'),
                    'revenue': prospect_data.get('revenue'),
                    'revenue_status': prospect_data.get('revenue_status'),
                    'founded_year': prospect_data.get('founded_year'),
                    'experience_years': prospect_data.get('experience_years'),
                    'products_services': prospect_data.get('products_services'),
                    'description': prospect_data.get('description'),
                    'rating': prospect_data.get('rating'),
                    'review_count': prospect_data.get('review_count'),
                    'digital_presence': prospect_data.get('digital_presence'),
                    'commercial_signals': prospect_data.get('commercial_signals', []),
                    'sources': prospect_data.get('sources', {}),
                    'status': 'À qualifier'
                }
                
                # Remove None values
                prospect_to_save = {k: v for k, v in prospect_to_save.items() if v is not None}
                
                # Save to database
                prospect = await supabase.create_prospect(ProspectCreate(**prospect_to_save))
                
                if prospect:
                    saved_count += 1
                    logger.debug(f"Saved prospect: {prospect.id}")
                else:
                    logger.warning(f"Failed to save prospect: {prospect_id}")
                    
            except Exception as e:
                logger.warning(f"Error saving prospect {prospect_data.get('prospect_id', 'unknown')}: {str(e)}")
                continue
        
        logger.info(f"Saved {saved_count} new prospects to database")
        return saved_count
        
    except Exception as e:
        logger.error(f"Error saving prospects to database: {str(e)}")
        return 0

async def prospect_exists(prospect_id: str) -> bool:
    """Check if a prospect already exists by prospect_id."""
    try:
        result = supabase.client.table('prospects').select('id').eq('prospect_id', prospect_id).limit(1).execute()
        return len(result.data) > 0
    except Exception as e:
        logger.error(f"Error checking prospect existence: {str(e)}")
        return False  # Fail safe - assume doesn't exist to allow creation

def _get_timestamp() -> str:
    """Get current timestamp in ISO format."""
    from datetime import datetime
    return datetime.now().isoformat()


