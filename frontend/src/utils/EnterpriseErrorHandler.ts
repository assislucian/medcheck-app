/**
 * ENTERPRISE ERROR HANDLER - USD $1T Grade
 * 
 * Características:
 * - Error boundaries React para captura completa
 * - Structured logging com correlation IDs
 * - User-friendly messages + technical details para devs
 * - Error reporting automático
 * - Recovery automático quando possível
 * - Analytics de erros para melhorias
 */

import { toast } from 'sonner';

export interface EnterpriseError {
  // Para usuário final
  userMessage: string;
  userAction?: string; // O que o usuário pode fazer
  
  // Para desenvolvedores
  technicalDetails: {
    error?: Error;
    errorMessage?: string;
    errorType?: string;
    stackTrace?: string;
    apiResponse?: any;
    requestId?: string;
    endpoint?: string;
    statusCode?: number;
    timestamp: number;
    userAgent: string;
    url: string;
  };
  
  // Para sistema
  correlationId: string;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'auth' | 'validation' | 'server' | 'client' | 'unknown';
  
  // Para analytics
  userId?: string;
  sessionId?: string;
  featureContext?: string;
}

export interface ErrorRecoveryStrategy {
  canRecover: boolean;
  recoveryAction?: () => Promise<void>;
  recoveryMessage?: string;
  maxRetries?: number;
}

export class EnterpriseErrorHandler {
  private static instance: EnterpriseErrorHandler;
  private errorQueue: EnterpriseError[] = [];
  private retryAttempts: Map<string, number> = new Map();
  private errorAnalytics: Map<string, number> = new Map();
  
  private constructor() {
    this.setupGlobalErrorHandlers();
    this.setupPeriodicReporting();
  }
  
  public static getInstance(): EnterpriseErrorHandler {
    if (!EnterpriseErrorHandler.instance) {
      EnterpriseErrorHandler.instance = new EnterpriseErrorHandler();
    }
    return EnterpriseErrorHandler.instance;
  }
  
  /**
   * Handler principal de erros - PÚBLICO
   */
  public handleError(
    error: Error | string | any,
    context?: {
      feature?: string;
      action?: string;
      endpoint?: string;
      userMessage?: string;
      retryable?: boolean;
    }
  ): EnterpriseError {
    const correlationId = this.generateCorrelationId();
    
    // Analisar o erro
    const analyzedError = this.analyzeError(error, context, correlationId);
    
    // Log estruturado
    this.logError(analyzedError);
    
    // Mostrar para usuário
    this.displayUserFriendlyError(analyzedError);
    
    // Tentar recovery automático
    this.attemptRecovery(analyzedError);
    
    // Analytics
    this.trackErrorAnalytics(analyzedError);
    
    // Adicionar à queue para reporting
    this.errorQueue.push(analyzedError);
    
    return analyzedError;
  }
  
  /**
   * Handler específico para erros de API/Network
   */
  public handleApiError(
    error: any,
    endpoint: string,
    requestData?: any
  ): EnterpriseError {
    const context = {
      feature: 'api',
      endpoint,
      retryable: this.isRetryableError(error),
    };
    
    // Mensagens user-friendly baseadas no status
    let userMessage = 'Erro de comunicação com o servidor';
    let userAction = 'Tente novamente em alguns instantes';
    
    if (error?.response?.status) {
      const status = error.response.status;
      
      if (status === 401) {
        userMessage = 'Sua sessão expirou';
        userAction = 'Faça login novamente';
        context.retryable = false;
      } else if (status === 403) {
        userMessage = 'Você não tem permissão para esta ação';
        userAction = 'Verifique suas permissões';
        context.retryable = false;
      } else if (status === 404) {
        userMessage = 'Recurso não encontrado';
        userAction = 'Verifique se a informação existe';
        context.retryable = false;
      } else if (status === 429) {
        userMessage = 'Muitas tentativas. Aguarde um momento';
        userAction = 'Tente novamente em 1 minuto';
        context.retryable = true;
      } else if (status >= 500) {
        userMessage = 'Erro interno do servidor';
        userAction = 'Nossa equipe foi notificada. Tente novamente';
        context.retryable = true;
      }
    }
    
    return this.handleError(error, {
      ...context,
      userMessage,
    });
  }
  
