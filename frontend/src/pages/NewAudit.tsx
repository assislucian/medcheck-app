import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import UploadSection from '@/components/UploadSection';

const NewAuditPage = () => {
  return (
    <>
      <Helmet>
        <title>Nova Auditoria | MedCheck</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Nova Auditoria</h1>
          <p className="text-muted-foreground">
            Faça upload de guias e demonstrativos para análise automática dos valores.
          </p>
        </div>

        <UploadSection />
      </div>
    </>
  );
};

export default NewAuditPage;
