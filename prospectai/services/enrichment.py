"""
Web enrichment service for ProspectAI.
Handles scraping and enrichment of prospect data from websites.
"""
import logging
import re
from typing import Dict, Any, List, Optional
from urllib.parse import urljoin, urlparse
import httpx
from bs4 import BeautifulSoup
from prospectai.config import config
from prospectai.models import ProspectCreate
from prospectai.utils.deduplication import normalize_company_name, normalize_domain
from prospectai.utils.validators import is_valid_email, is_valid_phone

logger = logging.getLogger(__name__)

class EnrichmentService:
    """Service for enriching prospect data through web scraping."""
    
    def __init__(self):
        """Initialize the enrichment service with HTTP client."""
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.timeout = 15.0
        logger.info("Enrichment service initialized")
    
    async def enrich_prospect(self, domain: str, company_name: str = None) -> Dict[str, Any]:
        """
        Enrich prospect data by scraping the company website.
        
        Args:
            domain: Company domain (e.g., 'example.com')
            company_name: Company name (optional, for validation)
            
        Returns:
            Dictionary with enriched prospect data
        """
        # Ensure domain is properly formatted
        if not domain.startswith(('http://', 'https://')):
            url = f"https://{domain}"
        else:
            url = domain
            
        parsed_url = urlparse(url)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        
        enriched_data = {
            'domain': parsed_url.netloc,
            'website_url': url,
            'sources': {}
        }
        
        try:
            # Fetch the homepage
            async with httpx.AsyncClient(
                headers=self.headers,
                timeout=self.timeout,
                follow_redirects=True
            ) as client:
                response = await client.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract basic information
                enriched_data.update(self._extract_basic_info(soup, base_url))
                
                # Look for contact page
                contact_url = self._find_contact_page(soup, base_url)
                if contact_url:
                    contact_data = await self._scrape_contact_page(client, contact_url)
                    enriched_data.update(contact_data)
                    enriched_data['sources']['contact'] = {
                        'url': contact_url,
                        'scraped_at': self._get_timestamp()
                    }
                
                # Look for about page
                about_url = self._find_about_page(soup, base_url)
                if about_url:
                    about_data = await self._scrape_about_page(client, about_url)
                    enriched_data.update(about_data)
                    enriched_data['sources']['about'] = {
                        'url': about_url,
                        'scraped_at': self._get_timestamp()
                    }
                
                # Look for products/services page
                products_url = self._find_products_page(soup, base_url)
                if products_url:
                    products_data = await self._scrape_products_page(client, products_url)
                    enriched_data.update(products_data)
                    enriched_data['sources']['products'] = {
                        'url': products_url,
                        'scraped_at': self._get_timestamp()
                    }
                    
        except httpx.TimeoutException:
            logger.warning(f"Timeout enriching {domain}")
            enriched_data['sources']['error'] = {
                'error': 'Timeout',
                'scraped_at': self._get_timestamp()
            }
        except httpx.HTTPStatusError as e:
            logger.warning(f"HTTP error enriching {domain}: {e.response.status_code}")
            enriched_data['sources']['error'] = {
                'error': f'HTTP {e.response.status_code}',
                'scraped_at': self._get_timestamp()
            }
        except Exception as e:
            logger.error(f"Error enriching {domain}: {str(e)}")
            enriched_data['sources']['error'] = {
                'error': str(e),
                'scraped_at': self._get_timestamp()
            }
        
        # Normalize and validate the data
        enriched_data = self._normalize_data(enriched_data, company_name)
        
        return enriched_data
    
    def _extract_basic_info(self, soup: BeautifulSoup, base_url: str) -> Dict[str, Any]:
        """Extract basic information from the homepage."""
        info = {}
        
        # Extract title for company name if not provided
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text().strip()
            # Clean up common title suffixes
            title = re.sub(r'\s*\|\s*.*$', '', title)
            title = re.sub(r'\s*-\s*.*$', '', title)
            if title and len(title) > 2:
                info['company_name'] = title
        
        # Extract meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            info['description'] = meta_desc['content'].strip()
        
        # Look for email addresses in text
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, soup.get_text())
        valid_emails = [email.lower() for email in emails if is_valid_email(email)]
        if valid_emails:
            # Take the first valid email that looks like a contact email
            info['email'] = valid_emails[0]
        
        # Look for phone numbers
        phone_pattern = r'(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}'
        phones = re.findall(phone_pattern, soup.get_text())
        # Flatten the tuple results from groups
        phones = [''.join(p).strip() for p in phones if any(p)]
        valid_phones = [p for p in phones if is_valid_phone(p)]
        if valid_phones:
            info['phone'] = valid_phones[0]
        
        # Look for address information
        address_indicators = ['adresse', 'address', 'location', 'localisation']
        for indicator in address_indicators:
            elements = soup.find_all(text=re.compile(indicator, re.I))
            if elements:
                # Try to get nearby text
                for elem in elements[:2]:  # Check first couple matches
                    parent = elem.parent
                    if parent:
                        text = parent.get_text().strip()
                        if len(text) > 10 and len(text) < 200:
                            info['location'] = text[:200]  # Limit length
                            break
                if 'location' in info:
                    break
        
        # Estimate digital presence based on site quality
        digital_presence = "basique"
        if soup.find('meta', attrs={'name': 'viewport'}):
            digital_presence = "moderne"  # Responsive design
        _ANALYTICS_RE = re.compile(r"gtag|analytics|facebook")
        if soup.find("script", attrs={"src": _ANALYTICS_RE}):
            digital_presence = "avancée"  # Has analytics/tracking
        info['digital_presence'] = digital_presence
        
        return info
    
    def _find_contact_page(self, soup: BeautifulSoup, base_url: str) -> Optional[str]:
        """Find the contact page URL."""
        contact_indicators = ['contact', 'contacts', 'nous contacter', 'contactez-nous', 
                            'get in touch', 'contact us']
        
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            text = link.get_text().lower().strip()
            
            # Check if link text or URL contains contact indicators
            if any(indicator in text for indicator in contact_indicators) or \
               any(indicator in href for indicator in contact_indicators):
                return urljoin(base_url, link['href'])
        
        return None
    
    def _find_about_page(self, soup: BeautifulSoup, base_url: str) -> Optional[str]:
        """Find the about page URL."""
        about_indicators = ['about', 'à propos', 'qui sommes-nous', 'our story', 
                           'company', 'entreprise', 'history', 'historique']
        
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            text = link.get_text().lower().strip()
            
            if any(indicator in text for indicator in about_indicators) or \
               any(indicator in href for indicator in about_indicators):
                return urljoin(base_url, link['href'])
        
        return None
    
    def _find_products_page(self, soup: BeautifulSoup, base_url: str) -> Optional[str]:
        """Find the products/services page URL."""
        products_indicators = ['products', 'services', 'produits', 'services', 
                             'solutions', 'offres', 'what we do', 'que faisons-nous']
        
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            text = link.get_text().lower().strip()
            
            if any(indicator in text for indicator in products_indicators) or \
               any(indicator in href for indicator in products_indicators):
                return urljoin(base_url, link['href'])
        
        return None
    
    async def _scrape_contact_page(self, client: httpx.AsyncClient, url: str) -> Dict[str, Any]:
        """Scrape contact information from contact page."""
        data = {}
        try:
            response = await client.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for emails
            email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
            emails = re.findall(email_pattern, soup.get_text())
            valid_emails = [email.lower() for email in emails if is_valid_email(email)]
            if valid_emails:
                # Prefer info@, contact@, hello@ etc.
                priority_emails = [e for e in valid_emails if 
                                 any(e.startswith(prefix) for prefix in 
                                     ['info@', 'contact@', 'hello@', 'bonjour@', 'salut@'])]
                if priority_emails:
                    data['email'] = priority_emails[0]
                elif valid_emails:
                    data['email'] = valid_emails[0]
            
            # Look for phones
            phone_pattern = r'(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}'
            phones = re.findall(phone_pattern, soup.get_text())
            phones = [''.join(p).strip() for p in phones if any(p)]
            valid_phones = [p for p in phones if is_valid_phone(p)]
            if valid_phones:
                data['phone'] = valid_phones[0]
                
        except Exception as e:
            logger.warning(f"Error scraping contact page {url}: {str(e)}")
        
        return data
    
    async def _scrape_about_page(self, client: httpx.AsyncClient, url: str) -> Dict[str, Any]:
        """Scrape information from about page."""
        data = {}
        try:
            response = await client.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for founding year
            text = soup.get_text()
            year_matches = re.findall(r'\b(19|20)\d{2}\b', text)
            if year_matches:
                years = [int(y) for y in year_matches if 1900 <= int(y) <= 2024]
                if years:
                    # Take the most reasonable founding year (not too recent)
                    valid_years = [y for y in years if y <= 2020]
                    if valid_years:
                        data['founded_year'] = min(valid_years)  # Earliest reasonable year
                    else:
                        data['founded_year'] = min(years)
            
            # Look for employee count
            emp_patterns = [
                r'(\d+)\s*employés?',
                r'(\d+)\s*employees?',
                r'equipe\s*de\s*(\d+)',
                r'team\s*of\s*(\d+)',
                r'(\d+)\s*personnes?'
            ]
            for pattern in emp_patterns:
                match = re.search(pattern, text, re.I)
                if match:
                    count = int(match.group(1))
                    if 1 <= count <= 10000:  # Reasonable range
                        data['employee_count'] = count
                        break
            
            # Look for description in main content
            # Try to get main article or about section
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile(r'about|main', re.I))
            if main_content:
                paragraphs = main_content.find_all('p')
                if paragraphs:
                    # Take the first substantial paragraph
                    for p in paragraphs[:3]:
                        text = p.get_text().strip()
                        if len(text) > 50:
                            data['description'] = text[:500]  # Limit length
                            break
                            
        except Exception as e:
            logger.warning(f"Error scraping about page {url}: {str(e)}")
        
        return data
    
    async def _scrape_products_page(self, client: httpx.AsyncClient, url: str) -> Dict[str, Any]:
        """Scrape products/services information."""
        data = {}
        try:
            response = await client.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for product/service descriptions
            # Try to find lists or cards describing services
            service_indicators = ['service', 'solution', 'produit', 'offre']
            
            # Look for headings with service-related text
            headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            service_headings = []
            for heading in headings:
                text = heading.get_text().lower()
                if any(indicator in text for indicator in service_indicators):
                    service_headings.append(heading)
            
            # Extract text following service headings
            services_text = []
            for heading in service_headings[:3]:  # Check first 3 service sections
                # Get next few elements after the heading
                next_elements = []
                current = heading.next_sibling
                count = 0
                while current and count < 3:
                    if hasattr(current, 'get_text'):
                        text = current.get_text().strip()
                        if text and len(text) > 10:
                            next_elements.append(text)
                    current = current.next_sibling
                    count += 1
                
                if next_elements:
                    services_text.extend(next_elements)
            
            if services_text:
                data['products_services'] = ' | '.join(services_text[:5])  # Limit length
            
            # Also look for generic lists that might contain services
            lists = soup.find_all(['ul', 'ol'])
            for ul in lists[:3]:
                items = ul.find_all('li')
                if len(items) >= 2:  # At least 2 list items
                    items_text = [li.get_text().strip() for li in items if li.get_text().strip()]
                    if items_text and all(len(item) > 5 for item in items_text):
                        data['products_services'] = ' | '.join(items_text[:5])
                        break
                        
        except Exception as e:
            logger.warning(f"Error scraping products page {url}: {str(e)}")
        
        return data
    
    def _normalize_data(self, data: Dict[str, Any], company_name: str = None) -> Dict[str, Any]:
        """Normalize and validate the enriched data."""
        normalized = {}
        
        # Company name - use provided if available, otherwise from scraping
        if company_name:
            normalized['company_name'] = company_name.strip()
        elif data.get('company_name'):
            normalized['company_name'] = data['company_name'].strip()
        
        # Domain
        if data.get('domain'):
            normalized['domain'] = normalize_domain(data['domain'])
        
        # Website URL
        if data.get('website_url'):
            normalized['website_url'] = data['website_url']
        
        # Other fields - copy if present and valid
        fields_to_copy = [
            'sector', 'sub_sector', 'location', 'phone', 'email',
            'employee_count', 'size_category', 'revenue', 'revenue_status',
            'founded_year', 'experience_years', 'products_services',
            'description', 'rating', 'review_count', 'digital_presence'
        ]
        
        for field in fields_to_copy:
            if field in data and data[field] is not None:
                # Special handling for certain fields
                if field == 'employee_count':
                    try:
                        val = int(data[field])
                        if val >= 0:
                            normalized[field] = val
                    except (ValueError, TypeError):
                        pass
                elif field == 'rating':
                    try:
                        val = float(data[field])
                        if 0 <= val <= 5:
                            normalized[field] = val
                    except (ValueError, TypeError):
                        pass
                elif field == 'review_count':
                    try:
                        val = int(data[field])
                        if val >= 0:
                            normalized[field] = val
                    except (ValueError, TypeError):
                        pass
                elif field in ['sector', 'sub_sector', 'location', 'phone', 'email',
                           'size_category', 'revenue', 'revenue_status',
                           'products_services', 'description', 'digital_presence']:
                    val = str(data[field]).strip()
                    if val:
                        normalized[field] = val
                else:
                    normalized[field] = data[field]
        
        # Commercial signals - ensure it's a list
        if 'commercial_signals' in data and isinstance(data['commercial_signals'], list):
            normalized['commercial_signals'] = [str(s).strip() for s in data['commercial_signals'] if s]
        
        # Sources - keep as is
        if 'sources' in data:
            normalized['sources'] = data['sources']
        
        return normalized
    
    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format."""
        from datetime import datetime
        return datetime.now().isoformat()

# Global instance
enrichment = EnrichmentService()
