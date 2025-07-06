import { Button } from '@/components/ui/button';

interface UploadSuccessProps {
  onViewComparison: () => void;
}

const UploadSuccess = ({ onViewComparison }: UploadSuccessProps) => {
  return (
    <div className="mt-4 rounded border border-green-300 bg-green-50 text-green-800 px-4 py-3 text-sm flex flex-col gap-2">
      <span>Processamento concluído com sucesso.</span>
      <button
        onClick={onViewComparison}
        className="underline font-medium text-green-800 text-left hover:text-green-700"
      >
        Ver Comparativo
      </button>
    </div>
  );
};

export default UploadSuccess;
