import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorAlertProps {
  message: string | null;
}

const ErrorAlert = ({ message }: ErrorAlertProps) => {
  if (!message) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
