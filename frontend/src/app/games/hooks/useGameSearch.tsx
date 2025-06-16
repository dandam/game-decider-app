'use client';

import { useState, useEffect, useCallback } from 'react';
import { UseGameSearchReturn } from '../types/games';

export function useGameSearch(delay = 300): UseGameSearchReturn {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search value
  useEffect(() => {
    if (searchValue !== debouncedSearchValue) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [searchValue, delay, debouncedSearchValue]);

  const clearSearch = useCallback(() => {
    setSearchValue('');
    setDebouncedSearchValue('');
    setIsSearching(false);
  }, []);

  return {
    searchValue,
    setSearchValue,
    debouncedSearchValue,
    clearSearch,
    isSearching,
  };
}
