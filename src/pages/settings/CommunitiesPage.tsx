import { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { useLeads } from '@/context/LeadsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Platform } from '@/data/mockLeads';
import { getPlatformLabel } from '@/components/leads/PlatformBadge';

const suggestedCommunities = [
  { name: 'r/smallbusiness', platform: 'reddit' as Platform },
  { name: 'r/growmybusiness', platform: 'reddit' as Platform },
  { name: '#buildinpublic', platform: 'twitter' as Platform },
  { name: 'Tech Startups', platform: 'linkedin' as Platform },
];

export default function CommunitiesPage() {
  const { communities, addCommunity, removeCommunity } = useLeads();
  const [newCommunity, setNewCommunity] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('reddit');
  const [keywords, setKeywords] = useState<string[]>([
    'AI tools',
    'automation',
    'outreach',
    'lead generation',
    'social selling',
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [enabledPlatforms, setEnabledPlatforms] = useState<Platform[]>([
    'reddit',
    'twitter',
    'linkedin',
  ]);

  const handleAddCommunity = () => {
    if (!newCommunity.trim()) return;
    addCommunity({ name: newCommunity.trim(), platform: selectedPlatform });
    setNewCommunity('');
    toast({
      title: 'Community added',
      description: `${newCommunity} has been added to your monitored communities.`,
    });
  };

  const handleAddSuggested = (suggestion: typeof suggestedCommunities[0]) => {
    addCommunity({ name: suggestion.name, platform: suggestion.platform });
    toast({
      title: 'Community added',
      description: `${suggestion.name} has been added.`,
    });
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim() || keywords.includes(newKeyword.trim())) return;
    setKeywords((prev) => [...prev, newKeyword.trim()]);
    setNewKeyword('');
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const handlePlatformToggle = (platform: Platform, checked: boolean) => {
    if (checked) {
      setEnabledPlatforms((prev) => [...prev, platform]);
    } else {
      setEnabledPlatforms((prev) => prev.filter((p) => p !== platform));
    }
  };

  const platforms: Platform[] = ['reddit', 'twitter', 'linkedin'];

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
            <div className="flex flex-wrap gap-4">
              {platforms.map((platform) => (
                <div key={platform} className="flex items-center gap-2">
                  <Checkbox
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
                onKeyDown={(e) => e.key === 'Enter' && handleAddCommunity()}
                className="flex-1"
              />
              <Button onClick={handleAddCommunity}>
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
                    onClick={() => removeCommunity(community.id)}
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
                  key={keyword}
                  variant="secondary"
                  className="pl-3 pr-1 py-1.5 gap-2"
                >
                  <span>{keyword}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-destructive/20"
                    onClick={() => handleRemoveKeyword(keyword)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
