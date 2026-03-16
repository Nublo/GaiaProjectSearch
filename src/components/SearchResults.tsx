import Image from 'next/image';
import GameCard from './GameCard';
import type { GameResult, SearchRequest, StructureCondition, ResearchCondition } from '@/types/game';
import { getFinalScoringName, RESEARCH_TRACK_SHORT_NAMES } from '@/lib/gaia-constants';

const STRUCTURE_LABELS: Record<string, string> = {
  'mine': 'Mine',
  'trading-station': 'Trading Station',
  'research-lab': 'Research Lab',
  'knowledge-academy': 'Knowledge Academy',
  'qic-academy': 'QIC Academy',
  'planetary-institute': 'Planetary Institute',
};

const RACE_IMAGE_FILES: Record<string, string> = {
  'Terrans': 'Terrans_tile.png',
  'Lantids': 'Lantids_tile.png',
  'Xenos': 'Xenos_tile.png',
  'Gleens': 'Gleens_tile.png',
  'Taklons': 'Taklons_tile.png',
  'Ambas': 'Ambass_tile.png',
  'Hadsch Hallas': 'HadshHallas_tile.png',
  'Ivits': 'Ivits_tile.png',
  'Geodens': 'Geodens_tile.png',
  "Bal T'aks": 'Baltaks_tile.png',
  'Firacs': 'Firacs_tile.png',
  'Bescods': 'Bescods_tile.png',
  'Nevlas': 'Nevlas_tile.png',
  'Itars': 'Itars_tile.png',
};

function structureChipLabel(cond: StructureCondition): string {
  if (!cond.structure) return 'Present';
  const label = STRUCTURE_LABELS[cond.structure] ?? cond.structure;
  return cond.maxRound ? `${label} (round ≤ ${cond.maxRound})` : label;
}

function researchChipLabel(cond: ResearchCondition): string {
  const parts: string[] = [];
  if (cond.track) parts.push(RESEARCH_TRACK_SHORT_NAMES[cond.track] ?? `Track ${cond.track}`);
  if (cond.minLevel !== undefined) parts.push(`≥${cond.minLevel}`);
  if (cond.maxRound) parts.push(`(round ≤ ${cond.maxRound})`);
  return parts.join(' ');
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-800">
      <span className="font-medium text-blue-600">{label}:</span>
      {value}
    </span>
  );
}

function FractionFilterChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-800">
      {children}
    </span>
  );
}

function SearchCriteriaSummary({ req }: { req: SearchRequest }) {
  // Group structure + research conditions by race
  const fractionMap = new Map<string, { structures: StructureCondition[]; research: ResearchCondition[] }>();

  for (const cond of req.structureConditions ?? []) {
    const key = cond.race ?? '';
    if (!fractionMap.has(key)) fractionMap.set(key, { structures: [], research: [] });
    fractionMap.get(key)!.structures.push(cond);
  }
  for (const cond of req.researchConditions ?? []) {
    const key = cond.race ?? '';
    if (!fractionMap.has(key)) fractionMap.set(key, { structures: [], research: [] });
    fractionMap.get(key)!.research.push(cond);
  }

  const hasFractionFilters = fractionMap.size > 0;
  const hasOtherFilters =
    req.winnerRace || req.winnerPlayerName || req.minPlayerElo ||
    req.playerCounts.length > 0 || req.playerNames.length > 0 || (req.finalScorings ?? []).length > 0;

  if (!hasFractionFilters && !hasOtherFilters) {
    return <p className="text-sm text-gray-500 italic">No filters applied — showing all games</p>;
  }

  return (
    <div className="space-y-3">
      {/* Non-fraction filters */}
      {hasOtherFilters && (
        <div className="flex flex-wrap gap-2">
          {req.winnerRace && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-800">
              <span className="font-medium text-blue-600">Winner</span>
              {RACE_IMAGE_FILES[req.winnerRace] && (
                <Image src={`/races/${RACE_IMAGE_FILES[req.winnerRace]}`} alt={req.winnerRace} width={48} height={48} className="rounded" />
              )}
            </span>
          )}
          {req.winnerPlayerName && <Chip label="Winner" value={req.winnerPlayerName} />}
          {req.minPlayerElo && <Chip label="Min ELO" value={`≥ ${req.minPlayerElo}`} />}
          {req.playerCounts.length > 0 && <Chip label="Players" value={req.playerCounts.join(' or ')} />}
          {req.playerNames.map((name) => <Chip key={name} label="Player" value={name} />)}
          {(req.finalScorings ?? []).map((id) => <Chip key={id} label="Final Scoring" value={getFinalScoringName(id)} />)}
        </div>
      )}

      {/* Fraction-grouped filters */}
      {Array.from(fractionMap.entries()).map(([race, { structures, research }]) => (
        <div key={race || '__any__'} className="flex items-center gap-2 flex-wrap">
          {race && RACE_IMAGE_FILES[race] && (
            <Image
              src={`/races/${RACE_IMAGE_FILES[race]}`}
              alt={race}
              width={32}
              height={32}
              className="rounded"
            />
          )}
          {structures.map((cond, i) => (
            <FractionFilterChip key={`s-${i}`}>
              {structureChipLabel(cond)}
            </FractionFilterChip>
          ))}
          {research.map((cond, i) => (
            <span key={`r-${i}`} className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 border border-green-300 rounded-full text-sm text-green-800">
              {researchChipLabel(cond)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

interface SearchResultsProps {
  games: GameResult[];
  total: number;
  isLoading?: boolean;
  searchRequest?: SearchRequest;
}

export default function SearchResults({ games, total, isLoading = false, searchRequest }: SearchResultsProps) {
  const criteriaBlock = searchRequest && (
    <div className="w-full max-w-4xl mx-auto px-6 pt-6 pb-3">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Active filters
        </h3>
        <SearchCriteriaSummary req={searchRequest} />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        {criteriaBlock}
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="text-center text-gray-600">
            <div className="animate-pulse">Searching games...</div>
          </div>
        </div>
      </>
    );
  }

  if (games.length === 0) {
    return (
      <>
        {criteriaBlock}
        <div className="w-full max-w-4xl mx-auto px-6 pb-6">
          <div className="text-center text-gray-600 bg-white rounded-lg shadow-md p-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {criteriaBlock}
      <div className="w-full max-w-4xl mx-auto px-6 pb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Found {total} game{total !== 1 ? 's' : ''}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              structureConditions={searchRequest?.structureConditions}
              researchConditions={searchRequest?.researchConditions}
              highlightedFinalScorings={searchRequest?.finalScorings}
            />
          ))}
        </div>
      </div>
    </>
  );
}
