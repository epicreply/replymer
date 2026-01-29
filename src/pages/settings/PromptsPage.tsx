import { useState } from 'react';
import { Save, X, RotateCcw, Info } from 'lucide-react';
import { useLeads } from '@/context/LeadsContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { defaultPromptSettings } from '@/data/mockLeads';
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
  const { promptSettings, setPromptSettings } = useLeads();
  const [formData, setFormData] = useState(promptSettings);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    setPromptSettings(formData);
    setIsDirty(false);
    toast({
      title: 'Prompts saved',
      description: 'Your AI prompt settings have been updated.',
    });
  };

  const handleCancel = () => {
    setFormData(promptSettings);
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
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
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
              className="min-h-40 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
