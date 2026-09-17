"""
Workflow 2: Qualification IA
Scoring des prospects via Google Gemini.
"""
import asyncio
from typing import Any, Dict
from uuid import UUID
from prospectai.services import supabase, google_ai
from prospectai.models import Campaign, Prospect, ProspectUpdate
from prospectai.utils.logger import get_logger

logger = get_logger(__name__)

async def run_qualification(campaign_id: UUID) -> Dict[str, Any]:
    """
    Main function for Workflow 2: Qualification IA.
    
    Args:
        campaign_id: ID of the campaign to qualify prospects for
        
    Returns:
        Dictionary with results statistics
    """
    logger.info(f"Starting Workflow 2: Qualification IA for campaign {campaign_id}")
    
    stats = {
        'prospects_processed': 0,
        'prospects_qualified': 0,
        'prospects_rejected': 0,
        'errors': 0
    }
    
    try:
        # Get the campaign to get the score threshold
        campaign = await supabase.get_campaign(campaign_id)
        if not campaign:
            raise ValueError(f"Campaign not found: {campaign_id}")
        
        score_threshold = campaign.score_threshold
        logger.info(f"Campaign score threshold: {score_threshold}")
        
        # Get prospects that need qualification
        prospects = await supabase.get_prospects_by_campaign(
            campaign_id, 
            status='À qualifier'
        )
        
        logger.info(f"Found {len(prospects)} prospects to qualify")
        stats['prospects_processed'] = len(prospects)
        
        # Process prospects in batches to avoid rate limits
        batch_size = 10
        for i in range(0, len(prospects), batch_size):
            batch = prospects[i:i+batch_size]
            logger.info(f"Processing batch {i//batch_size + 1}/{(len(prospects)+batch_size-1)//batch_size}")
            
            # Process batch concurrently
            tasks = [_process_prospect_qualification(p, campaign, score_threshold) for p in batch]
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for j, result in enumerate(batch_results):
                prospect = batch[j]
                if isinstance(result, Exception):
                    logger.error(f"Error qualifying prospect {prospect.id}: {str(result)}")
                    stats['errors'] += 1
                    continue
                
                if result:  # True means qualified, False means rejected
                    stats['prospects_qualified'] += 1
                else:
                    stats['prospects_rejected'] += 1
            
            # Small delay between batches to avoid rate limits
            if i + batch_size < len(prospects):
                await asyncio.sleep(2)
        
        logger.info(f"Workflow 2 completed: {stats['prospects_qualified']} qualified, {stats['prospects_rejected']} rejected")
        return stats
        
    except Exception as e:
        logger.error(f"Error in Workflow 2: {str(e)}")
        stats['errors'] += 1
        raise

async def _process_prospect_qualification(
    prospect: Prospect, 
    campaign: Campaign, 
    score_threshold: int
) -> bool:
    """
    Process qualification for a single prospect.
    
    Returns:
        True if qualified (score >= threshold), False if rejected
    """
    try:
        # Prepare prospect data for scoring
        prospect_data = {
            'company_name': prospect.company_name,
            'domain': prospect.domain,
            'website_url': prospect.website_url,
            'sector': prospect.sector,
            'sub_sector': prospect.sub_sector,
            'location': prospect.location,
            'phone': prospect.phone,
            'email': prospect.email,
            'employee_count': prospect.employee_count,
            'size_category': prospect.size_category,
            'revenue': prospect.revenue,
            'revenue_status': prospect.revenue_status,
            'founded_year': prospect.founded_year,
            'experience_years': prospect.experience_years,
            'products_services': prospect.products_services,
            'description': prospect.description,
            'rating': prospect.rating,
            'review_count': prospect.review_count,
            'digital_presence': prospect.digital_presence,
            'commercial_signals': prospect.commercial_signals,
            'sources': prospect.sources
        }
        
        # Prepare campaign context for scoring
        campaign_context = {
            'sector': campaign.sector,
            'location': campaign.location,
            'keywords_include': campaign.keywords_include,
            'keywords_exclude': campaign.keywords_exclude,
            'size_criteria': campaign.size_criteria,
            'commercial_signal': campaign.commercial_signal,
            'score_threshold': campaign.score_threshold
        }
        
        # Score Gemini
        score_result = await google_ai.score_prospect(prospect_data, campaign_context)
        
        # Update prospect with AI scoring results
        update_data = {
            'ai_score': score_result.score,
            'ai_justification': score_result.justification,
            'ai_positive_signals': score_result.signaux_positifs,
            'ai_negative_signals': score_result.signaux_negatifs,
            'ai_missing_data': score_result.donnees_manquantes,
            'status': 'Qualifié' if score_result.score >= score_threshold else 'Rejeté'
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        # Update in database
        await supabase.update_prospect(prospect.id, ProspectUpdate(**update_data))
        
        logger.debug(f"Prospect {prospect.id} scored {score_result.score}/10 - {'Qualifié' if score_result.score >= score_threshold else 'Rejeté'}")
        
        # Return True if qualified, False if rejected
        return score_result.score >= score_threshold
        
    except Exception as e:
        logger.error(f"Error processing qualification for prospect {prospect.id}: {str(e)}")
        # On error, mark as rejected to avoid leaving in limbo
        try:
            await supabase.update_prospect(
                prospect.id, 
                ProspectUpdate(
                    status='Rejeté',
                    ai_justification=f"Erreur lors de la qualification: {str(e)}",
                    ai_score=0
                )
            )
        except:
            pass  # Avoid error cascade
        return False

