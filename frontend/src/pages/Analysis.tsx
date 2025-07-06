import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import ComparisonView from '@/components/ComparisonView';

const AnalysisPage = () => {
  const { id } = useParams();

  return (
    <MainLayout title="Análise">
      <ComparisonView analysisId={id || ''} />
    </MainLayout>
  );
};

export default AnalysisPage;
