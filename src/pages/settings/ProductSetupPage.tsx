import { useEffect, useMemo, useState } from 'react';
import { Save, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { defaultProductSettings, type ProductSettings } from '@/data/mockLeads';

function ProductSetupSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-3 w-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProductSetupPage() {
  const { accessToken, user } = useAuth();
  const selectedProjectId = useMemo(
    () => user?.projects?.find((project) => project.is_selected)?.id ?? null,
    [user]
  );
  const [savedFormData, setSavedFormData] = useState<ProductSettings>(defaultProductSettings);
  const [formData, setFormData] = useState<ProductSettings>(defaultProductSettings);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const trimmedWebsiteUrl = formData.websiteUrl.trim();
  const websiteUrlRegex =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,}\b([-a-zA-Z0-9()@:%_+.~#?&\/=]*)$/;
  const isWebsiteUrlValid =
    trimmedWebsiteUrl.length > 0 && websiteUrlRegex.test(trimmedWebsiteUrl);
  const showWebsiteUrlError = trimmedWebsiteUrl.length > 0 && !isWebsiteUrlValid;

  useEffect(() => {
    if (!accessToken || !selectedProjectId) {
      setSavedFormData(defaultProductSettings);
      setFormData(defaultProductSettings);
      setIsDirty(false);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const loadProjectSettings = async () => {
      try {
        const response = await fetch(
          `https://internal-api.autoreply.ing/v1.0/projects/${selectedProjectId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load project settings');
        }

        const projectData = await response.json();
        const normalizedSettings: ProductSettings = {
          name: projectData.name ?? '',
          websiteUrl: projectData.website_url ?? '',
          description: projectData.description ?? '',
          targetAudience: projectData.target_audience ?? '',
          valueProposition: projectData.value_proposition ?? '',
        };

        setSavedFormData(normalizedSettings);
        setFormData(normalizedSettings);
        setIsDirty(false);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadProjectSettings();

    return () => {
      controller.abort();
    };
  }, [accessToken, selectedProjectId]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const buildUpdatePayload = () => {
    const payload: Record<string, string | null> = {};
    const fieldMap: Record<keyof ProductSettings, string> = {
      name: 'name',
      websiteUrl: 'website_url',
      description: 'description',
      targetAudience: 'target_audience',
      valueProposition: 'value_proposition',
    };

    (Object.keys(fieldMap) as Array<keyof ProductSettings>).forEach((field) => {
      if (formData[field] !== savedFormData[field]) {
        const value = formData[field].trim();
        payload[fieldMap[field]] = value.length > 0 ? value : null;
      }
    });

    return payload;
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

    const payload = buildUpdatePayload();
    if (Object.keys(payload).length === 0) {
      setIsDirty(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`https://internal-api.autoreply.ing/v1.0/projects/${selectedProjectId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update project settings');
      }

      const updatedProject = await response.json();
      const normalizedSettings: ProductSettings = {
        name: updatedProject.name ?? '',
        websiteUrl: updatedProject.website_url ?? '',
        description: updatedProject.description ?? '',
        targetAudience: updatedProject.target_audience ?? '',
        valueProposition: updatedProject.value_proposition ?? '',
      };

      setSavedFormData(normalizedSettings);
      setFormData(normalizedSettings);
      setIsDirty(false);
      toast({
        title: 'Settings saved',
        description: 'Your product information has been updated.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Save failed',
        description: 'We could not update your product settings. Please try again.',
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

  if (isLoading) {
    return <ProductSetupSkeleton />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground">Product Setup</h1>
            <p className="text-sm text-muted-foreground">
              Configure your product information for AI-generated responses
            </p>
          </div>
          {isDirty && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving || showWebsiteUrlError}>
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
            <CardDescription>
              This information helps the AI understand your product and generate relevant responses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="My Awesome Product"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => handleChange('websiteUrl', e.target.value)}
                  placeholder="https://example.com"
                />
                {showWebsiteUrlError && (
                  <p className="text-xs text-destructive">Please enter a valid website URL.</p>
                )}
              </div>
            </div>
  
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="description">Product Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({
                      title: 'Description generation is coming soon.',
                    })
                  }
                  disabled={showWebsiteUrlError}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Description
                </Button>
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe what your product does and how it helps users..."
                className="min-h-24"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about features and benefits. This helps generate more relevant responses.
              </p>
            </div>
          </CardContent>
        </Card>
  
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Target Audience</CardTitle>
            <CardDescription>
              Define who your ideal customers are to improve response relevance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Textarea
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => handleChange('targetAudience', e.target.value)}
                placeholder="B2B SaaS founders, marketing teams, growth hackers..."
                className="min-h-20"
              />
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="valueProposition">Value Proposition</Label>
              <Textarea
                id="valueProposition"
                value={formData.valueProposition}
                onChange={(e) => handleChange('valueProposition', e.target.value)}
                placeholder="What unique value does your product provide? What problems does it solve?"
                className="min-h-20"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
