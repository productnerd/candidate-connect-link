import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Brain,
  BookOpen,
  Shapes,
  BarChart3,
  User,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type TestResult = Tables<'test_results'>;
type TestLibrary = Tables<'test_library'>;

interface QuestionBreakdown {
  questionId: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
}

interface CategoryScores {
  math_logic?: { correct: number; total: number };
  verbal_reasoning?: { correct: number; total: number };
  spatial_reasoning?: { correct: number; total: number };
}

interface QuestionDetail {
  id: string;
  question_text: string;
  options: any;
  correct_answer: string;
  category: string;
  explanation: string | null;
}

const calculatePercentile = async (testId: string, userScore: number): Promise<number> => {
  const { count: totalResults } = await supabase
    .from('test_results')
    .select('*', { count: 'exact', head: true })
    .eq('test_id', testId);

  const { count: belowScore } = await supabase
    .from('test_results')
    .select('*', { count: 'exact', head: true })
    .eq('test_id', testId)
    .lt('score', userScore);

  if (!totalResults || totalResults === 0) return 50;
  return Math.round(((belowScore || 0) / totalResults) * 100);
};

const getPercentileLabel = (p: number) => {
  if (p >= 90) return 'Top 10%';
  if (p >= 75) return 'Top 25%';
  if (p >= 50) return 'Above Average';
  if (p >= 25) return 'Below Average';
  return 'Bottom 25%';
};

const getScoreColor = (pct: number) => {
  if (pct >= 90) return 'text-emerald-500';
  if (pct >= 80) return 'text-green-600';
  if (pct >= 70) return 'text-lime-500';
  if (pct >= 40) return 'text-orange-500';
  return 'text-orange-300';
};

