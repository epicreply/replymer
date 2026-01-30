import { useEffect, useMemo, useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioToggle } from '@/components/ui/radio-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Platform } from '@/data/mockLeads';
import { getPlatformLabel } from '@/components/leads/PlatformBadge';
import { useAuth } from '@/context/AuthContext';

const suggestedCommunities = [
  { name: 'r/smallbusiness', platform: 'reddit' as Platform },
  { name: 'r/growmybusiness', platform: 'reddit' as Platform },
  { name: '#buildinpublic', platform: 'twitter' as Platform },
  { name: 'Tech Startups', platform: 'linkedin' as Platform },
];
const platforms: Platform[] = ['reddit', 'twitter', 'linkedin'];

interface PlatformConnection {
  platform: Platform;
  is_connected: boolean;
}

interface MonitoredCommunity {
  id: string;
  name: string;
  platform: Platform;
}

interface MonitoredKeyword {
  id: string;
  keyword: string;
}

export default function CommunitiesPage() {
  const { accessToken, user } = useAuth();
  const selectedProjectId = useMemo(
    () => user?.projects?.find((project) => project.is_selected)?.id ?? user?.default_project_id ?? null,
    [user]
  );
  const [communities, setCommunities] = useState<MonitoredCommunity[]>([]);
  const [newCommunity, setNewCommunity] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('reddit');
  const [keywords, setKeywords] = useState<MonitoredKeyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [enabledPlatforms, setEnabledPlatforms] = useState<Platform[]>([]);
  const [isPlatformsLoading, setIsPlatformsLoading] = useState(true);
  const [isCommunitiesLoading, setIsCommunitiesLoading] = useState(true);
  const [isKeywordsLoading, setIsKeywordsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !selectedProjectId) {
      setCommunities([]);
      setKeywords([]);
      setEnabledPlatforms([]);
      setIsPlatformsLoading(false);
      setIsCommunitiesLoading(false);
      setIsKeywordsLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadSettings = async () => {
      try {
        setIsPlatformsLoading(true);
        setIsCommunitiesLoading(true);
        setIsKeywordsLoading(true);
        const headers = {
          Authorization: `Bearer ${accessToken}`,
          'X-Project-ID': selectedProjectId,
        };

        const [platformsResponse, communitiesResponse, keywordsResponse] = await Promise.all([
          fetch('https://internal-api.autoreply.ing/v1.0/platform-connections', {
            headers,
            signal: controller.signal,
          }),
          fetch('https://internal-api.autoreply.ing/v1.0/communities', {
            headers,
            signal: controller.signal,
          }),
          fetch('https://internal-api.autoreply.ing/v1.0/keywords', {
            headers,
            signal: controller.signal,
          }),
        ]);

        if (!platformsResponse.ok || !communitiesResponse.ok || !keywordsResponse.ok) {
          throw new Error('Failed to load community settings');
        }

        const parseItems = (data: unknown) => {
          if (Array.isArray(data)) {
            return data;
          }
          if (data && typeof data === 'object' && 'items' in data) {
            return (data as { items: unknown[] }).items ?? [];
          }
          return [];
        };

        const platformData = parseItems(await platformsResponse.json()) as PlatformConnection[];
        const communityData = parseItems(await communitiesResponse.json()) as MonitoredCommunity[];
        const keywordData = parseItems(await keywordsResponse.json()) as MonitoredKeyword[];

        setEnabledPlatforms(
          platformData
            .filter((connection) => connection.is_connected)
            .map((connection) => connection.platform)
            .filter((platform) => platforms.includes(platform))
        );
        setCommunities(
          communityData
            .filter((community) => platforms.includes(community.platform))
            .map((community) => ({
              id: community.id,
              name: community.name,
              platform: community.platform,
            }))
        );
        setKeywords(
          keywordData.map((keyword) => ({
            id: keyword.id,
            keyword: keyword.keyword,
          }))
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          toast({
            title: 'Error',
            description: 'Failed to load community settings.',
            variant: 'destructive',
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsPlatformsLoading(false);
          setIsCommunitiesLoading(false);
          setIsKeywordsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      controller.abort();
    };
  }, [accessToken, selectedProjectId]);

  const handleAddCommunity = async (name: string, platform: Platform) => {
    const trimmedName = name.trim();
    if (!trimmedName || !accessToken || !selectedProjectId) return;
    if (communities.some((community) => community.name === trimmedName)) {
      return;
    }

    try {
      const response = await fetch('https://internal-api.autoreply.ing/v1.0/communities', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Project-ID': selectedProjectId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform, name: trimmedName }),
      });

      if (response.status === 409) {
        toast({
          title: 'Community already exists for this project.',
          variant: 'destructive',
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to add community');
      }

      const data = await response.json();
      const createdCommunity: MonitoredCommunity = {
        id: data.id ?? data.community_id ?? trimmedName,
        name: data.name ?? trimmedName,
        platform: data.platform ?? platform,
      };

      setCommunities((prev) => [...prev, createdCommunity]);
      setNewCommunity('');
      toast({
        title: 'Community added',
        description: `${trimmedName} has been added to your monitored communities.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add community.',
        variant: 'destructive',
      });
    }
  };

  const handleAddSuggested = async (suggestion: typeof suggestedCommunities[0]) => {
    await handleAddCommunity(suggestion.name, suggestion.platform);
  };

  const handleAddKeyword = async () => {
    const trimmedKeyword = newKeyword.trim();
    if (!trimmedKeyword || !accessToken || !selectedProjectId) return;
    if (keywords.some((keyword) => keyword.keyword === trimmedKeyword)) return;

    try {
      const response = await fetch('https://internal-api.autoreply.ing/v1.0/keywords', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Project-ID': selectedProjectId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: trimmedKeyword }),
      });

      if (response.status === 409) {
        toast({
          title: 'Keyword already exists for this project.',
          variant: 'destructive',
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to add keyword');
      }

      const data = await response.json();
      setKeywords((prev) => [
        ...prev,
        {
          id: data.id ?? data.keyword_id ?? trimmedKeyword,
          keyword: data.keyword ?? trimmedKeyword,
        },
      ]);
      setNewKeyword('');
      toast({
        title: 'Keyword added',
        description: `${trimmedKeyword} has been added to your monitored keywords.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add keyword.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveKeyword = async (keywordId: string) => {
    if (!accessToken || !selectedProjectId) return;
    const keywordLabel = keywords.find((keyword) => keyword.id === keywordId)?.keyword;

    try {
      const response = await fetch(
        `https://internal-api.autoreply.ing/v1.0/keywords/${keywordId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Project-ID': selectedProjectId,
          },
        }
      );

      if (response.status === 404) {
        toast({
          title: 'Keyword not found.',
          variant: 'destructive',
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to remove keyword');
      }

      setKeywords((prev) => prev.filter((keyword) => keyword.id !== keywordId));
      toast({
        title: 'Keyword removed',
        description: keywordLabel
          ? `${keywordLabel} has been removed from monitoring.`
          : 'Keyword has been removed from monitoring.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove keyword.',
        variant: 'destructive',
      });
    }
  };

  const handlePlatformToggle = async (platform: Platform, checked: boolean) => {
    if (!accessToken || !selectedProjectId) return;

    try {
      const response = await fetch(
        `https://internal-api.autoreply.ing/v1.0/platform-connections/${platform}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Project-ID': selectedProjectId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_connected: checked }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update platform');
      }

      setEnabledPlatforms((prev) =>
        checked ? [...new Set([...prev, platform])] : prev.filter((item) => item !== platform)
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update platform.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveCommunity = async (communityId: string) => {
    if (!accessToken || !selectedProjectId) return;

    try {
      const response = await fetch(
        `https://internal-api.autoreply.ing/v1.0/communities/${communityId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Project-ID': selectedProjectId,
          },
        }
      );

      if (response.status === 404) {
        toast({
          title: 'Community not found.',
          variant: 'destructive',
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to remove community');
      }

      setCommunities((prev) => prev.filter((community) => community.id !== communityId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove community.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Communities & Keywords</h1>
          <p className="text-sm text-muted-foreground">
            Configure which platforms, communities, and keywords to monitor
          </p>
        </div>
  
        {/* Platform Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enabled Platforms</CardTitle>
            <CardDescription>
              Select which platforms to monitor for relevant conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPlatformsLoading ? (
              <div className="flex flex-wrap gap-4">
                {platforms.map((platform) => (
                  <div key={platform} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {platforms.map((platform) => (
                  <div key={platform} className="flex items-center gap-2">
                    <RadioToggle
                      id={`platform-${platform}`}
                      checked={enabledPlatforms.includes(platform)}
                      onCheckedChange={(checked) =>
                        handlePlatformToggle(platform, checked as boolean)
                      }
                    />
                    <Label htmlFor={`platform-${platform}`} className="cursor-pointer">
                      {getPlatformLabel(platform)}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
  
        {/* Communities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monitored Communities</CardTitle>
            <CardDescription>
              Add subreddits, hashtags, or groups to monitor for leads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCommunitiesLoading ? (
              <>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={`community-skeleton-${index}`} className="h-8 w-28 rounded-full" />
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton
                        key={`community-suggestion-skeleton-${index}`}
                        className="h-8 w-32 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Add New Community */}
                <div className="flex gap-2">
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {getPlatformLabel(p)}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="e.g., r/startups or #buildinpublic"
                    value={newCommunity}
                    onChange={(e) => setNewCommunity(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleAddCommunity(newCommunity, selectedPlatform)
                    }
                    className="flex-1"
                  />
                  <Button onClick={() => handleAddCommunity(newCommunity, selectedPlatform)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Current Communities */}
                <div className="flex flex-wrap gap-2">
                  {communities.map((community) => (
                    <Badge
                      key={community.id}
                      variant="secondary"
                      className="pl-3 pr-1 py-1.5 gap-2"
                    >
                      <span>{community.name}</span>
                      <span className="text-muted-foreground text-xs">
                        ({getPlatformLabel(community.platform)})
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-destructive/20"
                        onClick={() => handleRemoveCommunity(community.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                {/* Suggested Communities */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Sparkles className="h-4 w-4" />
                    Suggested communities based on your product
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedCommunities
                      .filter((s) => !communities.some((c) => c.name === s.name))
                      .map((suggestion) => (
                        <Button
                          key={suggestion.name}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSuggested(suggestion)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {suggestion.name}
                        </Button>
                      ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
  
        {/* Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monitored Keywords</CardTitle>
            <CardDescription>
              Add keywords and phrases to find relevant conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isKeywordsLoading ? (
              <>
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={`keyword-skeleton-${index}`} className="h-8 w-24 rounded-full" />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a keyword or phrase..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddKeyword}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <Badge
                      key={keyword.id}
                      variant="secondary"
                      className="pl-3 pr-1 py-1.5 gap-2"
                    >
                      <span>{keyword.keyword}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-destructive/20"
                        onClick={() => handleRemoveKeyword(keyword.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
