/**
 * Gaia Project game constants
 *
 * This file contains mappings for races, buildings, actions, and other
 * game elements as they appear in BGA game logs.
 */

// ============================================================================
// RACES
// ============================================================================

export enum RaceId {
  TERRANS = 1,
  LANTIDS = 2,
  XENOS = 3,
  GLEENS = 4,
  TAKLONS = 5,
  AMBAS = 6,
  HADSCH_HALLAS = 7,
  IVITS = 8,
  GEODENS = 9,
  BAL_TAKS = 10,
  FIRACS = 11,
  BESCODS = 12,
  NEVLAS = 13,
  ITARS = 14,
}

export const RACE_NAMES: Record<RaceId, string> = {
  [RaceId.TERRANS]: 'Terrans',
  [RaceId.LANTIDS]: 'Lantids',
  [RaceId.XENOS]: 'Xenos',
  [RaceId.GLEENS]: 'Gleens',
  [RaceId.TAKLONS]: 'Taklons',
  [RaceId.AMBAS]: 'Ambas',
  [RaceId.HADSCH_HALLAS]: 'Hadsch Hallas',
  [RaceId.IVITS]: 'Ivits',
  [RaceId.GEODENS]: 'Geodens',
  [RaceId.BAL_TAKS]: 'Bal T\'aks',
  [RaceId.FIRACS]: 'Firacs',
  [RaceId.BESCODS]: 'Bescods',
  [RaceId.NEVLAS]: 'Nevlas',
  [RaceId.ITARS]: 'Itars',
};

// Helper function to get race name
export function getRaceName(raceId: number): string {
  return RACE_NAMES[raceId as RaceId] || `Unknown Race (${raceId})`;
}

// ============================================================================
// BUILDINGS
// ============================================================================

export enum BuildingType {
  MINE = 4,
  TRADING_STATION = 5,
  RESEARCH_LAB = 6,
  ACADEMY_LEFT = 7,
  ACADEMY_RIGHT = 8,
  PLANETARY_INSTITUTE = 9,
  // Note: Gaia formers and space stations might have different IDs
}

export const BUILDING_NAMES: Record<BuildingType, string> = {
  [BuildingType.MINE]: 'Mine',
  [BuildingType.TRADING_STATION]: 'Trading Station',
  [BuildingType.RESEARCH_LAB]: 'Research Lab',
  [BuildingType.PLANETARY_INSTITUTE]: 'Planetary Institute',
  [BuildingType.ACADEMY_LEFT]: 'Academy (Knowledge)',
  [BuildingType.ACADEMY_RIGHT]: 'Academy (QIC)',
};

// Helper function to get building name
export function getBuildingName(buildingId: number): string {
  return BUILDING_NAMES[buildingId as BuildingType] || `Unknown Building (${buildingId})`;
}

// ============================================================================
// RESEARCH TRACKS
// ============================================================================

export enum ResearchTrack {
  TERRAFORMING = 1,
  NAVIGATION = 2,
  ARTIFICIAL_INTELLIGENCE = 3,
  GAIAFORMING = 4,
  ECONOMY = 5,
  SCIENCE = 6,
}

export const RESEARCH_TRACK_NAMES: Record<ResearchTrack, string> = {
  [ResearchTrack.TERRAFORMING]: 'Terraforming',
  [ResearchTrack.NAVIGATION]: 'Navigation',
  [ResearchTrack.ARTIFICIAL_INTELLIGENCE]: 'Artificial Intelligence',
  [ResearchTrack.GAIAFORMING]: 'Gaia Forming',
  [ResearchTrack.ECONOMY]: 'Economy',
  [ResearchTrack.SCIENCE]: 'Science',
};

// ============================================================================
// EVENT TYPES
// ============================================================================

export enum EventType {
  // Race selection
  NOTIFY_CHOOSE_RACE = 'notifyChooseRace',

