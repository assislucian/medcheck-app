/**
 * Header da página de Demonstrativos
 * Componente focado e reutilizável
 */
interface DemonstrativesHeaderProps {
  totalDemonstratives: number;
  totalProcessed: number;
  totalGlosas: number;
  filteredCount: number;
}

export function DemonstrativesHeader({ 
  totalDemonstratives, 
  totalProcessed, 
  totalGlosas,
  filteredCount 
}: DemonstrativesHeaderProps) {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-teal-800 bg-clip-text text-transparent">
        Central de Demonstrativos
      </h1>
      
      <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Gerencie e analise seus demonstrativos de pagamento com total transparência.
        {totalDemonstratives > 0 && (
          <>
            {' '}Você tem <strong>{totalDemonstratives} demonstrativos</strong> processados,
            com <strong>R$ {totalProcessed.toLocaleString()}</strong> em valores aprovados
            {totalGlosas > 0 && (
              <> e <strong className="text-red-600">R$ {totalGlosas.toLocaleString()}</strong> em glosas</>
            )}.
          </>
        )}
      </p>

      {filteredCount !== totalDemonstratives && (
        <div className="mt-3 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg inline-block">
          Mostrando {filteredCount} de {totalDemonstratives} demonstrativos
        </div>
      )}
    </div>
  );
}