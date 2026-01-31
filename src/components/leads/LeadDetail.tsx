import { formatDistanceToNow } from 'date-fns';
import { X, ThumbsDown, Check, Copy, ExternalLink, RefreshCw, Edit3, MessageSquare, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useLeads } from '@/context/LeadsContext';
import { useAuth } from '@/context/AuthContext';
import { PlatformBadge } from './PlatformBadge';
import { RelevancyBadge } from './RelevancyBadge';
import { toast } from '@/hooks/use-toast';
import { updateLeadStatus as updateLeadStatusApi } from '@/lib/api';
import { useMemo } from 'react';

export function LeadDetail() {
  const { selectedLead, setSelectedLead, updateLeadStatus, incrementUsage } = useLeads();
  const { accessToken, user } = useAuth();

  const selectedProjectId = useMemo(
    () => user?.projects?.find((project) => project.is_selected)?.id ?? user?.default_project_id ?? null,
    [user]
  );

  if (!selectedLead) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Select a lead to view details</p>
        </div>
      </div>
    );
  }

  const handleCopyAndOpen = (text: string, type: 'comment' | 'dm') => {
    navigator.clipboard.writeText(text);
    window.open(selectedLead.url, '_blank');
    incrementUsage();
    toast({
      title: `${type === 'comment' ? 'Comment' : 'DM'} copied!`,
      description: 'Opening the original post in a new tab.',
    });
  };

  const handleMarkComplete = async () => {
    if (!accessToken || !selectedProjectId) {
      toast({
        title: 'Error',
        description: 'Missing authentication or project selection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateLeadStatusApi({
        accessToken,
        projectId: selectedProjectId,
        leadId: selectedLead.id,
        status: 'completed',
      });

      updateLeadStatus(selectedLead.id, 'completed');
      toast({
        title: 'Lead completed',
        description: 'The lead has been moved to Completed.',
      });
    } catch (error) {
      toast({
        title: 'Failed to update lead',
        description: error instanceof Error ? error.message : 'An error occurred while updating the lead status.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkNotRelevant = async () => {
    if (!accessToken || !selectedProjectId) {
      toast({
        title: 'Error',
        description: 'Missing authentication or project selection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateLeadStatusApi({
        accessToken,
        projectId: selectedProjectId,
        leadId: selectedLead.id,
        status: 'discarded',
      });

      updateLeadStatus(selectedLead.id, 'discarded');
      toast({
        title: 'Lead discarded',
        description: 'The lead has been moved to Discarded.',
      });
    } catch (error) {
      toast({
        title: 'Failed to update lead',
        description: error instanceof Error ? error.message : 'An error occurred while updating the lead status.',
        variant: 'destructive',
      });
    }
  };

  const handleRewrite = () => {
    toast({
      title: 'Regenerating...',
      description: 'AI is generating a new response.',
    });
  };

  const handleEditPrompt = () => {
    toast({
      title: 'Edit Prompt',
      description: 'Navigate to Settings > Prompts to customize.',
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="md:p-4 space-y-4 relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <RelevancyBadge score={selectedLead.relevancyScore} size="lg" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkNotRelevant}
              className="text-destructive hover:text-destructive"
            >
              <ThumbsDown className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Not Relevant</span>
            </Button>
            <Button variant="default" size="sm" onClick={handleMarkComplete}>
              <Check className="h-4 w-4 mr-1" />
              Complete
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedLead(null)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="absolute top-4 right-4">
          <PlatformBadge platform={selectedLead.platform} />
        </div>

        {/* Post Details */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span className="font-medium text-foreground">{selectedLead.authorHandle}</span>
              <span>•</span>
              <span>{selectedLead.community}</span>
              <span>•</span>
              <span>{formatDistanceToNow(selectedLead.createdAt, { addSuffix: true })}</span>
            </div>
            <h3 className="font-semibold text-foreground mb-3">{selectedLead.title}</h3>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{selectedLead.content}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {selectedLead.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <a href={selectedLead.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Original
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Suggested Comment */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Suggested Comment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground/80 bg-muted/50 p-3 rounded-lg">
              {selectedLead.suggestedComment}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleRewrite}>
                <RefreshCw className="hidden md:inline-block h-3 w-3 md:mr-1" />
                Rewrite
              </Button>
              <Button variant="outline" size="sm" onClick={handleEditPrompt}>
                <Edit3 className="hidden md:inline-block h-3 w-3 md:mr-1" />
                Edit Prompt
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleCopyAndOpen(selectedLead.suggestedComment, 'comment')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy & Open
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggested DM */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Suggested DM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground/80 bg-muted/50 p-3 rounded-lg">
              {selectedLead.suggestedDM}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleRewrite}>
                <RefreshCw className="hidden md:inline-block h-3 w-3 md:mr-1" />
                Rewrite
              </Button>
              <Button variant="outline" size="sm" onClick={handleEditPrompt}>
                <Edit3 className="hidden md:inline-block h-3 w-3 md:mr-1" />
                Edit Prompt
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleCopyAndOpen(selectedLead.suggestedDM, 'dm')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy & Open DMs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
