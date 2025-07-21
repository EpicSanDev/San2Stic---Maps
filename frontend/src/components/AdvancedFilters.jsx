import React, { useState, useCallback } from 'react';
import { Card, GlassCard } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';

const AdvancedFilters = ({ onFiltersChange, recordings }) => {
  const [filters, setFilters] = useState({
    quality: '',
    licenseType: '',
    creatorReputation: '',
    genre: '',
    dateRange: {
      start: '',
      end: ''
    },
    audioQuality: '',
    duration: {
      min: '',
      max: ''
    },
    location: {
      radius: '',
      center: null
    },
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handleDateRangeChange = useCallback((type, value) => {
    const newDateRange = { ...filters.dateRange, [type]: value };
    handleFilterChange('dateRange', newDateRange);
  }, [filters.dateRange, handleFilterChange]);

  const handleDurationChange = useCallback((type, value) => {
    const newDuration = { ...filters.duration, [type]: value };
    handleFilterChange('duration', newDuration);
  }, [filters.duration, handleFilterChange]);

  const clearFilters = useCallback(() => {
    const defaultFilters = {
      quality: '',
      licenseType: '',
      creatorReputation: '',
      genre: '',
      dateRange: { start: '', end: '' },
      audioQuality: '',
      duration: { min: '', max: '' },
      location: { radius: '', center: null },
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  }, [onFiltersChange]);

  const getUniqueValues = (key) => {
    if (!recordings) return [];
    const values = recordings.map(recording => recording[key]).filter(Boolean);
    return [...new Set(values)];
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') return value.start || value.end;
    if (key === 'duration') return value.min || value.max;
    if (key === 'location') return value.radius || value.center;
    if (key === 'sortBy' || key === 'sortOrder') return false;
    return value;
  }).length;

  return (
    <GlassCard className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Advanced Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </h3>
        <div className="flex gap-2">
          {activeFiltersCount > 0 && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
            >
              Clear All
            </Button>
          )}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Basic Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quality
              </label>
              <select
                value={filters.quality}
                onChange={(e) => handleFilterChange('quality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Qualities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                License Type
              </label>
              <select
                value={filters.licenseType}
                onChange={(e) => handleFilterChange('licenseType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Licenses</option>
                <option value="CC-BY">CC BY</option>
                <option value="CC-BY-SA">CC BY-SA</option>
                <option value="CC-BY-NC">CC BY-NC</option>
                <option value="CC-BY-NC-SA">CC BY-NC-SA</option>
                <option value="All Rights Reserved">All Rights Reserved</option>
                <option value="Public Domain">Public Domain</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Creator Reputation
              </label>
              <select
                value={filters.creatorReputation}
                onChange={(e) => handleFilterChange('creatorReputation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Any Reputation</option>
                <option value="high">High Reputation (&gt;1000)</option>
                <option value="medium">Medium Reputation (100-1000)</option>
                <option value="new">New Users (&lt;100)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Genre/Tags
              </label>
              <Input
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                placeholder="Enter tags..."
                className="w-full"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                placeholder="Start date"
              />
              <Input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                placeholder="End date"
              />
            </div>
          </div>

          {/* Duration Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (seconds)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                value={filters.duration.min}
                onChange={(e) => handleDurationChange('min', e.target.value)}
                placeholder="Min duration"
                min="0"
              />
              <Input
                type="number"
                value={filters.duration.max}
                onChange={(e) => handleDurationChange('max', e.target.value)}
                placeholder="Max duration"
                min="0"
              />
            </div>
          </div>

          {/* Audio Quality and Technical Specs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Audio Quality
            </label>
            <select
              value={filters.audioQuality}
              onChange={(e) => handleFilterChange('audioQuality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white max-w-md"
            >
              <option value="">Any Quality</option>
              <option value="lossless">Lossless (FLAC, WAV)</option>
              <option value="high">High Quality (320kbps+)</option>
              <option value="standard">Standard (128-320kbps)</option>
              <option value="low">Low Quality (&lt;128kbps)</option>
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="date">Date Added</option>
                <option value="popularity">Popularity</option>
                <option value="rating">Rating</option>
                <option value="duration">Duration</option>
                <option value="title">Title</option>
                <option value="creator">Creator</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Location Filter (future enhancement) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location Radius (km)
            </label>
            <Input
              type="number"
              value={filters.location.radius}
              onChange={(e) => handleFilterChange('location', { ...filters.location, radius: e.target.value })}
              placeholder="Search radius in km"
              min="0"
              max="1000"
              className="max-w-md"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Click on the map to set a center point for radius search
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default AdvancedFilters;