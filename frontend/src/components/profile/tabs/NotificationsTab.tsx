import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare } from 'lucide-react';

interface NotificationsTabProps {
  loading: boolean;
  onSubmit?: (data: any) => Promise<boolean | void>;
}

export const NotificationsTab = ({ loading, onSubmit }: NotificationsTabProps) => {
  const [notifications, setNotifications] = useState({
    email: {
      newReports: true,
      systemUpdates: true,
      tips: false,
      newsletter: false,
    },
    sms: {
      criticalAlerts: true,
      paymentRecovery: false,
      invoiceReminders: false,
    },
  });

  const handleToggleChange = (
    category: 'email' | 'sms',
    name: string,
    checked: boolean
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: checked,
      },
    }));
  };

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit(notifications);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Preferências de Notificação
        </CardTitle>
        <CardDescription>
          Configure como você deseja receber notificações do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Notificações por Email
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Novos Relatórios</p>
                <p className="text-sm text-muted-foreground">
                  Receba alertas sobre novos relatórios por email
                </p>
              </div>
              <Switch
                checked={notifications.email.newReports}
                onCheckedChange={(checked) =>
                  handleToggleChange('email', 'newReports', checked)
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Atualizações do Sistema</p>
                <p className="text-sm text-muted-foreground">
                  Seja notificado sobre atualizações importantes
                </p>
              </div>
              <Switch
                checked={notifications.email.systemUpdates}
                onCheckedChange={(checked) =>
                  handleToggleChange('email', 'systemUpdates', checked)
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dicas e Novidades</p>
                <p className="text-sm text-muted-foreground">
                  Receba dicas e melhores práticas
                </p>
              </div>
              <Switch
                checked={notifications.email.tips}
                onCheckedChange={(checked) =>
                  handleToggleChange('email', 'tips', checked)
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Newsletter</p>
                <p className="text-sm text-muted-foreground">
                  Receba nossa newsletter mensal
                </p>
              </div>
              <Switch
                checked={notifications.email.newsletter}
                onCheckedChange={(checked) =>
                  handleToggleChange('email', 'newsletter', checked)
                }
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Notificações por SMS
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas Críticos</p>
                <p className="text-sm text-muted-foreground">
                  Receba alertas importantes por SMS
                </p>
              </div>
              <Switch
                checked={notifications.sms.criticalAlerts}
                onCheckedChange={(checked) =>
                  handleToggleChange('sms', 'criticalAlerts', checked)
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Recuperação de Valores</p>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre valores recuperados
                </p>
              </div>
              <Switch
                checked={notifications.sms.paymentRecovery}
                onCheckedChange={(checked) =>
                  handleToggleChange('sms', 'paymentRecovery', checked)
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Lembretes de Fatura</p>
                <p className="text-sm text-muted-foreground">
                  Receba lembretes sobre faturas pendentes
                </p>
              </div>
              <Switch
                checked={notifications.sms.invoiceReminders}
                onCheckedChange={(checked) =>
                  handleToggleChange('sms', 'invoiceReminders', checked)
                }
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Preferências'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