const getScoreBg = (pct: number) => {
  if (pct >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
  if (pct >= 80) return 'bg-green-600/10 border-green-600/20';
  if (pct >= 70) return 'bg-lime-500/10 border-lime-500/20';
  if (pct >= 40) return 'bg-orange-500/10 border-orange-500/20';
  return 'bg-orange-300/10 border-orange-300/20';
};

const getRecommendation = (pct: number) => {
  if (pct >= 90) return 'Exceptional candidate. Strongly recommended for roles requiring high cognitive aptitude.';
  if (pct >= 80) return 'Strong candidate. Well-suited for analytically demanding positions.';
  if (pct >= 70) return 'Solid candidate. Meets expectations for most cognitive requirements.';
  if (pct >= 50) return 'Average performance. May need additional evaluation for complex roles.';
  return 'Below average. Consider additional assessments or role fit evaluation.';
};

const categoryIcons: Record<string, any> = {
  math_logic: Brain,
  verbal_reasoning: BookOpen,
  spatial_reasoning: Shapes,
};

const categoryLabels: Record<string, string> = {
  math_logic: 'Math & Logic',
  verbal_reasoning: 'Verbal Reasoning',
  spatial_reasoning: 'Spatial Reasoning',
};

export default function TestResults() {
  const { token, sessionId } = useParams<{ token: string; sessionId: string }>();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TestResult | null>(null);
  const [test, setTest] = useState<TestLibrary | null>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [questionsExpanded, setQuestionsExpanded] = useState(false);
  const [questionDetails, setQuestionDetails] = useState<QuestionDetail[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    loadResults();
  }, [sessionId]);

  const loadResults = async () => {
    if (!sessionId) return;

    try {
      // Load result, invitation, and test in parallel
      const [resultRes, invitationRes] = await Promise.all([
        supabase
          .from('test_results')
          .select('*')
          .eq('session_id', sessionId)
          .maybeSingle(),
        token
          ? supabase
              .from('test_invitations')
              .select('*')
              .eq('invitation_token', token)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (resultRes.error) throw resultRes.error;
      if (!resultRes.data) {
        setLoading(false);
        return;
      }

      setResult(resultRes.data);
      if (invitationRes.data) setInvitation(invitationRes.data);

      const { data: testData } = await supabase
        .from('test_library')
        .select('*')
        .eq('id', resultRes.data.test_id)
        .single();

      if (testData) setTest(testData);

      const pct = await calculatePercentile(resultRes.data.test_id, resultRes.data.score);
      setPercentile(pct);
    } catch (err) {
      console.error('Error loading results:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionDetails = async () => {
    if (questionDetails.length > 0 || !result) return;
    setLoadingQuestions(true);

    const breakdown = (result.question_breakdown as unknown as QuestionBreakdown[]) || [];
    const questionIds = breakdown.map((q) => q.questionId);

    if (questionIds.length === 0) {
      setLoadingQuestions(false);
      return;
    }

    const { data } = await supabase
      .from('test_questions')
      .select('id, question_text, options, correct_answer, category, explanation')
      .in('id', questionIds);

    if (data) setQuestionDetails(data);
    setLoadingQuestions(false);
  };

  const handleExpandQuestions = () => {
    const newState = !questionsExpanded;
    setQuestionsExpanded(newState);
    if (newState) loadQuestionDetails();
  };

  const breakdown = useMemo(
    () => (result?.question_breakdown as unknown as QuestionBreakdown[]) || [],
    [result]
  );
  const categoryScores = useMemo(
    () => (result?.category_scores as unknown as CategoryScores) || {},
    [result]
  );
  const totalQuestions = breakdown.length || test?.question_count || 1;
  const percentage = result ? Math.min(100, Math.round((result.score / totalQuestions) * 100)) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getOptionLabel = (options: any, value: string) => {
    if (!options || !Array.isArray(options)) return value;
    const opt = options.find((o: any) => o.value === value || o.id === value);
    return opt?.label || opt?.text || value;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center card-elevated">
          <CardHeader>
            <CardTitle>Results Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Results are still being processed.</p>
            <Button onClick={() => loadResults()}>Refresh</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Candidate Assessment Report</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Candidate Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold">
                    {invitation?.candidate_name || result.candidate_email}
                  </h1>
                  <p className="text-sm text-muted-foreground">{result.candidate_email}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
              <p className="text-sm font-medium">
                {result.completed_at
                  ? new Date(result.completed_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Score Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Main Score */}
            <Card className={`card-elevated border ${getScoreBg(percentage)}`}>
              <CardContent className="pt-6 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Overall Score</p>
                <p className={`text-5xl font-display font-bold ${getScoreColor(percentage)}`}>
                  {percentage}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {Math.min(result.score, totalQuestions)}/{totalQuestions} correct
                </p>
              </CardContent>
            </Card>

            {/* Percentile */}
            <Card className="card-elevated">
              <CardContent className="pt-6 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Percentile Ranking</p>
                <p className="text-5xl font-display font-bold text-primary">
                  {percentile !== null ? `${percentile}th` : '—'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {percentile !== null ? getPercentileLabel(percentile) : 'Calculating...'}
                </p>
              </CardContent>
            </Card>

            {/* Time */}
            <Card className="card-elevated">
              <CardContent className="pt-6 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Time Taken</p>
                <p className="text-5xl font-display font-bold">
                  {result.time_taken_seconds ? formatTime(result.time_taken_seconds) : '—'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.time_taken_seconds && test
                    ? `${Math.round((result.time_taken_seconds / (test.duration_minutes * 60)) * 100)}% of ${test.duration_minutes}min limit`
                    : 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>




          {/* Category Breakdown */}
          {Object.keys(categoryScores).length > 0 && (
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {Object.entries(categoryScores).map(([category, scores]) => {
                  if (!scores || typeof scores !== 'object') return null;
                  const catPct = scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0;
                  const Icon = categoryIcons[category] || Brain;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{categoryLabels[category] || category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {scores.correct}/{scores.total}
                          </span>
                          <span className={`text-sm font-bold font-display ${getScoreColor(catPct)}`}>
                            {catPct}%
                          </span>
                        </div>
                      </div>
                      <Progress value={catPct} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Question Grid Summary */}
          {breakdown.length > 0 && (
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-base">Answer Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 sm:grid-cols-[repeat(25,minmax(0,1fr))] gap-1.5">
                  {breakdown.map((q, idx) => (
                    <div
                      key={q.questionId}
                      className={`aspect-square rounded flex items-center justify-center text-[10px] font-medium ${
                        q.isCorrect
                          ? 'bg-emerald-500/20 text-emerald-600'
                          : q.userAnswer === null
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-destructive/15 text-destructive'
                      }`}
                      title={`Q${idx + 1}: ${q.isCorrect ? 'Correct' : q.userAnswer === null ? 'Unanswered' : 'Incorrect'}`}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-emerald-500/20" /> Correct
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-destructive/15" /> Incorrect
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-muted" /> Unanswered
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expandable Detailed Question Review */}
          {breakdown.length > 0 && (
            <Collapsible open={questionsExpanded} onOpenChange={handleExpandQuestions}>
              <Card className="card-elevated">
                <CollapsibleTrigger asChild>
                  <button className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                      <CardTitle className="text-base">Detailed Question Review</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{questionsExpanded ? 'Collapse' : 'Expand all questions'}</span>
                        {questionsExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </CardHeader>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {loadingQuestions ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading questions...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {breakdown.map((q, idx) => {
                          const detail = questionDetails.find((d) => d.id === q.questionId);
                          const options = detail?.options as Array<{ value: string; label?: string; text?: string }> | null;

                          return (
                            <div
                              key={q.questionId}
                              className={`rounded-lg border p-4 ${
                                q.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-destructive/20 bg-destructive/5'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                                    q.isCorrect
                                      ? 'bg-emerald-500/20 text-emerald-600'
                                      : 'bg-destructive/20 text-destructive'
                                  }`}
                                >
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {q.isCorrect ? (
                                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                                    )}
                                    <Badge variant="outline" className="text-[10px]">
                                      {categoryLabels[detail?.category || ''] || detail?.category || 'General'}
                                    </Badge>
                                  </div>

                                  <p className="text-sm font-medium mt-2 mb-3">
                                    {detail?.question_text || `Question ${idx + 1}`}
                                  </p>

                                  {/* Options list */}
                                  {options && Array.isArray(options) && (
                                    <div className="space-y-1.5 mb-3">
                                      {options.map((opt: any) => {
                                        const optValue = opt.value || opt.id;
                                        const optLabel = opt.label || opt.text || optValue;
                                        const isUserAnswer = q.userAnswer === optValue;
                                        const isCorrectAnswer = q.correctAnswer === optValue;

                                        return (
                                          <div
                                            key={optValue}
                                            className={`text-xs px-3 py-2 rounded-md border ${
                                              isCorrectAnswer
                                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700'
                                                : isUserAnswer && !q.isCorrect
                                                  ? 'border-destructive/40 bg-destructive/10 text-destructive'
                                                  : 'border-border/40 text-muted-foreground'
                                            }`}
                                          >
                                            <span className="flex items-center gap-2">
                                              {isCorrectAnswer && <CheckCircle className="h-3 w-3 shrink-0" />}
                                              {isUserAnswer && !q.isCorrect && <XCircle className="h-3 w-3 shrink-0" />}
                                              {optLabel}
                                              {isCorrectAnswer && <span className="text-[10px] ml-auto">(correct)</span>}
                                              {isUserAnswer && !isCorrectAnswer && (
                                                <span className="text-[10px] ml-auto">(candidate's answer)</span>
                                              )}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* If no options loaded, show raw answers */}
                                  {(!options || !Array.isArray(options)) && (
                                    <div className="text-xs space-y-1 mb-2">
                                      <p>
                                        <span className="text-muted-foreground">Candidate answered: </span>
                                        <span className={q.isCorrect ? 'text-emerald-600 font-medium' : 'text-destructive font-medium'}>
                                          {q.userAnswer || 'No answer'}
                                        </span>
                                      </p>
                                      {!q.isCorrect && (
                                        <p>
                                          <span className="text-muted-foreground">Correct answer: </span>
                                          <span className="text-emerald-600 font-medium">{q.correctAnswer}</span>
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {detail?.explanation && (
                                    <p className="text-xs text-muted-foreground mt-2 italic">
                                      💡 {detail.explanation}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}
