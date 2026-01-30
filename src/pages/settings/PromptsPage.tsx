import { useEffect, useMemo, useState } from 'react';
import { Save, X, RotateCcw, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLeads } from '@/context/LeadsContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { defaultPromptSettings, type PromptSettings } from '@/data/mockLeads';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const placeholders = [
  { name: '<product_name>', description: 'Your product name' },
  { name: '<product_description>', description: 'Your product description' },
  { name: '<product_url>', description: 'Your website URL' },
  { name: '[post_title]', description: 'Title of the original post' },
  { name: '[post_content]', description: 'Content of the original post' },
  { name: '[author_name]', description: 'Name of the post author' },
  { name: '[your_name]', description: 'Your name' },
];

export default function PromptsPage() {
  const { accessToken, user } = useAuth();
  const selectedProjectId = useMemo(
    () => user?.projects?.find((project) => project.is_selected)?.id ?? user?.default_project_id ?? null,
    [user]
  );
  const { promptSettings, setPromptSettings } = useLeads();
  const [savedFormData, setSavedFormData] = useState<PromptSettings>(promptSettings);
  const [formData, setFormData] = useState<PromptSettings>(promptSettings);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isSaveDisabled = !accessToken || !selectedProjectId || isLoading || isSaving;

  const normalizePromptSettings = (promptData: Partial<Record<string, string | null>>) => ({
    searchPrompt: promptData.search_prompt ?? defaultPromptSettings.searchPrompt,
    commentPrompt: promptData.comment_prompt ?? defaultPromptSettings.commentPrompt,
    dmPrompt: promptData.dm_prompt ?? defaultPromptSettings.dmPrompt,
  });

  useEffect(() => {
    if (!accessToken || !selectedProjectId) {
      setSavedFormData(defaultPromptSettings);
      setFormData(defaultPromptSettings);
      setPromptSettings(defaultPromptSettings);
      setIsDirty(false);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const loadPrompts = async () => {
      try {
        const response = await fetch('https://internal-api.autoreply.ing/v1.0/prompts', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Project-ID': selectedProjectId,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load prompt settings');
        }

        const promptData = await response.json();
        const normalizedSettings = normalizePromptSettings(promptData);

        setSavedFormData(normalizedSettings);
        setFormData(normalizedSettings);
        setPromptSettings(normalizedSettings);
        setIsDirty(false);
      } catch (error) {
        if (!controller.signal.aborted) {
          toast({
            title: 'Unable to load prompts',
            description: 'We could not load your prompt settings. Please try again.',
            variant: 'destructive',
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadPrompts();

    return () => {
      controller.abort();
    };
  }, [accessToken, selectedProjectId, setPromptSettings]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!accessToken || !selectedProjectId) {
      toast({
        title: 'Unable to save settings',
        description: 'Missing authentication or project selection.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('https://internal-api.autoreply.ing/v1.0/prompts', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_prompt: formData.searchPrompt,
          comment_prompt: formData.commentPrompt,
          dm_prompt: formData.dmPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update prompt settings');
      }

      const promptData = await response.json();
      const normalizedSettings = normalizePromptSettings(promptData);

      setSavedFormData(normalizedSettings);
      setFormData(normalizedSettings);
      setPromptSettings(normalizedSettings);
      setIsDirty(false);
      toast({
        title: 'Prompts saved',
        description: 'Your AI prompt settings have been updated.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Save failed',
        description: 'We could not update your prompt settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(savedFormData);
    setIsDirty(false);
  };

  const handleReset = () => {
    setFormData(defaultPromptSettings);
    setIsDirty(true);
    toast({
      title: 'Prompts reset',
      description: 'Prompts have been reset to defaults. Click Save to confirm.',
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Prompt Customization</h1>
            <p className="text-sm text-muted-foreground">
              Customize how the AI searches for and responds to leads
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset to Default
            </Button>
            {isDirty && (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaveDisabled}>
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>
  
        {/* Placeholders Guide */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              Available Placeholders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((placeholder) => (
                <Tooltip key={placeholder.name}>
                  <TooltipTrigger asChild>
                    <code className="px-2 py-1 rounded bg-muted text-sm cursor-help">
                      {placeholder.name}
                    </code>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{placeholder.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>
  
        {/* Search Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search Prompt</CardTitle>
            <CardDescription>
              Define how the AI identifies relevant posts and conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="searchPrompt">Search Criteria</Label>
              <Textarea
                id="searchPrompt"
                value={formData.searchPrompt}
                onChange={(e) => handleChange('searchPrompt', e.target.value)}
                disabled={isLoading}
                className="min-h-40 font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
  
        {/* Comment Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comment Prompt</CardTitle>
            <CardDescription>
              Template for generating public comment responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="commentPrompt">Comment Template</Label>
              <Textarea
                id="commentPrompt"
                value={formData.commentPrompt}
                onChange={(e) => handleChange('commentPrompt', e.target.value)}
                disabled={isLoading}
                className="min-h-40 font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
  
        {/* DM Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Direct Message Prompt</CardTitle>
            <CardDescription>
              Template for generating personalized direct messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="dmPrompt">DM Template</Label>
              <Textarea
                id="dmPrompt"
                value={formData.dmPrompt}
                onChange={(e) => handleChange('dmPrompt', e.target.value)}
                disabled={isLoading}
                className="min-h-40 font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
