import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Validation() {
  const { isAuthenticated } = useAuth();
  const [demonstrativo, setDemonstrativo] = useState<File | null>(null);
  const [guias, setGuias] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  // Handler para demonstrativo
  const handleDemonstrativoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDemonstrativo(e.target.files[0]);
      setError(null);
      setSuccess(null);
      setSummary(null);
      setReportUrl(null);
    }
  };

  // Handler para guias
  const handleGuiasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setGuias(Array.from(e.target.files));
      setError(null);
      setSuccess(null);
      setSummary(null);
      setReportUrl(null);
    }
  };

  // Handler para validação
  const handleValidate = async () => {
    if (!demonstrativo || guias.length === 0) {
      setError('Envie o demonstrativo e pelo menos uma guia.');
      return;
    }
    setProcessing(true);
    setError(null);
    setSuccess(null);
    setSummary(null);
    setReportUrl(null);
    const formData = new FormData();
    formData.append('demonstrativo', demonstrativo);
    guias.forEach((file, idx) => {
      formData.append('guias', file);
    });
    try {
      // Ajuste o endpoint conforme o backend
      const res = await axios.post(
        'https://medcheck-backend.onrender.com/api/v1/validate-cross',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          responseType: 'json',
        }
      );
      setSuccess('Validação concluída!');
      setSummary(res.data.summary);
      setReportUrl(res.data.report_url); // URL para download do relatório
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Erro ao processar validação.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Validação de Demonstrativo e Guias
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          1. Envie o Demonstrativo TISS (PDF)
        </Typography>
        <input
          accept=".pdf"
          style={{ display: 'none' }}
          id="demonstrativo-upload"
          type="file"
          onChange={handleDemonstrativoChange}
        />
        <label htmlFor="demonstrativo-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            disabled={processing}
          >
            Selecionar Demonstrativo
          </Button>
        </label>
        {demonstrativo && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {demonstrativo.name} ({(demonstrativo.size / 1024 / 1024).toFixed(2)} MB)
          </Typography>
        )}
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          2. Envie as Guias de Execução Cirúrgica (PDFs ou ZIP)
        </Typography>
        <input
          accept=".pdf,.zip"
          style={{ display: 'none' }}
          id="guias-upload"
          type="file"
          multiple
          onChange={handleGuiasChange}
        />
        <label htmlFor="guias-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            disabled={processing}
          >
            Selecionar Guias
          </Button>
        </label>
        {guias.length > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {guias.length} arquivo(s) selecionado(s):{' '}
            {guias.map((f) => f.name).join(', ')}
          </Typography>
        )}
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleValidate}
            disabled={!demonstrativo || guias.length === 0 || processing}
            startIcon={
              processing ? <CircularProgress size={24} /> : <CheckCircleIcon />
            }
          >
            {processing ? 'Validando...' : 'Validar'}
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
        {summary && (
          <Paper sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6">Resumo da Validação</Typography>
            <List>
              {Object.entries(summary).map(([key, value]) => (
                <ListItem key={key}>
                  <ListItemText primary={key} secondary={String(value)} />
                </ListItem>
              ))}
            </List>
            {reportUrl && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                href={reportUrl}
                sx={{ mt: 2 }}
                target="_blank"
              >
                Baixar Relatório Detalhado
              </Button>
            )}
          </Paper>
        )}
      </Paper>
    </Box>
  );
}
