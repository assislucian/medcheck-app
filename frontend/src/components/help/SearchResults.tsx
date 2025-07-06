import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HelpArticle } from '@/types/help';

interface SearchResultsProps {
  results: HelpArticle[];
  onClearResults: () => void;
}

export const SearchResults = ({ results, onClearResults }: SearchResultsProps) => {
  if (results.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-medium mb-4">Resultados da pesquisa</h2>
      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{result.title}</CardTitle>
              <CardDescription>Categoria: {result.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{result.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button variant="outline" className="mt-4" onClick={onClearResults}>
        Limpar resultados
      </Button>
    </div>
  );
};
