import { IonIcon, IonText } from '@ionic/react';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import type React from 'react';
import styled from 'styled-components';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'At least 6 characters', test: (p) => p.length >= 6 },
];

const RequirementsList = styled.ul`
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
`;

const RequirementItem = styled.li<{ met: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.875rem;
  color: ${(props) => (props.met ? 'var(--ion-color-success)' : 'var(--ion-color-medium)')};

  ion-icon {
    font-size: 1.25rem;
  }
`;

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  return (
    <RequirementsList>
      {requirements.map((req) => {
        const isMet = req.test(password);
        return (
          <RequirementItem key={req.label} met={isMet}>
            <IonIcon icon={isMet ? checkmarkCircle : closeCircle} />
            <IonText>{req.label}</IonText>
          </RequirementItem>
        );
      })}
    </RequirementsList>
  );
};

export default PasswordRequirements;
