import InputFormField from '@/components/forms/fields/InputFormField';
import SelectFormField from '@/components/forms/fields/SelectFormField';
import TextAreaFormField from '@/components/forms/fields/TextAreaFormField';
import { BasePageLayout, CenterContainer, Content } from '@/components/layouts';
import { db } from '@/infrastructure/firebase';
import { useAuth } from '@/providers/auth';
import { ROUTES } from '@/routes/routes.constants';
import { TransparentIonList } from '@/styles/IonList.styled';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonCardContent, IonItem, IonLabel, useIonToast } from '@ionic/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { StyledIonCard } from '../../components/ui';
import { type FeedbackFormData, useSendFeedback } from '../../hooks/api/feedback/useSendFeedback';

const SubmitButton = styled(IonButton)`
  margin-top: ${designSystem.spacing.lg};
  --border-radius: ${designSystem.borderRadius.lg};
  height: 48px;
  font-weight: ${designSystem.typography.fontWeight.semibold};
`;

const feedbackTypeOptions = [
  { label: 'Report a Bug', value: 'bug' },
  { label: 'Suggest an Improvement', value: 'improvement' },
  { label: 'General Feedback', value: 'feedback' },
];

const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [presentToast] = useIonToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendFeedback } = useSendFeedback();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    defaultValues: {
      type: 'feedback',
      title: '',
      description: '',
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    if (!data.type) {
      presentToast({
        message: 'Please select a feedback type',
        duration: 3000,
        color: 'warning',
        position: 'top',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendFeedback({
        board_slug: 'spendless',
        type: data.type,
        title: data.title,
        description: data.description,
        user_email: user?.email || 'anonymous',
      });
      presentToast({
        message: 'Thank you for your feedback! I appreciate your input.',
        duration: 3000,
        color: 'success',
        position: 'top',
      });

      // Reset form
      reset();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      presentToast({
        message: 'Failed to submit feedback. Please try again.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BasePageLayout
      title='Feedback'
      showBackButton={true}
      showProfileIcon={false}
      defaultBackButtonHref={ROUTES.SPENDING}
    >
      <CenterContainer>
        <StyledIonCard>
          <IonCardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <TransparentIonList lines='none' className='ion-no-padding ion-no-margin'>
                <IonItem>
                  <IonLabel>
                    <h1>Love to Hear From You</h1>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <p>
                      Help me improve Spendless by reporting bugs, suggesting improvements, or
                      sharing your thoughts. Your feedback matters!
                    </p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <SelectFormField
                      name='type'
                      label='What would you like to share?'
                      placeholder='Select feedback type'
                      optionsList={feedbackTypeOptions}
                      register={register}
                      setValue={setValue}
                      getValues={getValues}
                      fill='outline'
                      validationRules={{
                        required: 'Please select a feedback type',
                      }}
                      error={errors.type}
                    />
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel>
                    <InputFormField
                      name='title'
                      label='Title'
                      placeholder='Brief summary of your feedback'
                      register={register}
                      fill='outline'
                      validationRules={{
                        required: 'Title is required',
                        minLength: {
                          value: 3,
                          message: 'Title must be at least 3 characters',
                        },
                        maxLength: {
                          value: 100,
                          message: 'Subject must be less than 100 characters',
                        },
                      }}
                      error={errors.title}
                    />
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel>
                    <TextAreaFormField
                      name='description'
                      label='Description'
                      placeholder='Please provide details...'
                      register={register}
                      fill='outline'
                      counter={true}
                      maxlength={1000}
                      validationRules={{
                        required: 'Description is required',
                        minLength: {
                          value: 10,
                          message: 'Description must be at least 10 characters',
                        },
                        maxLength: {
                          value: 1000,
                          message: 'Description must be less than 1000 characters',
                        },
                      }}
                      error={errors.description}
                    />
                  </IonLabel>
                </IonItem>
              </TransparentIonList>

              <SubmitButton expand='block' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </SubmitButton>
            </form>
          </IonCardContent>
        </StyledIonCard>
      </CenterContainer>
    </BasePageLayout>
  );
};

export default FeedbackPage;