  // Game state
  GAME_STATE_CHANGE = 'gameStateChange',

  // Round tracking
  NOTIFY_ROUND_END = 'notifyRoundEnd',

  // Building actions
  NOTIFY_BUILD = 'notifyBuild', // Building mines (structure 4)
  NOTIFY_UPGRADE = 'notifyUpgrade', // Upgrading to other structures

  // Research track advances
  NOTIFY_RESEARCH = 'notifyResearch', // Advancing on a research track (+1 to track level)

  // Scoring
  NOTIFY_SCORE = 'notifyScore', // Final scoring events (used to detect active final scoring missions)
}

// ============================================================================
// FINAL SCORING MISSIONS
// ============================================================================

export enum FinalScoringType {
  STRUCTURES_IN_FEDERATIONS = 1,
  STRUCTURES = 2,
  PLANET_TYPES = 3,
  GAIA_PLANETS = 4,
  SECTORS = 5,
  SATELLITES = 6,
}

export const FINAL_SCORING_NAMES: Record<FinalScoringType, string> = {
  [FinalScoringType.STRUCTURES_IN_FEDERATIONS]: 'Structures in Federations',
  [FinalScoringType.STRUCTURES]: 'Structures',
  [FinalScoringType.PLANET_TYPES]: 'Planet types',
  [FinalScoringType.GAIA_PLANETS]: 'Gaia planets',
  [FinalScoringType.SECTORS]: 'Sectors',
  [FinalScoringType.SATELLITES]: 'Satellites',
};

// Maps the `desc` field from notifyScore events to FinalScoringType IDs
export const FINAL_SCORING_DESC_TO_ID: Record<string, number> = {
  'Most structures in federations': FinalScoringType.STRUCTURES_IN_FEDERATIONS,
  'Most structures': FinalScoringType.STRUCTURES,
  'Most planet types': FinalScoringType.PLANET_TYPES,
  'Most Gaia planets': FinalScoringType.GAIA_PLANETS,
  'Most map tiles': FinalScoringType.SECTORS,
  'Most satellites': FinalScoringType.SATELLITES,
};

export function getFinalScoringName(id: number): string {
  return FINAL_SCORING_NAMES[id as FinalScoringType] || `Unknown Scoring (${id})`;
}

// ============================================================================
// ACTION KEYWORDS
// ============================================================================

// Keywords to search for in log messages to identify actions
export const ACTION_KEYWORDS = {
  BUILD_MINE: ['builds', 'mine', 'Build mine'],
  UPGRADE_TRADING_STATION: ['upgrade', 'trading station', 'Trading Station'],
  UPGRADE_RESEARCH_LAB: ['upgrade', 'research lab', 'Research Lab'],
  UPGRADE_PLANETARY_INSTITUTE: ['upgrade', 'planetary institute', 'Planetary Institute'],
  BUILD_ACADEMY: ['builds', 'academy', 'Academy'],
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PlayerRaceMapping {
  playerId: number;
  playerName: string;
  raceId: number;
  raceName: string;
  finalScore: number;
  playerElo: number | null; // Normalized ELO (with BGA offset subtracted)
  buildings: number[][]; // buildings[round] = [buildingId1, buildingId2, ...]
  research: number[][];    // research[roundIdx][trackIdx] = absolute level at end of that round (0-indexed)
  researchLevels: number[]; // [t1..t6] — current absolute levels during parsing, tracks 1-6 at indices 0-5
}

// Short display names for research tracks (for UI chips and labels)
export const RESEARCH_TRACK_SHORT_NAMES: Record<number, string> = {
  1: 'Terraforming',
  2: 'Navigation',
  3: 'AI',
  4: 'Gaia Forming',
  5: 'Economy',
  6: 'Science',
};

export interface BuildingAction {
  playerId: number;
  playerName: string;
  buildingType: BuildingType;
  buildingName: string;
  round: number;
  packetId: number;
  timestamp: number;
}
