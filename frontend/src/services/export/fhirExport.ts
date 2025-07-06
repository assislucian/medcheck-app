import { saveAs } from 'file-saver';
import { FHIRResourceType } from './types';

/**
 * Exporta dados para JSON no formato HL7 FHIR
 * @param data Os dados a serem exportados
 * @param resourceType Tipo de recurso FHIR (Patient, Practitioner, etc)
 * @param filename Nome do arquivo (sem extensão)
 */
export function exportToFHIR(
  data: any[],
  resourceType: FHIRResourceType,
  filename: string
): void {
  try {
    // Criar estrutura base do bundle FHIR
    const fhirBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      meta: {
        lastUpdated: new Date().toISOString(),
      },
      entry: data.map((item) => {
        // Converter dados para o formato FHIR básico
        const resource: any = {
          resourceType: resourceType,
          id: item.id || crypto.randomUUID(),
          meta: {
            versionId: '1',
            lastUpdated: new Date().toISOString(),
          },
        };

        // Adicionar propriedades específicas por tipo de recurso
        switch (resourceType) {
          case 'Patient':
            return {
              fullUrl: `urn:uuid:${resource.id}`,
              resource: {
                ...resource,
                name: [
                  {
                    use: 'official',
                    text: item.nome || item.name || 'Nome não especificado',
                  },
                ],
                gender: item.genero || item.gender || 'unknown',
                birthDate: item.dataNascimento || item.birthDate,
              },
            };

          case 'Practitioner':
            return {
              fullUrl: `urn:uuid:${resource.id}`,
              resource: {
                ...resource,
                identifier: [
                  {
                    system: 'http://conselho.saude.gov.br/crm',
                    value: item.crm || 'CRM não especificado',
                  },
                ],
                name: [
                  {
                    use: 'official',
                    text: item.nome || item.name || 'Nome não especificado',
                  },
                ],
                qualification: [
                  {
                    code: {
                      coding: [
                        {
                          system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
                          code: 'MD',
                          display: 'Medical Doctor',
                        },
                      ],
                      text: item.especialidade || item.specialty || 'Médico',
                    },
                  },
                ],
              },
            };

          case 'Procedure':
            return {
              fullUrl: `urn:uuid:${resource.id}`,
              resource: {
                ...resource,
                status: 'completed',
                code: {
                  coding: [
                    {
                      system: 'http://www.amb.org.br/cbhpm',
                      code: item.codigo || item.code,
                      display:
                        item.descricao ||
                        item.description ||
                        'Procedimento não especificado',
                    },
                  ],
                },
                subject: {
                  reference: item.pacienteId ? `Patient/${item.pacienteId}` : undefined,
                },
                performer: item.medico
                  ? [
                      {
                        actor: {
                          reference: `Practitioner/${item.medico.id}`,
                        },
                        function: {
                          text: item.medico.funcao || 'Médico responsável',
                        },
                      },
                    ]
                  : undefined,
              },
            };

          default:
            return {
              fullUrl: `urn:uuid:${resource.id}`,
              resource: {
                ...resource,
                ...item,
              },
            };
        }
      }),
    };

    // Converter para JSON e fazer download
    const jsonString = JSON.stringify(fhirBundle, null, 2);
    const blob = new Blob([jsonString], { type: 'application/fhir+json' });
    saveAs(blob, `${filename}.json`);
    console.info('Exportação FHIR concluída com sucesso');
  } catch (error) {
    console.error('Erro ao exportar dados para formato FHIR:', error);
    throw new Error('Falha ao exportar dados para formato FHIR');
  }
}
