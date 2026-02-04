import { useLeads } from '@/context/LeadsContext';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Platform } from '@/data/mockLeads';
import { getPlatformLabel } from './PlatformBadge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function FilterPanel() {
  const { filters, setFilters, communities, inboxCounts } = useLeads();

  const handleRelevancyChange = (value: number[]) => {
    setFilters({ ...filters, relevancyRange: [value[0], value[1]] });
  };

  const handlePlatformSelect = (platform: Platform) => {
    setFilters({ ...filters, platforms: [platform] });
  };

  const handleCommunityToggle = (community: string, checked: boolean) => {
    const newCommunities = checked
      ? [...filters.communities, community]
      : filters.communities.filter((c) => c !== community);
    setFilters({ ...filters, communities: newCommunities });
  };

  const platforms: Platform[] = ['reddit', 'twitter', 'linkedin'];

  // Group communities by platform
  const communityGroups = communities.reduce((acc, community) => {
    const platform = community.platform;
    if (!acc[platform]) acc[platform] = [];
    acc[platform].push(community);
    return acc;
  }, {} as Record<Platform, typeof communities>);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground mb-1">Filters</h3>
        <p className="text-xs text-muted-foreground">
          {inboxCounts.unread} unread of {inboxCounts.all} total
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Relevancy Score */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Relevancy Score</Label>
            <div className="px-1">
              <Slider
                value={filters.relevancyRange}
                onValueChange={handleRelevancyChange}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.relevancyRange[0]}%</span>
              <span>{filters.relevancyRange[1]}%</span>
            </div>
          </div>

          {/* Platform Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Platforms</Label>
            <RadioGroup
              value={filters.platforms[0]}
              onValueChange={(value) => handlePlatformSelect(value as Platform)}
              className="space-y-2"
            >
              {platforms.map((platform) => (
                <div key={platform} className="flex items-center gap-2">
                  <RadioGroupItem value={platform} id={`platform-${platform}`} />
                  <Label
                    htmlFor={`platform-${platform}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {getPlatformLabel(platform)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Communities Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Communities</Label>
            <div className="space-y-4">
              {platforms.map((platform) => {
                const platformCommunities = communityGroups[platform];
                if (!platformCommunities || platformCommunities.length === 0) return null;

                return (
                  <div key={platform} className="space-y-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      {getPlatformLabel(platform)}
                    </span>
                    <div className="space-y-1">
                      {platformCommunities.map((community) => (
                        <div key={community.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`community-${community.id}`}
                            checked={filters.communities.includes(community.name)}
                            onCheckedChange={(checked) =>
                              handleCommunityToggle(community.name, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`community-${community.id}`}
                            className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
                          >
                            <span className="truncate">{community.name}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {community.leadCount}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
