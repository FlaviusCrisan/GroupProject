const GAMES = {
  fortnite: {
    name: 'Fortnite',
    modes: ['Solo', 'Duo', 'Trios', 'Squads', 'Creative', 'Zero Build'],
    ranks: ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite', 'Champion', 'Unreal'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile']
  },
  rainbow_six_siege: {
    name: 'Rainbow Six Siege',
    modes: ['Casual', 'Ranked', 'Unranked'],
    ranks: ['Copper', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Champion'],
    platforms: ['PC', 'PlayStation', 'Xbox']
  },
  valorant: {
    name: 'Valorant',
    modes: ['Unrated', 'Competitive', 'Spike Rush', 'Deathmatch'],
    ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'],
    platforms: ['PC']
  },
  rocket_league: {
    name: 'Rocket League',
    modes: ['Casual', 'Ranked 1v1', 'Ranked 2v2', 'Ranked 3v3', 'Rumble'],
    ranks: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion', 'Grand Champion', 'Supersonic Legend'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch']
  },
  league_of_legends: {
    name: 'League of Legends',
    modes: ['Normal', 'Ranked Solo', 'Ranked Flex', 'ARAM'],
    ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'],
    platforms: ['PC']
  },
  marvel_rivals: {
    name: 'Marvel Rivals',
    modes: ['Quick Match', 'Competitive', 'Custom'],
    ranks: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Grandmaster', 'Celestial', 'One Above All', 'Eternity'],
    platforms: ['PC', 'PlayStation', 'Xbox']
  },
  overwatch: {
    name: 'Overwatch',
    modes: ['Quick Play', 'Competitive', 'Arcade'],
    ranks: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Champion', 'Top 500'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch']
  },
  warzone: {
    name: 'Warzone',
    modes: ['Battle Royale', 'Resurgence', 'Plunder', 'Ranked'],
    ranks: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crimson', 'Iridescent', 'Top 250'],
    platforms: ['PC', 'PlayStation', 'Xbox']
  },
  minecraft: {
    name: 'Minecraft',
    modes: ['Survival', 'Creative', 'Hardcore', 'Minigames', 'PvP'],
    ranks: ['Any'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile']
  },
  cs2: {
    name: 'CS2',
    modes: ['Competitive', 'Casual', 'Deathmatch', 'Wingman'],
    ranks: ['Silver', 'Gold Nova', 'Master Guardian', 'Legendary Eagle', 'Supreme', 'Global Elite'],
    platforms: ['PC']
  },
  roblox: {
    name: 'Roblox',
    modes: ['Any Game', 'Roleplay', 'Tycoon', 'Obby', 'PvP', 'Building'],
    ranks: ['Any'],
    platforms: ['PC', 'Mobile', 'Xbox']
  },
  apex_legends: {
    name: 'Apex Legends',
    modes: ['Battle Royale', 'Ranked', 'Arenas', 'Control'],
    ranks: ['Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Predator'],
    platforms: ['PC', 'PlayStation', 'Xbox']
  }
};

const REGIONS = ['EU', 'NA', 'Asia', 'OCE', 'SA', 'ME', 'Africa'];

const LANGUAGES = [
  'English', 'Russian', 'Spanish', 'French', 'German',
  'Portuguese', 'Italian', 'Polish', 'Turkish', 'Arabic',
  'Japanese', 'Korean', 'Chinese'
];

const AGE_RANGES = ['Under 18', '18-25', '26-35', '36+'];

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

module.exports = { GAMES, REGIONS, LANGUAGES, AGE_RANGES, GENDERS };
