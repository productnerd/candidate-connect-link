import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Clock, 
  Search,
  Loader2,
  Send
} from 'lucide-react';

interface Test {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  duration_minutes: number;
  question_count: number;
  difficulty_level: string | null;
  recommended_for: string[];
}

export default function TestLibrary() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('test_library')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTests((data as Test[]) || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cognitive':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'personality':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'skills':
        return 'bg-success/10 text-success border-success/20';
      case 'situational':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy':
        return 'text-success';
      case 'medium':
        return 'text-warning';
      case 'hard':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Test Library</h1>
            <p className="text-muted-foreground">Browse available assessments for your candidates</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="text-center py-12">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tests found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'No tests available at the moment'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <Card key={test.id} className="card-elevated card-hover group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className={getCategoryColor(test.category)}>
                      {test.category}
                    </Badge>
                    {test.subcategory && (
                      <Badge variant="secondary" className="text-xs">
                        {test.subcategory}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-3 group-hover:text-primary transition-colors">
                    {test.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {test.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{test.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="h-4 w-4" />
                      <span>{test.question_count} questions</span>
                    </div>
                    {test.difficulty_level && (
                      <div className={`capitalize ${getDifficultyColor(test.difficulty_level)}`}>
                        {test.difficulty_level}
                      </div>
                    )}
                  </div>

                  {test.recommended_for && test.recommended_for.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Recommended for:</p>
                      <div className="flex flex-wrap gap-1">
                        {(test.recommended_for as string[]).slice(0, 3).map((role, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                        {(test.recommended_for as string[]).length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(test.recommended_for as string[]).length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Button variant="hero" size="sm" asChild className="w-full">
                    <Link to={`/send-test?test=${test.id}`}>
                      <Send className="h-4 w-4 mr-2" />
                      Send to Candidate
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
