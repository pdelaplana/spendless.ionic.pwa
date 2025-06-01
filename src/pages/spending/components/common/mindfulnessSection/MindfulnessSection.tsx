import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';

const MindfulnessSection: React.FC = () => {
  return (
    <IonCard color={'secondary'}>
      <IonCardHeader>
        <IonCardTitle>
          <span>💭 Mindful Moment</span>
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <p>
          Take a moment to reflect on this purchase. What motivated it? How do you feel about it
          now?
        </p>
        <p>
          Remember, every spend is an opportunity to align with your values and goals. Make it
          count!
        </p>
        <div className='form-group full-width'>
          <div className='category-selector'>
            <div className='category-option selected'>
              <span>🏠</span> Needs
            </div>
            <div className='category-option'>
              <span>💝</span> Wants
            </div>
            <div className='category-option'>
              <span>📚</span> Culture
            </div>
            <div className='category-option'>
              <span>⚡</span> Unexpected
            </div>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default MindfulnessSection;
