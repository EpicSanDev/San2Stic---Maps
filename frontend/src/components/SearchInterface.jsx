import React, { useState, useCallback, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { recordingsAPI } from '../utils/api';
import AdvancedFilters from './AdvancedFilters';
import Button from './ui/Button';
import Input from './ui/Input';
import { GlassCard } from './ui/GlassCard';

const SearchInterface = ({ onSearchResults, onError, initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [searchHistory, setSearchHistory] = useState([]);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('san2stic_search_history');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        console.warn('Failed to parse search history:', e);
      }
    }
  }, []);

  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter(value => {
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== '' && v !== null && v !== undefined);
      }
      return value !== '' && value !== null && value !== undefined;
    }).length;
    setActiveFiltersCount(count);
  }, [filters]);

  const saveSearchToHistory = useCallback((query, filtersUsed) => {
    if (!query.trim() && Object.keys(filtersUsed).length === 0) return;

    const searchEntry = {
      id: Date.now(),
      query: query.trim(),
      filters: filtersUsed,
      timestamp: new Date().toISOString()
    };

    const newHistory = [searchEntry, ...searchHistory.filter(h => h.id !== searchEntry.id)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('san2stic_search_history', JSON.stringify(newHistory));
  }, [searchHistory]);

  const handleSearch = useCallback(async (customQuery = null, customFilters = null) => {
    const queryToSearch = customQuery !== null ? customQuery : searchQuery;
    const filtersToApply = customFilters !== null ? customFilters : filters;
    
    setIsSearching(true);
    
    try {
      // Build search parameters
      const searchParams = {
        ...filtersToApply,
        query: queryToSearch.trim() || undefined,
        page: 1,
        limit: 50
      };

      // Convert date range filters if they exist
      if (filtersToApply.dateRange) {
        if (filtersToApply.dateRange.start) {
          searchParams.createdAfter = filtersToApply.dateRange.start;
        }
        if (filtersToApply.dateRange.end) {
          searchParams.createdBefore = filtersToApply.dateRange.end;
        }
        delete searchParams.dateRange;
      }

      // Convert duration filters
      if (filtersToApply.duration) {
        if (filtersToApply.duration.min) {
          searchParams.minDuration = parseInt(filtersToApply.duration.min) * 60; // Convert minutes to seconds
        }
        if (filtersToApply.duration.max) {
          searchParams.maxDuration = parseInt(filtersToApply.duration.max) * 60;
        }
        delete searchParams.duration;
      }

      // Convert location filters
      if (filtersToApply.location && filtersToApply.location.center && filtersToApply.location.radius) {
        const { center, radius } = filtersToApply.location;
        const radiusInDegrees = parseFloat(radius) / 111; // Rough conversion: 1 degree ≈ 111 km
        searchParams.minLat = center.lat - radiusInDegrees;
        searchParams.maxLat = center.lat + radiusInDegrees;
        searchParams.minLng = center.lng - radiusInDegrees;
        searchParams.maxLng = center.lng + radiusInDegrees;
        delete searchParams.location;
      }

      // Handle genre/tags filter
      if (filtersToApply.genre) {
        searchParams.tags = filtersToApply.genre;
        delete searchParams.genre;
      }

      // Map frontend filter names to backend names
      if (filtersToApply.licenseType) {
        searchParams.license = filtersToApply.licenseType;
        delete searchParams.licenseType;
      }

      // Convert sortBy values
      if (filtersToApply.sortBy) {
        searchParams.sortBy = filtersToApply.sortBy === 'date' ? 'created' : filtersToApply.sortBy;
      }

      const results = await recordingsAPI.searchRecordings(searchParams);
      
      // Save successful search to history
      saveSearchToHistory(queryToSearch, filtersToApply);
      
      onSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      onError(error.message);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, filters, onSearchResults, onError, saveSearchToHistory]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setIsAdvancedOpen(false);
  }, []);

  const loadSearchFromHistory = useCallback((historyItem) => {
    setSearchQuery(historyItem.query);
    setFilters(historyItem.filters);
    handleSearch(historyItem.query, historyItem.filters);
  }, [handleSearch]);

  const removeFromHistory = useCallback((itemId) => {
    const newHistory = searchHistory.filter(h => h.id !== itemId);
    setSearchHistory(newHistory);
    localStorage.setItem('san2stic_search_history', JSON.stringify(newHistory));
  }, [searchHistory]);

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <GlassCard className="p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search recordings by title, artist, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-4"
            />
          </div>
          
          <Button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="px-6"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="relative"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          
          {(searchQuery || activeFiltersCount > 0) && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="mt-3 flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </span>
          </div>
        )}
      </GlassCard>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <GlassCard className="p-4">
          <AdvancedFilters 
            onFiltersChange={handleFiltersChange}
            recordings={[]} // We don't need this for search
          />
        </GlassCard>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recent Searches
          </h3>
          <div className="space-y-2">
            {searchHistory.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <button
                  onClick={() => loadSearchFromHistory(item)}
                  className="flex-1 text-left text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white truncate"
                >
                  <span className="font-medium">{item.query || 'Advanced search'}</span>
                  {Object.keys(item.filters).length > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({Object.keys(item.filters).length} filters)
                    </span>
                  )}
                </button>
                <button
                  onClick={() => removeFromHistory(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default SearchInterface;