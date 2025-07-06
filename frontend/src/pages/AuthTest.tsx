import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import axios from 'axios';

export default function AuthTest() {
  // Cadastro
  const [crmCadastro, setCrmCadastro] = useState('');
  const [nomeCadastro, setNomeCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [cadastroSuccess, setCadastroSuccess] = useState<string | null>(null);
  const [cadastroError, setCadastroError] = useState<string | null>(null);

  // Login
  const [crm, setCrm] = useState('');
  const [senha, setSenha] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  // Cadastro handler
  const handleCadastro = async () => {
    setCadastroError(null);
    setCadastroSuccess(null);
    setLoginError(null);
    setToken(null);
    setSuccess(null);
    setJobId(null);
    try {
      await axios.post('https://medcheck-backend.onrender.com/api/v1/register', {
        crm: crmCadastro,
        nome: nomeCadastro,
        senha: senhaCadastro,
      });
      setCadastroSuccess('Cadastro realizado com sucesso! Faça login abaixo.');
      setCrm(crmCadastro); // Preenche CRM no login
      setSenha('');
    } catch (err: any) {
      setCadastroError(err?.response?.data?.detail || 'Erro ao cadastrar.');
    }
  };

  // Login handler
  const handleLogin = async () => {
    setLoginError(null);
    setToken(null);
    setSuccess(null);
    setJobId(null);
    try {
      const params = new URLSearchParams();
      params.append('username', crm);
      params.append('password', senha);
      const res = await axios.post(
        'https://medcheck-backend.onrender.com/token',
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
      setToken(res.data.access_token);
    } catch (err) {
      setLoginError('CRM ou senha inválidos ou backend indisponível.');
    }
  };

  // Upload handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setUploadError(null);
      setSuccess(null);
      setJobId(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Selecione um arquivo PDF.');
      return;
    }
    if (!token) {
      setUploadError('Faça login antes de enviar o arquivo.');
      return;
    }
    setUploading(true);
    setUploadError(null);
    setSuccess(null);
    setJobId(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(
        'https://medcheck-backend.onrender.com/api/v1/validate',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setSuccess('Upload realizado com sucesso!');
      setJobId(res.data.job_id);
    } catch (err) {
      setUploadError('Erro ao enviar arquivo ou autenticação inválida.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Teste de Cadastro, Login e Upload (JWT)
      </Typography>
      {/* Cadastro */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Cadastro de Médico</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="CRM"
            value={crmCadastro}
            onChange={(e) => setCrmCadastro(e.target.value)}
            autoComplete="off"
          />
          <TextField
            label="Nome"
            value={nomeCadastro}
            onChange={(e) => setNomeCadastro(e.target.value)}
            autoComplete="off"
          />
          <TextField
            label="Senha"
            type="password"
            value={senhaCadastro}
            onChange={(e) => setSenhaCadastro(e.target.value)}
            autoComplete="new-password"
          />
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleCadastro}
            disabled={!crmCadastro || !nomeCadastro || !senhaCadastro}
          >
            Cadastrar
          </Button>
          {cadastroError && <Alert severity="error">{cadastroError}</Alert>}
          {cadastroSuccess && <Alert severity="success">{cadastroSuccess}</Alert>}
        </Box>
      </Paper>
      {/* Login */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Login</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="CRM"
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
            autoComplete="username"
          />
          <TextField
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
          />
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            disabled={!!token}
          >
            {token ? 'Logado' : 'Entrar'}
          </Button>
          {loginError && <Alert severity="error">{loginError}</Alert>}
          {token && (
            <Alert severity="success">Login realizado! Token JWT obtido.</Alert>
          )}
        </Box>
      </Paper>
      {/* Upload */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Upload de Arquivo</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <input
            accept=".pdf"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
            >
              Selecionar PDF
            </Button>
          </label>
          {file && (
            <Typography variant="body2">
              Arquivo selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{' '}
              MB)
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || uploading || !token}
          >
            {uploading ? <CircularProgress size={24} /> : 'Enviar PDF'}
          </Button>
          {uploadError && <Alert severity="error">{uploadError}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          {jobId && <Alert severity="info">Job ID: {jobId}</Alert>}
        </Box>
      </Paper>
    </Box>
  );
}
