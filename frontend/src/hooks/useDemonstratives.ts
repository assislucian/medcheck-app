/**
 * Hook centralizado para gerenciar demonstrativos
 * Elimina duplicação de lógica entre páginas
 */
import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api';
import { toast } from 'sonner';

interface Demonstrative {
  id: number;
  periodo: string;
  filename: string;
  total_presented: number;
  total_approved: number;
  total_glosa: number;
  total_procedures: number;
  upload_time: string;
}

interface DemonstrativeFilters {
  searchTerm: string;
  selectedStatus: string;
  selectedPeriod: string;
  startDate: string;
  endDate: string;
}

export function useDemonstratives() {
  const [demonstratives, setDemonstratives] = useState<Demonstrative[]>([]);
  const [filteredDemonstratives, setFilteredDemonstratives] = useState<Demonstrative[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DemonstrativeFilters>({
    searchTerm: '',
    selectedStatus: 'all',
    selectedPeriod: 'all',
    startDate: '',
    endDate: '',
  });

  // Fetch demonstratives
  const fetchDemonstratives = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApiService.getDemonstratives();
      setDemonstratives(data);
    } catch (error: any) {
      console.error('❌ Erro ao carregar demonstrativos:', error);
      toast.error('Erro ao carregar demonstrativos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...demonstratives];

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(
        (demo) =>
          demo.periodo?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          demo.filename?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.selectedStatus !== 'all') {
      filtered = filtered.filter((demo) => {
        const hasGlosa = demo.total_glosa > 0;
        if (filters.selectedStatus === 'glosado') return hasGlosa;
        if (filters.selectedStatus === 'liberado') return !hasGlosa;
        return true;
      });
    }

    // Date filters
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((demo) => {
        const uploadDate = new Date(demo.upload_time);
        const start = filters.startDate ? new Date(filters.startDate) : new Date('1900-01-01');
        const end = filters.endDate ? new Date(filters.endDate) : new Date('2100-12-31');

        if (filters.endDate) {
          end.setHours(23, 59, 59, 999);
        }

        return uploadDate >= start && uploadDate <= end;
      });
    }
    // Period filter (only if no custom dates)
    else if (filters.selectedPeriod !== 'all') {
      const now = new Date();
      const periods = {
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        '6m': new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000),
        '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      };

      if (periods[filters.selectedPeriod as keyof typeof periods]) {
        filtered = filtered.filter((demo) => {
          const uploadDate = new Date(demo.upload_time);
          return uploadDate >= periods[filters.selectedPeriod as keyof typeof periods];
        });
      }
    }

    setFilteredDemonstratives(filtered);
  }, [demonstratives, filters]);

  // Delete demonstrative
  const deleteDemonstrative = useCallback(async (id: number) => {
    try {
      await ApiService.deleteDemonstrative(id);
      toast.success('Demonstrativo excluído com sucesso!');
      await fetchDemonstratives();
    } catch (error: any) {
      console.error('Erro ao excluir demonstrativo:', error);
      toast.error('Erro ao excluir demonstrativo');
    }
  }, [fetchDemonstratives]);

  // Calculate stats
  const stats = {
    totalProcessado: demonstratives.reduce((sum, d) => sum + (d.total_approved || 0), 0),
    totalGlosa: demonstratives.reduce((sum, d) => sum + (d.total_glosa || 0), 0),
    totalProcedimentos: demonstratives.reduce((sum, d) => sum + (d.total_procedures || 0), 0),
    demonstrativosComGlosa: demonstratives.filter((d) => d.total_glosa > 0).length,
    demonstrativosSemGlosa: demonstratives.filter((d) => d.total_glosa === 0).length,
    totalApresentado: demonstratives.reduce((sum, d) => sum + (d.total_presented || 0), 0),
  };

  // Effects
  useEffect(() => {
    fetchDemonstratives();
  }, [fetchDemonstratives]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Filter update functions
  const updateFilter = (key: keyof DemonstrativeFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedStatus: 'all',
      selectedPeriod: 'all',
      startDate: '',
      endDate: '',
    });
  };

  return {
    demonstratives,
    filteredDemonstratives,
    loading,
    filters,
    stats,
    updateFilter,
    clearFilters,
    fetchDemonstratives,
    deleteDemonstrative,
  };
}