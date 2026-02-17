'use client';

import SearchForm from '@/components/SearchForm';
import type { SearchRequest } from '@/types/game';

export default function SearchSection() {
  const handleSearch = (req: SearchRequest) => {
    window.open('/results?q=' + encodeURIComponent(JSON.stringify(req)), '_blank');
  };

  return <SearchForm onSearch={handleSearch} />;
}
