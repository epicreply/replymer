import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { useLeads } from '@/context/LeadsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function ProductSetupPage() {
  const { productSettings, setProductSettings } = useLeads();
  const [formData, setFormData] = useState(productSettings);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    setProductSettings(formData);
    setIsDirty(false);
    toast({
      title: 'Settings saved',
      description: 'Your product information has been updated.',
    });
  };

  const handleCancel = () => {
    setFormData(productSettings);
    setIsDirty(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
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
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Product Description</Label>
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
  );
}
