import { DemonstrativoInfo } from '@/types/upload';

export interface DemonstrativeInfoProps {
  info: DemonstrativoInfo;
}

export const DemonstrativeInfo = ({ info }: DemonstrativeInfoProps) => {
  return (
    <div className="mb-6 space-y-6">
      <div>
        <h3 className="font-medium text-lg mb-2">Informações do Demonstrativo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Número:</span>
            <p className="font-medium">{info.numero}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Competência:</span>
            <p className="font-medium">{info.competencia}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Hospital:</span>
            <p className="font-medium">{info.hospital}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Data:</span>
            <p className="font-medium">{info.data}</p>
          </div>
        </div>
      </div>

      {info.honorarios && (
        <div>
          <h3 className="font-medium text-lg mb-2">Honorários</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Apresentado:</span>
              <p className="font-medium">
                R$ {info.honorarios.totalApresentado.toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Aprovado:</span>
              <p className="font-medium">
                R$ {info.honorarios.totalAprovado.toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Glosa:</span>
              <p className="font-medium">R$ {info.honorarios.totalGlosa.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Procedimentos:</span>
              <p className="font-medium">{info.honorarios.totalProcedimentos}</p>
            </div>
          </div>
        </div>
      )}

      {info.periodo && (
        <div>
          <h3 className="font-medium text-lg mb-2">Período</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Início:</span>
              <p className="font-medium">{info.periodo.inicio}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fim:</span>
              <p className="font-medium">{info.periodo.fim}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
