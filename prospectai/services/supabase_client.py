"""
Supabase client service for ProspectAI.
Handles all database operations with proper error handling.
"""
from typing import List, Optional, Dict, Any, Union
from uuid import UUID
from datetime import datetime
import logging
from supabase import create_client, Client
from postgrest import APIError

from prospectai.config import config
from prospectai.models import (
    Campaign,
    CampaignCreate,
    CampaignUpdate,
    Prospect,
    ProspectCreate,
    ProspectUpdate,
)

logger = logging.getLogger(__name__)

class SupabaseClient:
    """Supabase client wrapper for ProspectAI operations."""
    
    def __init__(self):
        """Initialize the Supabase client."""
        if not config.SUPABASE_URL or not config.SUPABASE_KEY:
            raise ValueError("Supabase URL and Key must be configured in .env")
        
        self.client: Client = create_client(
            config.SUPABASE_URL,
            config.SUPABASE_KEY
        )
        logger.info("Supabase client initialized")
    
    # ========== CAMPAIGN METHODS ==========
    
    async def create_campaign(self, campaign: CampaignCreate, user_id: Optional[UUID] = None) -> Campaign:
        """Create a new campaign."""
        try:
            data = campaign.model_dump()
            if user_id:
                data['user_id'] = str(user_id)
            
            result = self.client.table('campaigns').insert(data).execute()
            
            if not result.data:
                raise Exception("No data returned from insert operation")
            
            logger.info(f"Campaign created: {result.data[0]['id']}")
            return Campaign(**result.data[0])
        except APIError as e:
            logger.error(f"Supabase API error creating campaign: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error creating campaign: {str(e)}")
            raise
    
    async def get_campaign(self, campaign_id: UUID) -> Optional[Campaign]:
        """Get a campaign by ID."""
        try:
            result = self.client.table('campaigns').select('*').eq('id', str(campaign_id)).execute()
            
            if not result.data:
                return None
            
            return Campaign(**result.data[0])
        except APIError as e:
            logger.error(f"Supabase API error getting campaign: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error getting campaign: {str(e)}")
            raise
    
    async def get_campaigns(self, user_id: Optional[UUID] = None, limit: int = 100, offset: int = 0) -> List[Campaign]:
        """Get campaigns, optionally filtered by user_id."""
        try:
            query = self.client.table('campaigns').select('*')
            
            if user_id:
                query = query.eq('user_id', str(user_id))
            
            result = query.range(offset, offset + limit - 1).execute()
            
            return [Campaign(**item) for item in result.data]
        except APIError as e:
            logger.error(f"Supabase API error getting campaigns: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error getting campaigns: {str(e)}")
            raise
    
    async def update_campaign(self, campaign_id: UUID, campaign: CampaignUpdate) -> Optional[Campaign]:
        """Update a campaign."""
        try:
            data = campaign.model_dump(exclude_unset=True)
            if not data:
                return await self.get_campaign(campaign_id)
            
            result = self.client.table('campaigns').update(data).eq('id', str(campaign_id)).execute()
            
            if not result.data:
                return None
            
            logger.info(f"Campaign updated: {campaign_id}")
            return Campaign(**result.data[0])
        except APIError as e:
            logger.error(f"Supabase API error updating campaign: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error updating campaign: {str(e)}")
            raise
    
    async def delete_campaign(self, campaign_id: UUID) -> bool:
        """Delete a campaign."""
        try:
            result = self.client.table('campaigns').delete().eq('id', str(campaign_id)).execute()
            
            if result.data:
                logger.info(f"Campaign deleted: {campaign_id}")
                return True
            return False
        except APIError as e:
            logger.error(f"Supabase API error deleting campaign: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error deleting campaign: {str(e)}")
            raise
    
    # ========== PROSPECT METHODS ==========
    
    async def create_prospect(self, prospect: ProspectCreate) -> Prospect:
        """Create a new prospect."""
        try:
            data = prospect.model_dump()
            result = self.client.table('prospects').insert(data).execute()
            
            if not result.data:
                raise Exception("No data returned from insert operation")
            
            logger.info(f"Prospect created: {result.data[0]['id']} for campaign {prospect.campaign_id}")
            return Prospect(**result.data[0])
        except APIError as e:
            if e.code == '23505':  # Unique violation
                logger.warning(f"Prospect already exists: {prospect.prospect_id}")
                # Return existing prospect instead of raising
                existing = await self.get_prospect_by_id(prospect.prospect_id)
                if existing:
                    return existing
            logger.error(f"Supabase API error creating prospect: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error creating prospect: {str(e)}")
            raise
    
    async def get_prospect(self, prospect_id: UUID) -> Optional[Prospect]:
        """Get a prospect by ID."""
        try:
            result = self.client.table('prospects').select('*').eq('id', str(prospect_id)).execute()
            
            if not result.data:
                return None
            
            return Prospect(**result.data[0])
        except APIError as e:
            logger.error(f"Supabase API error getting prospect: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error getting prospect: {str(e)}")
            raise
    
    async def get_prospect_by_id(self, prospect_id: str) -> Optional[Prospect]:
        """Get a prospect by its prospect_id (normalized domain)."""
        try:
            result = self.client.table('prospects').select('*').eq('prospect_id', prospect_id).execute()
            
            if not result.data:
                return None
            
            return Prospect(**result.data[0])
        except APIError as e:
            logger.error(f"Supabase API error getting prospect by ID: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error getting prospect by ID: {str(e)}")
            raise
    
    async def get_prospects_by_campaign(
        self, 
        campaign_id: UUID, 
        status: Optional[str] = None,
        limit: int = 100, 
        offset: int = 0
    ) -> List[Prospect]:
        """Get prospects for a campaign, optionally filtered by status."""
        try:
            query = self.client.table('prospects').select('*').eq('campaign_id', str(campaign_id))
            
            if status:
                query = query.eq('status', status)
            
            result = query.range(offset, offset + limit - 1).execute()
            
            return [Prospect(**item) for item in result.data]
        except APIError as e:
            logger.error(f"Supabase API error getting prospects: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error getting prospects: {str(e)}")
            raise

    async def get_prospects(
        self,
        campaign_id: Optional[UUID] = None,
        status: Optional[str] = None,
        limit: int = 200,
        offset: int = 0,
    ) -> List[Prospect]:
        try:
            query = self.client.table("prospects").select("*")
            if campaign_id:
                query = query.eq("campaign_id", str(campaign_id))
            if status:
                query = query.eq("status", status)
            result = (
                query.order("ai_score", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            return [Prospect(**item) for item in result.data]
        except APIError as e:
            logger.error(f"Supabase API error listing prospects: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error listing prospects: {str(e)}")
            raise
    
    async def update_prospect(self, prospect_id: UUID, prospect: ProspectUpdate) -> Optional[Prospect]:
        """Update a prospect."""
        try:
            data = prospect.model_dump(exclude_unset=True)
            if not data:
                return await self.get_prospect(prospect_id)
            
            # Always update the updated_at timestamp
            data['updated_at'] = datetime.now().isoformat()
            
            result = self.client.table('prospects').update(data).eq('id', str(prospect_id)).execute()
            
            if not result.data:
                return None
            
            logger.info(f"Prospect updated: {prospect_id}")
            return Prospect(**result.data[0])
        except APIError as e:
            logger.error(f"Supabase API error updating prospect: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error updating prospect: {str(e)}")
            raise
    
    async def delete_prospect(self, prospect_id: UUID) -> bool:
        """Delete a prospect."""
        try:
            result = self.client.table('prospects').delete().eq('id', str(prospect_id)).execute()
            
            if result.data:
                logger.info(f"Prospect deleted: {prospect_id}")
                return True
            return False
        except APIError as e:
            logger.error(f"Supabase API error deleting prospect: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error deleting prospect: {str(e)}")
            raise
    
    # ========== INTERACTION METHODS ==========
    
    async def create_interaction(self, interaction: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new interaction record."""
        try:
            result = self.client.table('interactions').insert(interaction).execute()
            
            if not result.data:
                raise Exception("No data returned from insert operation")
            
            logger.info(f"Interaction created for prospect: {interaction.get('prospect_id')}")
            return result.data[0]
        except APIError as e:
            logger.error(f"Supabase API error creating interaction: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error creating interaction: {str(e)}")
            raise
    
    async def get_interactions_by_prospect(self, prospect_id: UUID, limit: int = 50) -> List[Dict[str, Any]]:
        """Get interactions for a prospect."""
        try:
            result = self.client.table('interactions').select('*').eq('prospect_id', str(prospect_id)).order('created_at', desc=True).limit(limit).execute()
            
            return result.data
        except APIError as e:
            logger.error(f"Supabase API error getting interactions: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Error getting interactions: {str(e)}")
            raise
    
    # ========== UTILITY METHODS ==========
    
    async def prospect_exists(self, prospect_id: str) -> bool:
        """Check if a prospect already exists by prospect_id."""
        try:
            result = self.client.table('prospects').select('id').eq('prospect_id', prospect_id).limit(1).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error checking prospect existence: {str(e)}")
            return False  # Fail safe - assume doesn't exist to allow creation
    
    async def get_campaign_stats(self, campaign_id: UUID) -> Dict[str, Any]:
        """Get statistics for a campaign."""
        try:
            # Get counts by status
            result = self.client.table('prospects').select('status').eq('campaign_id', str(campaign_id)).execute()
            
            stats = {
                'total': len(result.data),
                'À qualifier': 0,
                'Qualifié': 0,
                'Rejeté': 0,
                'Contacté': 0,
                'Relancé': 0,
                'Répondu': 0,
                'Converti': 0,
                'Perdu': 0,
                'Classé': 0,
                'À relancer plus tard': 0
            }
            
            for prospect in result.data:
                status = prospect['status']
                if status in stats:
                    stats[status] += 1
            
            return stats
        except Exception as e:
            logger.error(f"Error getting campaign stats: {str(e)}")
            return {}

_instance: Optional[SupabaseClient] = None


def get_supabase() -> SupabaseClient:
    global _instance
    if _instance is None:
        _instance = SupabaseClient()
    return _instance


supabase = None
