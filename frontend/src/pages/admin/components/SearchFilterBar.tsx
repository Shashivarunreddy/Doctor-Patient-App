import { Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onRefresh?: () => void;
  lastUpdated?: Date | null;
  isRefreshing?: boolean;
  /** Extra controls (date inputs, etc.) */
  children?: React.ReactNode;
}

export const SearchFilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  filterValues = {},
  onFilterChange,
  onRefresh,
  lastUpdated,
  isRefreshing = false,
  children,
}: SearchFilterBarProps) => {
  const timeSince = lastUpdated
    ? Math.round((Date.now() - lastUpdated.getTime()) / 1000)
    : null;

  const timeLabel =
    timeSince !== null
      ? timeSince < 60
        ? `${timeSince}s ago`
        : `${Math.floor(timeSince / 60)}m ago`
      : null;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Filters */}
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterValues[filter.key] || ''}
            onValueChange={(val) => onFilterChange?.(filter.key, val)}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value || '__all__'}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Extra children (date inputs, etc) */}
        {children}

        {/* Refresh Button */}
        {onRefresh && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 gap-1.5"
              aria-label="Refresh data"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {timeLabel && (
              <span className="text-[10px] font-medium text-zinc-400 whitespace-nowrap hidden sm:block">
                Updated {timeLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
