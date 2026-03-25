import type { Lead } from '@/data/mockLeads';
import { toast } from '@/hooks/use-toast';

export type SuggestionType = 'comment' | 'dm';

const getSuggestionLabel = (type: SuggestionType) =>
  type === 'comment' ? 'Comment' : 'DM';

export const getRedditUsername = (handle: string) =>
  handle
    .trim()
    .replace(/^\/?u\//i, '')
    .replace(/^@/, '');

export const getSuggestionOpenLabel = (
  lead: Pick<Lead, 'platform'>,
  type: SuggestionType
) => {
  if (type === 'comment') {
    return 'Copy & Open';
  }

  return lead.platform === 'reddit' ? 'Open Reddit DM' : 'Copy & Open DMs';
};

export const copySuggestion = ({
  text,
  type,
}: {
  text: string;
  type: SuggestionType;
}) => {
  navigator.clipboard.writeText(text);
  toast({
    title: `${getSuggestionLabel(type)} copied!`,
    description: 'You can now paste it anywhere.',
  });
};

export const copyAndOpenSuggestion = ({
  lead,
  text,
  type,
  incrementUsage,
}: {
  lead: Pick<Lead, 'author' | 'authorHandle' | 'platform' | 'url'>;
  text: string;
  type: SuggestionType;
  incrementUsage?: () => void;
}) => {
  navigator.clipboard.writeText(text);

  if (type === 'dm' && lead.platform === 'reddit') {
    const redditUsername = getRedditUsername(lead.authorHandle || lead.author || '');

    if (redditUsername) {
      const params = new URLSearchParams({
        to: redditUsername,
        subject: 'Quick question',
        message: text,
      });

      window.open(`https://www.reddit.com/message/compose/?${params.toString()}`, '_blank');
      incrementUsage?.();
      toast({
        title: 'DM copied!',
        description: 'Opening Reddit DM composer in a new tab.',
      });
      return;
    }
  }

  window.open(lead.url, '_blank');
  incrementUsage?.();
  toast({
    title: `${getSuggestionLabel(type)} copied!`,
    description: 'Opening the original post in a new tab.',
  });
};
