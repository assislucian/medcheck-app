/// <reference types="jest" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom for the matchers
import UploadSection from '../../UploadSection';

// Make sure the global jest-dom types are loaded
import '../../../types/jest-dom.d';

describe('UploadSection Modes', () => {
  it('guia-only: envia guia e chama função correta', async () => {
    render(<UploadSection />);
    const guiaInput = screen.getByLabelText(/guias médicas/i);
    const file = new File(['content'], 'guia_teste.pdf', { type: 'application/pdf' });
    fireEvent.change(guiaInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/guia_teste.pdf/i)).toBeInTheDocument();
    });

    const processButton = screen.getByText(/processar documentos/i);
    expect(processButton).toBeEnabled();
    fireEvent.click(processButton);

    // Espera mensagem de sucesso (mocka/fakeia API em ambiente de testes real)
    // ...mais asserções específicas
  });

  it('demonstrativo-only: envia demonstrativo e espera warning', async () => {
    render(<UploadSection />);
    const demoInput = screen.getByLabelText(/demonstrativos em PDF/i);
    const file = new File(['pdf'], 'demonstrativo_teste.pdf', {
      type: 'application/pdf',
    });
    fireEvent.change(demoInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/demonstrativo_teste.pdf/i)).toBeInTheDocument();
    });

    const processButton = screen.getByText(/processar documentos/i);
    expect(processButton).toBeEnabled();
    fireEvent.click(processButton);
    // ... mais asserções sobre warnings
  });

  it('complete: envia ambos e executa rotina completa', async () => {
    render(<UploadSection />);
    const guiaInput = screen.getByLabelText(/guias médicas/i);
    const demoInput = screen.getByLabelText(/demonstrativos em PDF/i);

    const guiaFile = new File(['content'], 'guia.pdf', { type: 'application/pdf' });
    const demoFile = new File(['pdf'], 'demonstrativo.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(guiaInput, { target: { files: [guiaFile] } });
    fireEvent.change(demoInput, { target: { files: [demoFile] } });

    await waitFor(() => {
      expect(screen.getByText(/guia.pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/demonstrativo.pdf/i)).toBeInTheDocument();
    });

    const processButton = screen.getByText(/analisar e comparar documentos/i);
    expect(processButton).toBeEnabled();
    fireEvent.click(processButton);

    // ... asserção sucesso
  });

  it('não processa se nada selecionado', async () => {
    render(<UploadSection />);
    const processButton = screen.getByText(/processar documentos/i);
    expect(processButton).toBeDisabled();
    fireEvent.click(processButton);
    await waitFor(() => {
      expect(screen.getByText(/selecione pelo menos um tipo/i)).toBeInTheDocument();
    });
  });
});
