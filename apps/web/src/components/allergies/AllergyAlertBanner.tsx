import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, X } from 'lucide-react';
import { allergiesService, PatientAllergy } from '../../services/allergies';

interface AllergyAlertBannerProps {
  patientId: string;
}

export const AllergyAlertBanner: React.FC<AllergyAlertBannerProps> = ({ patientId }) => {
  const { data: severeAllergies = [], isLoading } = useQuery({
    queryKey: ['severe-allergies', patientId],
    queryFn: () => allergiesService.hasSevereActiveAllergies(patientId),
  });

  if (isLoading || severeAllergies.length === 0) {
    return null;
  }

  const allergenNames = severeAllergies.map(a => a.allergen.name).join(', ');

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            ⚠️ Alergia Grave Ativa
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              <strong>Paciente alérgico a:</strong> {allergenNames}
            </p>
            <p className="mt-1">
              Revisar cuidadosamente antes de prescrever medicamentos ou procedimentos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
