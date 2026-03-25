import type { PointerEventHandler } from 'react';
import { Copy, Edit3, RefreshCw } from 'lucide-react';
import type { Lead } from '@/data/mockLeads';
import { Button } from '@/components/ui/button';
import {
  copyAndOpenSuggestion,
  copySuggestion,
  getSuggestionOpenLabel,
  type SuggestionType,
} from '@/lib/leadSuggestionActions';

interface SuggestionActionButtonsProps {
  lead: Lead;
  type: SuggestionType;
  text: string;
  isRewriting: boolean;
  onRewrite: () => void;
  onEditPrompt?: () => void;
  showCopy?: boolean;
  preventPointerPropagation?: boolean;
  incrementUsage?: () => void;
}

export function SuggestionActionButtons({
  lead,
  type,
  text,
  isRewriting,
  onRewrite,
  onEditPrompt,
  showCopy = false,
  preventPointerPropagation = false,
  incrementUsage,
}: SuggestionActionButtonsProps) {
  const handlePointerDown: PointerEventHandler<HTMLDivElement> | undefined =
    preventPointerPropagation
      ? (event) => {
          event.stopPropagation();
        }
      : undefined;

  const handleCopy = () => {
    copySuggestion({ text, type });
  };

  const handleOpen = () => {
    copyAndOpenSuggestion({ lead, text, type, incrementUsage });
  };

  return (
    <div className="flex flex-wrap gap-2" onPointerDown={handlePointerDown}>
      <Button variant="outline" size="sm" onClick={onRewrite} disabled={isRewriting}>
        <RefreshCw
          className={`hidden h-3 w-3 md:inline-block md:mr-1 ${
            isRewriting ? 'animate-spin' : ''
          }`}
        />
        {isRewriting ? 'Rewriting…' : 'Rewrite'}
      </Button>

      {showCopy ? (
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-3 w-3 mr-1" />
          Copy
        </Button>
      ) : null}

      {onEditPrompt ? (
        <Button variant="outline" size="sm" onClick={onEditPrompt}>
          <Edit3 className="hidden h-3 w-3 md:inline-block md:mr-1" />
          Edit Prompt
        </Button>
      ) : null}

      <Button variant="default" size="sm" onClick={handleOpen}>
        <Copy className="h-3 w-3 mr-1" />
        {getSuggestionOpenLabel(lead, type)}
      </Button>
    </div>
  );
}