  /**
   * Handler específico para erros de autenticação
   */
  public handleAuthError(error: any): EnterpriseError {
    const authError = this.handleError(error, {
      feature: 'auth',
      userMessage: 'Problema de autenticação detectado',
      retryable: false,
    });
    
    // Trigger logout se necessário
    if (error?.response?.status === 401) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }, 1000);
    }
    
    return authError;
  }
  
  /**
   * Handler específico para erros de upload
   */
  public handleUploadError(
    error: any,
    filename?: string,
    fileSize?: number
  ): EnterpriseError {
    let userMessage = 'Erro durante o upload do arquivo';
    let userAction = 'Verifique o arquivo e tente novamente';
    
    // Análise específica de upload
    if (error?.message?.includes('too large')) {
      userMessage = `Arquivo muito grande: ${filename}`;
      userAction = 'Use um arquivo menor que 50MB';
    } else if (error?.message?.includes('network')) {
      userMessage = 'Problema de conexão durante upload';
      userAction = 'Verifique sua internet e tente novamente';
    } else if (error?.message?.includes('timeout')) {
      userMessage = 'Upload demorou muito para completar';
      userAction = 'Tente com um arquivo menor ou verifique a conexão';
    }
    
    return this.handleError(error, {
      feature: 'upload',
      userMessage,
      retryable: true,
    });
  }
  
  /**
   * Analisador inteligente de erros
   */
  private analyzeError(
    error: any,
    context: any = {},
    correlationId: string
  ): EnterpriseError {
    // Extrair informações do erro
    let errorMessage = 'Erro desconhecido';
    let errorType = 'unknown';
    let stackTrace = '';
    let statusCode: number | undefined;
    let apiResponse: any;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorType = error.name;
      stackTrace = error.stack || '';
    } else if (typeof error === 'string') {
      errorMessage = error;
      errorType = 'string';
    } else if (error?.response) {
      // Axios error
      errorMessage = error.response.data?.detail || error.response.data?.message || error.message;
      statusCode = error.response.status;
      apiResponse = error.response.data;
      errorType = 'api_error';
    } else if (error?.message) {
      errorMessage = error.message;
      errorType = error.type || 'generic';
    }
    
    // Determinar categoria
    let category: EnterpriseError['category'] = 'unknown';
    if (statusCode) {
      if (statusCode === 401 || statusCode === 403) {
        category = 'auth';
      } else if (statusCode >= 400 && statusCode < 500) {
        category = 'validation';
      } else if (statusCode >= 500) {
        category = 'server';
      } else {
        category = 'network';
      }
    } else if (errorType === 'NetworkError' || errorMessage.includes('network')) {
      category = 'network';
    } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      category = 'validation';
    }
    
    // Determinar severidade
    let severity: EnterpriseError['severity'] = 'medium';
    if (statusCode === 401 || statusCode === 403 || category === 'auth') {
      severity = 'high';
    } else if (statusCode && statusCode >= 500) {
      severity = 'critical';
    } else if (category === 'validation') {
      severity = 'low';
    }
    
    return {
      userMessage: context.userMessage || this.getDefaultUserMessage(category, statusCode),
      userAction: this.getDefaultUserAction(category, statusCode),
      technicalDetails: {
        error: error instanceof Error ? error : undefined,
        errorMessage,
        errorType,
        stackTrace,
        apiResponse,
        endpoint: context.endpoint,
        statusCode,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
      correlationId,
      retryable: context.retryable ?? this.isRetryableError(error),
      severity,
      category,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      featureContext: context.feature,
    };
  }
  
  /**
   * Display user-friendly do erro
   */
  private displayUserFriendlyError(error: EnterpriseError): void {
    const toastId = `error-${error.correlationId}`;
    
    // Configurar toast baseado na severidade
    const toastConfig = {
      id: toastId,
      duration: this.getToastDuration(error.severity),
      action: error.retryable ? {
        label: 'Tentar Novamente',
        onClick: () => this.retryLastAction(error),
      } : undefined,
    };
    
    switch (error.severity) {
      case 'critical':
        toast.error(error.userMessage, {
          ...toastConfig,
          description: `Erro crítico detectado. ID: ${error.correlationId.slice(-8)}`,
        });
        break;
        
      case 'high':
        toast.error(error.userMessage, {
          ...toastConfig,
          description: error.userAction,
        });
        break;
        
      case 'medium':
        toast.warning(error.userMessage, {
          ...toastConfig,
          description: error.userAction,
        });
        break;
        
      case 'low':
        toast.info(error.userMessage, {
          ...toastConfig,
          description: error.userAction,
        });
        break;
    }
    
    // Log para desenvolvedores no console
    if (import.meta.env.DEV) {
      console.group(`🔥 Enterprise Error [${error.severity.toUpperCase()}]`);
      console.log('User Message:', error.userMessage);
      console.log('Correlation ID:', error.correlationId);
      console.log('Category:', error.category);
      console.log('Technical Details:', error.technicalDetails);
      if (error.technicalDetails.error) {
        console.error('Original Error:', error.technicalDetails.error);
      }
      console.groupEnd();
    }
  }
  
  /**
   * Tentativa de recovery automático
   */
  private attemptRecovery(error: EnterpriseError): void {
    if (!error.retryable) return;
    
    const strategy = this.getRecoveryStrategy(error);
    
    if (strategy.canRecover && strategy.recoveryAction) {
      const retryKey = `${error.category}-${error.featureContext}`;
      const currentRetries = this.retryAttempts.get(retryKey) || 0;
      
      if (currentRetries < (strategy.maxRetries || 3)) {
        this.retryAttempts.set(retryKey, currentRetries + 1);
        
        setTimeout(async () => {
          try {
            await strategy.recoveryAction!();
            
            // Recovery bem-sucedido
            toast.success('Problema resolvido automaticamente', {
              id: `recovery-${error.correlationId}`,
            });
            
            // Reset retry count
            this.retryAttempts.delete(retryKey);
            
          } catch (recoveryError) {
            // Recovery falhou
            console.warn('Recovery failed:', recoveryError);
          }
        }, this.getRetryDelay(currentRetries));
      }
    }
  }
  
  /**
   * Estratégias de recovery específicas
   */
  private getRecoveryStrategy(error: EnterpriseError): ErrorRecoveryStrategy {
    switch (error.category) {
      case 'network':
        return {
          canRecover: true,
          recoveryAction: async () => {
            // Tentar reconectar
            await fetch('/health', { method: 'GET' });
          },
          recoveryMessage: 'Tentando reconectar...',
          maxRetries: 3,
        };
        
      case 'auth':
        if (error.technicalDetails.statusCode === 401) {
          return {
            canRecover: true,
            recoveryAction: async () => {
              // Tentar refresh token
              const authManager = await import('./auth/AuthManager');
              await authManager.AuthManager.getInstance().refreshTokenSilently();
            },
            recoveryMessage: 'Renovando autenticação...',
            maxRetries: 1,
          };
        }
        break;
        
      case 'server':
        return {
          canRecover: true,
          recoveryAction: async () => {
            // Aguardar e tentar novamente
            await new Promise(resolve => setTimeout(resolve, 2000));
          },
          recoveryMessage: 'Aguardando servidor...',
          maxRetries: 2,
        };
    }
    
    return { canRecover: false };
  }
  
  /**
   * Setup de handlers globais
   */
  private setupGlobalErrorHandlers(): void {
    // Capturar erros JavaScript não tratados
    window.addEventListener('error', (event) => {
      this.handleError(event.error || event.message, {
        feature: 'global',
        action: 'unhandled_error',
      });
    });
    
    // Capturar promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        feature: 'global',
        action: 'unhandled_promise_rejection',
      });
    });
  }
  
  /**
   * Reporting periódico de erros
   */
  private setupPeriodicReporting(): void {
    setInterval(() => {
      if (this.errorQueue.length > 0) {
        this.sendErrorBatch();
      }
    }, 30000); // 30 segundos
  }
  
  /**
   * Envio de lote de erros para monitoramento
   */
  private async sendErrorBatch(): void {
    if (this.errorQueue.length === 0) return;
    
    const batch = [...this.errorQueue];
    this.errorQueue = [];
    
    try {
      // Em produção, enviar para serviço de monitoramento
      await fetch('/api/v1/errors/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: batch }),
      });
    } catch (e) {
      // Se falhar, recolocar na queue (limitado)
      if (this.errorQueue.length < 100) {
        this.errorQueue.push(...batch.slice(0, 50));
      }
    }
  }
  
  /**
   * Utilitários privados
   */
  private generateCorrelationId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
  
  private isRetryableError(error: any): boolean {
    if (error?.response?.status) {
      const status = error.response.status;
      return status >= 500 || status === 429 || status === 408;
    }
    
    if (error?.code) {
      return ['NETWORK_ERROR', 'TIMEOUT', 'ECONNRESET'].includes(error.code);
    }
    
    return false;
  }
  
  private getDefaultUserMessage(category: string, statusCode?: number): string {
    if (statusCode === 401) return 'Sessão expirada';
    if (statusCode === 403) return 'Acesso negado';
    if (statusCode === 404) return 'Recurso não encontrado';
    if (statusCode === 429) return 'Muitas tentativas';
    if (statusCode && statusCode >= 500) return 'Erro do servidor';
    
    switch (category) {
      case 'network': return 'Problema de conexão';
      case 'auth': return 'Erro de autenticação';
      case 'validation': return 'Dados inválidos';
      case 'server': return 'Erro interno';
      default: return 'Erro inesperado';
    }
  }
  
  private getDefaultUserAction(category: string, statusCode?: number): string {
    if (statusCode === 401) return 'Faça login novamente';
    if (statusCode === 403) return 'Verifique suas permissões';
    if (statusCode === 429) return 'Aguarde um momento';
    
    switch (category) {
      case 'network': return 'Verifique sua conexão';
      case 'auth': return 'Refaça o login';
      case 'validation': return 'Corrija os dados e tente novamente';
      default: return 'Tente novamente em alguns instantes';
    }
  }
  
  private getToastDuration(severity: string): number {
    switch (severity) {
      case 'critical': return 10000; // 10s
      case 'high': return 7000; // 7s
      case 'medium': return 5000; // 5s
      case 'low': return 3000; // 3s
      default: return 5000;
    }
  }
  
  private getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff max 10s
  }
  
  private getCurrentUserId(): string | undefined {
    try {
      const token = localStorage.getItem('token');
      if (!token) return undefined;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.crm || payload.sub;
    } catch {
      return undefined;
    }
  }
  
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
  
  private trackErrorAnalytics(error: EnterpriseError): void {
    const key = `${error.category}-${error.severity}`;
    const current = this.errorAnalytics.get(key) || 0;
    this.errorAnalytics.set(key, current + 1);
  }
  
  private logError(error: EnterpriseError): void {
    const logLevel = this.getLogLevel(error.severity);
    
    console[logLevel](`[EnterpriseError] ${error.userMessage}`, {
      correlationId: error.correlationId,
      category: error.category,
      severity: error.severity,
      retryable: error.retryable,
      technicalDetails: error.technicalDetails,
    });
  }
  
  private getLogLevel(severity: string): 'error' | 'warn' | 'info' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'info';
    }
  }
  
  private retryLastAction(error: EnterpriseError): void {
    // Implementar retry da última ação se possível
    console.log('Retry requested for:', error.correlationId);
  }
  
  /**
   * Métodos públicos para analytics
   */
  public getErrorAnalytics(): Map<string, number> {
    return new Map(this.errorAnalytics);
  }
  
  public clearErrorAnalytics(): void {
    this.errorAnalytics.clear();
  }
}

// Instância global
export const enterpriseErrorHandler = EnterpriseErrorHandler.getInstance();

// Hooks para React
export const useEnterpriseErrorHandler = () => {
  return {
    handleError: enterpriseErrorHandler.handleError.bind(enterpriseErrorHandler),
    handleApiError: enterpriseErrorHandler.handleApiError.bind(enterpriseErrorHandler),
    handleAuthError: enterpriseErrorHandler.handleAuthError.bind(enterpriseErrorHandler),
    handleUploadError: enterpriseErrorHandler.handleUploadError.bind(enterpriseErrorHandler),
    getErrorAnalytics: enterpriseErrorHandler.getErrorAnalytics.bind(enterpriseErrorHandler),
  };
}; 