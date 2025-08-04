/**
 * Componente de Status do Crosscheck
 * =================================
 *
 * Exibe o status em tempo real do crosscheck entre
 * guias e demonstrativos, ajudando o usuário a
 * entender quando o sistema está funcionando 100%.
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { AlertCircle, CheckCircle, Clock, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CrosscheckStatus {
  totalDemonstrativos: number;
  totalGuias: number;
  demonstrativosComCrosscheck: number;
  taxaCrosscheck: number;
  ultimaAtualizacao: string;
  problemas: string[];
}

interface CrosscheckStatusIndicatorProps {
  onUploadGuias?: () => void;
  compact?: boolean;
}

export function CrosscheckStatusIndicator({
  onUploadGuias,
  compact = false,
}: CrosscheckStatusIndicatorProps) {
  const [status, setStatus] = useState<CrosscheckStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCrosscheckStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token não encontrado');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // Buscar demonstrativos
      const demosResponse = await axios.get(`${apiUrl}/api/v1/demonstrativos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Buscar guias
      const guiasResponse = await axios.get(`${apiUrl}/api/v1/guias?pageSize=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const demonstrativos = demosResponse.data || [];
      const guiasData = guiasResponse.data;
      const guias = guiasData?.procedures || guiasData || [];

      // Contar demonstrativos com crosscheck
      let demonstrativosComCrosscheck = 0;
      const problemas: string[] = [];

      // Testar cada demonstrativo
      for (const demo of demonstrativos.slice(0, 3)) {
        // Limitar a 3 para não sobrecarregar
        try {
          const detalhesResponse = await axios.get(
            `${apiUrl}/api/v1/demonstrativos/${demo.id}/detalhes`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const detalhes = detalhesResponse.data || [];
          if (Array.isArray(detalhes) && detalhes.length > 0) {
            // ✅ CORREÇÃO: Verificar papel_exercido ao invés de participacoes
            const comGuiaAssociada = detalhes.filter((p) => {
              const papel = p.papel_exercido || '';
              return papel && papel.trim() !== '' && papel.toLowerCase() !== 'upload guia';
            });

            const semGuia = detalhes.length - comGuiaAssociada.length;

            if (comGuiaAssociada.length > 0) {
              demonstrativosComCrosscheck++;
            }

            if (semGuia > 0) {
              problemas.push(
                `Demonstrativo ${demo.periodo || demo.id}: ${semGuia} procedimento(s) sem guia associada`
              );
            }
          } else {
            problemas.push(
              `Demonstrativo ${demo.periodo || demo.id}: Nenhum procedimento encontrado`
            );
          }
        } catch (err) {
          problemas.push(
            `Demonstrativo ${demo.periodo || demo.id}: Erro ao carregar detalhes`
          );
        }
      }

      // Verificar problemas comuns
      if (demonstrativos.length > 0 && guias.length === 0) {
        problemas.push('Nenhuma guia médica encontrada. Faça upload das guias para associar procedimentos.');
      }

      if (demonstrativos.length === 0) {
        problemas.push(
          'Nenhum demonstrativo encontrado. Faça upload dos demonstrativos para análise.'
        );
      }

      const taxaCrosscheck =
        demonstrativos.length > 0
          ? (demonstrativosComCrosscheck / demonstrativos.length) * 100
          : 0;

      setStatus({
        totalDemonstrativos: demonstrativos.length,
        totalGuias: guias.length,
        demonstrativosComCrosscheck,
        taxaCrosscheck,
        ultimaAtualizacao: new Date().toLocaleTimeString(),
        problemas,
      });
    } catch (err: any) {
      console.error('Erro ao verificar status do crosscheck:', err);
      setError('Erro ao verificar status do crosscheck');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrosscheckStatus();

    // Atualizar quando houver mudanças
    const handleDataChange = () => {
      setTimeout(fetchCrosscheckStatus, 1000); // Delay para dar tempo dos dados serem processados
    };

    window.addEventListener('uploadComplete', handleDataChange);
    window.addEventListener('guiaUploaded', handleDataChange);
    window.addEventListener('demonstrativoUploaded', handleDataChange);
    window.addEventListener('guiaDeleted', handleDataChange);
    window.addEventListener('demonstrativoDeleted', handleDataChange);

    return () => {
      window.removeEventListener('uploadComplete', handleDataChange);
      window.removeEventListener('guiaUploaded', handleDataChange);
      window.removeEventListener('demonstrativoUploaded', handleDataChange);
      window.removeEventListener('guiaDeleted', handleDataChange);
      window.removeEventListener('demonstrativoDeleted', handleDataChange);
    };
  }, []);

  if (loading) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Verificando status do crosscheck...
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!status) return null;

  const getStatusColor = () => {
    if (status.taxaCrosscheck >= 80) return 'success';
    if (status.taxaCrosscheck >= 50) return 'warning';
    return 'destructive';
  };

  const getStatusIcon = () => {
    if (status.taxaCrosscheck >= 80) return <CheckCircle className="h-4 w-4" />;
    if (status.taxaCrosscheck >= 50) return <Clock className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getStatusMessage = () => {
    if (status.taxaCrosscheck >= 80) {
      return 'Crosscheck funcionando perfeitamente';
    }
    if (status.taxaCrosscheck >= 50) {
      return 'Crosscheck parcialmente funcionando';
    }
    return 'Crosscheck precisa de atenção';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
          {getStatusIcon()}
          {status.taxaCrosscheck.toFixed(0)}% Crosscheck
        </Badge>
        <span className="text-xs text-muted-foreground">
          {status.ultimaAtualizacao}
        </span>
      </div>
    );
  }

  return (
    <Alert
      className={`
      ${status.taxaCrosscheck >= 80 ? 'border-green-200 bg-green-50' : ''}
      ${status.taxaCrosscheck >= 50 && status.taxaCrosscheck < 80
          ? 'border-yellow-200 bg-yellow-50'
          : ''
        }
      ${status.taxaCrosscheck < 50 ? 'border-red-200 bg-red-50' : ''}
    `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getStatusIcon()}
          <div className="space-y-1">
            <div className="font-medium">{getStatusMessage()}</div>
            <div className="text-sm text-muted-foreground">
              {status.demonstrativosComCrosscheck} de {status.totalDemonstrativos}{' '}
              demonstrativos com procedimentos associados • {status.totalGuias} procedimentos em guias
            </div>
            <div className="text-xs text-muted-foreground">
              Última verificação: {status.ultimaAtualizacao}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor() as any}>
            {status.taxaCrosscheck.toFixed(1)}%
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCrosscheckStatus}
            className="h-8"
          >
            Atualizar
          </Button>
        </div>
      </div>

      {status.problemas.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="text-sm font-medium">Problemas detectados:</div>
          <ul className="text-sm space-y-1">
            {status.problemas.map((problema, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{problema}</span>
              </li>
            ))}
          </ul>

          {status.totalGuias === 0 && onUploadGuias && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadGuias}
              className="mt-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Fazer Upload de Guias Médicas
            </Button>
          )}
        </div>
      )}
    </Alert>
  );
}
