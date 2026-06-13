import { Gap } from '@/components/shared';
import { designSystem } from '@/theme/designSystem';
import { IonCard, IonCardContent } from '@ionic/react';
import type React from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import OnboardingStep, { type OnboardingStepProps } from '../components/OnboardingStep';

const ConceptContainer = styled.div`
  max-width: 450px;
  margin: 0 auto;
`;

const InteractiveCard = styled(IonCard)<{ $isActive: boolean }>`
  margin-bottom: ${designSystem.spacing.md};
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${(props) =>
    props.$isActive ? designSystem.colors.primary[500] : 'transparent'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.md};
  margin-bottom: ${designSystem.spacing.sm};
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${designSystem.borderRadius.lg};
  background: ${designSystem.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${designSystem.typography.fontSize.lg};
`;

const CardTitle = styled.h3`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin: 0;
`;

const CardDescription = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  line-height: 1.5;
  margin: 0;
`;

const ExpandedContent = styled.div<{ $isVisible: boolean }>`
  max-height: ${(props) => (props.$isVisible ? '200px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease;
  margin-top: ${(props) => (props.$isVisible ? designSystem.spacing.md : '0')};
`;

const ExampleText = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.primary[700]};
  background: ${designSystem.colors.primary[50]};
  padding: ${designSystem.spacing.sm};
  border-radius: ${designSystem.borderRadius.md};
  margin: 0;
  font-style: italic;
`;

const InstructionText = styled.p`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  text-align: center;
  margin-bottom: ${designSystem.spacing.lg};
`;

interface ConceptStepProps extends Omit<OnboardingStepProps, 'title' | 'subtitle' | 'children'> {
  onComplete: () => void;
}

interface ConceptCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  example: string;
}

const concepts: ConceptCard[] = [
  {
    id: 'awareness',
    icon: '🎯',
    title: 'Awareness Over Restriction',
    description:
      'Instead of strict budgets, we focus on understanding your spending patterns and emotions.',
    example:
      '"I noticed I spend more when I\'m stressed. Now I pause and ask: Do I really need this?"',
  },
  {
    id: 'emotions',
    icon: '💭',
    title: 'Emotional Connection',
    description: 'Track how you feel before, during, and after purchases to identify triggers.',
    example:
      '"Bought coffee when anxious about presentation. Could have made tea at home instead."',
  },
  {
    id: 'periods',
    icon: '📅',
    title: 'Fresh Start Periods',
    description:
      'Set spending periods (weeks, months) that give you fresh starts and clear progress.',
    example: '"This week I want to be more mindful about lunch spending. New week, new awareness."',
  },
  {
    id: 'reflection',
    icon: '🔍',
    title: 'Gentle Reflection',
    description: 'Review your spending with curiosity, not judgment. What patterns do you notice?',
    example: '"I see I buy more convenience food on busy days. Maybe I can prep meals on Sunday."',
  },
];

const ConceptStep: React.FC<ConceptStepProps> = ({ onComplete, ...stepProps }) => {
  const [activeCard, setActiveCard] = useState<string>('');
  const [cardsExplored, setCardsExplored] = useState<Set<string>>(new Set());

  const handleCardClick = (cardId: string) => {
    if (activeCard === cardId) {
      setActiveCard('');
    } else {
      setActiveCard(cardId);
      setCardsExplored((prev) => new Set([...prev, cardId]));
    }
  };

  const canProceed = cardsExplored.size >= 2; // User must explore at least 2 concepts

  const handleNext = () => {
    onComplete();
    stepProps.onNext?.();
  };

  return (
    <OnboardingStep
      {...stepProps}
      title='What Makes Spendless Different?'
      subtitle='Mindful spending is about awareness and understanding, not restriction'
      canGoNext={canProceed}
      nextButtonLabel='I Understand'
      onNext={handleNext}
    >
      <ConceptContainer>
        <InstructionText>
          Tap on the concepts below to learn more about mindful spending:
        </InstructionText>

        {concepts.map((concept) => (
          <InteractiveCard
            key={concept.id}
            $isActive={activeCard === concept.id}
            onClick={() => handleCardClick(concept.id)}
          >
            <IonCardContent>
              <CardHeader>
                <CardIcon>{concept.icon}</CardIcon>
                <CardTitle>{concept.title}</CardTitle>
              </CardHeader>

              <CardDescription>{concept.description}</CardDescription>

              <ExpandedContent $isVisible={activeCard === concept.id}>
                <ExampleText>{concept.example}</ExampleText>
              </ExpandedContent>
            </IonCardContent>
          </InteractiveCard>
        ))}

        {cardsExplored.size > 0 && cardsExplored.size < 2 && (
          <InstructionText>Great! Explore at least one more concept to continue.</InstructionText>
        )}

        {canProceed && (
          <InstructionText>
            Perfect! You're ready to start your mindful spending journey.
          </InstructionText>
        )}
      </ConceptContainer>

      <Gap size='lg' />
    </OnboardingStep>
  );
};

export default ConceptStep;
