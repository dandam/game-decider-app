"""Parser for extracting game statistics from BGA player profile HTML files."""
import re
from pathlib import Path
from typing import Dict, List, Optional
from bs4 import BeautifulSoup


class PlayerStatsParser:
    """Parses game statistics from BGA player profile HTML files."""
    
    def __init__(self):
        """Initialize the parser."""
        pass
    
    def parse_player_stats(self, profile_html_path: Path) -> Dict:
        """Parse game statistics from a player's profile HTML file.
        
        Args:
            profile_html_path: Path to the player's profile HTML file
            
        Returns:
            Dictionary containing player stats with game statistics
        """
        try:
            with open(profile_html_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract player basic info
            player_name_elem = soup.find('span', id='real_player_name')
            player_name = player_name_elem.get_text().strip() if player_name_elem else "Unknown"
            
            # Extract overall stats from header
            overall_stats = self._extract_overall_stats(soup)
            
            # Extract game-specific statistics
            game_stats = self._extract_game_statistics(soup)
            
            return {
                "player_name": player_name,
                "overall_stats": overall_stats,
                "game_statistics": game_stats,
                "total_games_with_stats": len(game_stats)
            }
            
        except Exception as e:
            print(f"Error parsing player stats from {profile_html_path}: {e}")
            return {
                "player_name": "Unknown",
                "overall_stats": {},
                "game_statistics": [],
                "total_games_with_stats": 0
            }
    
    def _extract_overall_stats(self, soup: BeautifulSoup) -> Dict:
        """Extract overall player statistics from the page header."""
        stats = {}
        
        try:
            # Extract XP
            xp_elem = soup.find('div', class_='xp_container')
            if xp_elem:
                xp_text = xp_elem.get_text().strip()
                xp_match = re.search(r'(\d+)\s*XP', xp_text)
                if xp_match:
                    stats['total_xp'] = int(xp_match.group(1))
            
            # Extract total games played
            games_elem = soup.find('div', id='pageheader_lastresults')
            if games_elem:
                games_text = games_elem.get_text().strip()
                games_match = re.search(r'(\d+(?:\s*\d+)*)\s*games played', games_text)
                if games_match:
                    # Remove spaces from number (e.g., "1 238" -> "1238")
                    games_str = games_match.group(1).replace(' ', '')
                    stats['total_games_played'] = int(games_str)
            
            # Extract friends count
            friends_elem = soup.find('div', id='pageheader_friends')
            if friends_elem:
                friends_text = friends_elem.get_text().strip()
                friends_match = re.search(r'(\d+)\s*friends?', friends_text)
                if friends_match:
                    stats['total_friends'] = int(friends_match.group(1))
                    
        except Exception as e:
            print(f"Error extracting overall stats: {e}")
        
        return stats
    
    def _extract_game_statistics(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract game-specific statistics from palmares_game sections."""
        game_stats = []
        
        try:
            # Find all game statistics sections
            game_sections = soup.find_all('div', class_='palmares_game')
            
            for section in game_sections:
                game_stat = self._parse_game_section(section)
                if game_stat:
                    game_stats.append(game_stat)
                    
        except Exception as e:
            print(f"Error extracting game statistics: {e}")
        
        return game_stats
    
    def _parse_game_section(self, section) -> Optional[Dict]:
        """Parse a single game statistics section."""
        try:
            game_stat = {}
            
            # Extract game name and URL
            game_link = section.find('a', class_='gamename')
            if game_link:
                game_stat['game_name'] = game_link.get_text().strip()
                href = game_link.get('href', '')
                # Extract game identifier from href like "gamepanel?game=welcometo"
                game_match = re.search(r'game=([^&]+)', href)
                if game_match:
                    game_stat['game_identifier'] = game_match.group(1)
            
            # Extract game icon URL
            game_icon = section.find('img', class_='palmares_gameicon')
            if game_icon:
                icon_src = game_icon.get('src', '')
                game_stat['icon_url'] = icon_src
                
                # Extract game ID from icon URL path
                # e.g., "/data/gamemedia/welcometo/icon/default.png" -> "welcometo"
                icon_match = re.search(r'/gamemedia/([^/]+)/', icon_src)
                if icon_match:
                    game_stat['game_slug'] = icon_match.group(1)
            
            # Extract rank/ELO information
            rank_elem = section.find('div', class_=re.compile(r'gamerank'))
            if rank_elem:
                rank_classes = rank_elem.get('class', [])
                
                # Determine rank level from CSS classes
                if 'gamerank_beginner' in rank_classes:
                    game_stat['rank_level'] = 'beginner'
                elif 'gamerank_apprentice' in rank_classes:
                    game_stat['rank_level'] = 'apprentice'
                elif 'gamerank_average' in rank_classes:
                    game_stat['rank_level'] = 'average'
                elif 'gamerank_good' in rank_classes:
                    game_stat['rank_level'] = 'good'
                elif 'gamerank_strong' in rank_classes:
                    game_stat['rank_level'] = 'strong'
                elif 'gamerank_expert' in rank_classes:
                    game_stat['rank_level'] = 'expert'
                elif 'gamerank_master' in rank_classes:
                    game_stat['rank_level'] = 'master'
                else:
                    game_stat['rank_level'] = 'unknown'
                
                # Extract ELO/rank value
                rank_value_elem = rank_elem.find('span', class_='gamerank_value')
                if rank_value_elem:
                    rank_text = rank_value_elem.get_text().strip()
                    if rank_text.isdigit():
                        game_stat['elo_rating'] = int(rank_text)
                    else:
                        game_stat['rank_text'] = rank_text
            
            # Extract game statistics from palmares_details
            details_elem = section.find('div', class_='palmares_details')
            if details_elem:
                details_text = details_elem.get_text()
                
                # Extract games played (including training games)
                games_match = re.search(r'(\d+)\s*(?:\([+](\d+)\))?\s*Games', details_text)
                if games_match:
                    game_stat['games_played'] = int(games_match.group(1))
                    if games_match.group(2):
                        game_stat['training_games'] = int(games_match.group(2))
                
                # Extract victories
                victories_match = re.search(r'(\d+)\s*Victories', details_text)
                if victories_match:
                    game_stat['victories'] = int(victories_match.group(1))
                
                # Extract win percentage
                win_percent_match = re.search(r'(\d+)%\s*wins', details_text)
                if win_percent_match:
                    game_stat['win_percentage'] = int(win_percent_match.group(1))
                
                # Calculate additional stats
                if 'games_played' in game_stat and 'victories' in game_stat:
                    game_stat['losses'] = game_stat['games_played'] - game_stat['victories']
                    if game_stat['games_played'] > 0:
                        calculated_win_rate = (game_stat['victories'] / game_stat['games_played']) * 100
                        game_stat['calculated_win_percentage'] = round(calculated_win_rate, 1)
            
            # Extract BGA game ID from the statistics link
            stats_link = section.find('a', href=re.compile(r'playerstat\?id=\d+&game=\d+'))
            if stats_link:
                href = stats_link.get('href', '')
                game_id_match = re.search(r'game=(\d+)', href)
                if game_id_match:
                    game_stat['bga_game_id'] = game_id_match.group(1)
            
            return game_stat if game_stat else None
            
        except Exception as e:
            print(f"Error parsing game section: {e}")
            return None
    
    def save_extracted_stats(self, player_stats: Dict, output_path: Path) -> None:
        """Save extracted stats to a JSON file."""
        import json
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(player_stats, f, indent=2, ensure_ascii=False)
            print(f"Saved player stats to {output_path}")
        except Exception as e:
            print(f"Error saving stats to {output_path}: {e}")


def process_all_player_stats(data_root: Path) -> Dict[str, Dict]:
    """Process all player profile HTML files and extract statistics.
    
    Args:
        data_root: Root data directory path
        
    Returns:
        Dictionary mapping player names to their statistics
    """
    parser = PlayerStatsParser()
    all_player_stats = {}
    
    player_profiles_dir = data_root / "raw" / "player-profiles"
    
    if not player_profiles_dir.exists():
        print(f"Player profiles directory not found: {player_profiles_dir}")
        return all_player_stats
    
    for player_dir in player_profiles_dir.iterdir():
        if not player_dir.is_dir() or player_dir.name.startswith('.'):
            continue
            
        player_name = player_dir.name
        
        # Look for profile HTML file
        profile_file = player_dir / f"{player_name}-profile.html"
        if not profile_file.exists():
            profile_file = player_dir / f"{player_name}-bga-profile.html"
        
        if not profile_file.exists():
            print(f"No profile HTML file found for {player_name}")
            continue
        
        print(f"Processing stats for {player_name}...")
        player_stats = parser.parse_player_stats(profile_file)
        all_player_stats[player_name] = player_stats
        
        # Save individual player stats
        stats_output_dir = data_root / "raw" / "player-stats" / player_name
        stats_output_dir.mkdir(parents=True, exist_ok=True)
        
        stats_file = stats_output_dir / f"{player_name}-extracted-stats.json"
        parser.save_extracted_stats(player_stats, stats_file)
    
    return all_player_stats 