import { Check, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Option can be either a string (text) or an object with id and text/image_url
interface TextOption {
  id: string;
  text: string;
}

interface ImageOption {
  id: string;
  image_url: string;
}

type Option = string | TextOption | ImageOption;

interface QuestionOptionsProps {
  options: Option[];
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  category?: string; // 'math_logic' | 'verbal_reasoning' | 'spatial_reasoning'
  disabled?: boolean;
  correctAnswer?: string; // For learning mode - shows which answer is correct
  showCorrect?: boolean; // Whether to show correct/incorrect styling
}

function isImageOption(opt: Option): opt is ImageOption {
  return typeof opt === 'object' && 'image_url' in opt;
}

function isTextOption(opt: Option): opt is TextOption {
  return typeof opt === 'object' && 'text' in opt;
}

function getOptionValue(opt: Option): string {
  if (typeof opt === 'string') return opt;
  return opt.id;
}

function getOptionDisplay(opt: Option): { type: 'text' | 'image'; content: string } {
  if (typeof opt === 'string') {
    return { type: 'text', content: opt };
  }
  if (isImageOption(opt)) {
    return { type: 'image', content: opt.image_url };
  }
  if (isTextOption(opt)) {
    return { type: 'text', content: opt.text };
  }
  return { type: 'text', content: String(opt) };
}

export function QuestionOptions({
  options,
  selectedAnswer,
  onSelect,
  category,
  disabled = false,
  correctAnswer,
  showCorrect = false,
}: QuestionOptionsProps) {
  // Check if this is a spatial reasoning question with image options
  const hasImageOptions = options.some(opt => isImageOption(opt));
  
  if (hasImageOptions) {
    // Image grid layout for spatial reasoning
    return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {options.map((option, idx) => {
        const value = getOptionValue(option);
        const display = getOptionDisplay(option);
        const isSelected = selectedAnswer === value;
        const isCorrect = showCorrect && correctAnswer === value;
        const isWrong = showCorrect && isSelected && correctAnswer !== value;
        const letter = String.fromCharCode(65 + idx); // A, B, C, D...
        
        return (
          <button
            key={idx}
            onClick={() => !disabled && onSelect(value)}
            disabled={disabled}
            className={cn(
              'relative aspect-square rounded-lg border-2 p-2 transition-all overflow-hidden group',
              showCorrect && isCorrect
                ? 'border-success bg-success/10 ring-2 ring-success shadow-lg'
                : showCorrect && isWrong
                  ? 'border-destructive bg-destructive/10 ring-2 ring-destructive'
                  : isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary shadow-lg'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50',
              disabled && !showCorrect && 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* Option letter badge */}
            <div className={cn(
              'absolute top-2 left-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center z-10',
              showCorrect && isCorrect
                ? 'bg-success text-success-foreground'
                : showCorrect && isWrong
                  ? 'bg-destructive text-destructive-foreground'
                  : isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/20'
            )}>
              {letter}
            </div>
            
            {/* Selection indicator */}
            {(isSelected || (showCorrect && isCorrect)) && (
              <div className="absolute top-2 right-2 z-10">
                {showCorrect ? (
                  isCorrect ? (
                    <Check className="h-6 w-6 text-success stroke-[3]" />
                  ) : isWrong ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : null
                ) : (
                  <Check className="h-6 w-6 text-primary stroke-[3]" />
                )}
              </div>
            )}
              
              {/* Image */}
              {display.type === 'image' ? (
                <img
                  src={display.content}
                  alt={`Option ${letter}`}
                  className="w-full h-full object-contain rounded"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-medium">
                  {display.content}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }
  
  // Standard text options layout
  return (
    <div className="space-y-3">
      {options.map((option, idx) => {
        const value = getOptionValue(option);
        const display = getOptionDisplay(option);
        const isSelected = selectedAnswer === value;
        const isCorrect = showCorrect && correctAnswer === value;
        const isWrong = showCorrect && isSelected && correctAnswer !== value;
        
        return (
          <button
            key={idx}
            onClick={() => !disabled && onSelect(value)}
            disabled={disabled}
            className={cn(
              'w-full p-4 rounded-lg border text-left transition-all',
              showCorrect && isCorrect
                ? 'border-success bg-success/10 ring-2 ring-success'
                : showCorrect && isWrong
                  ? 'border-destructive bg-destructive/10 ring-2 ring-destructive'
                  : isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50',
              disabled && !showCorrect && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0',
                showCorrect && isCorrect
                  ? 'border-success bg-success text-success-foreground'
                  : showCorrect && isWrong
                    ? 'border-destructive bg-destructive text-destructive-foreground'
                    : isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground'
              )}>
                {showCorrect ? (
                  isCorrect ? (
                    <Check className="h-5 w-5 stroke-[3]" />
                  ) : isWrong ? (
                    <XCircle className="h-4 w-4" />
                  ) : null
                ) : (
                  isSelected && <Check className="h-5 w-5 stroke-[3]" />
                )}
              </div>
              <span className={cn('flex-1', isSelected && 'font-semibold')}>{display.content}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
