import { InputFormField } from '@/components/forms';
import { Gap } from '@/components/shared';
import ActionButton from '@/components/shared/base/buttons/ActionButton';
import { BasePageLayout, CenterContainer, Content } from '@components/layouts';
import { useAppNotifications } from '@hooks/ui';
import { IonInput, IonItem, IonLabel, IonList } from '@ionic/react';
import { useAuth } from '@providers/auth';
import { useEffect, useState } from 'react';
import { type SubmitHandler, get, useForm } from 'react-hook-form';

interface ProfileInformationFormData {
  displayName: string;
  email: string;
  phoneNumber: string | null;
}

const ProfileInformationPage: React.FC = () => {
  const { user, updateDisplayName, updateEmail } = useAuth();

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<ProfileInformationFormData>({
    defaultValues: {
      displayName: user?.displayName ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? null,
    },
  });

  const { showNotification } = useAppNotifications();

  const onSubmit: SubmitHandler<ProfileInformationFormData> = async (formData) => {
    if (formData.displayName !== user?.displayName) {
      updateDisplayName(formData.displayName);
    }
    if (formData.email !== user?.email) {
      updateEmail(formData.email);
    }
    showNotification('Profile updated successfully');
  };

  const footer = (
    <CenterContainer>
      <Gap size='5px' />
      <ActionButton
        isLoading={isSubmitting}
        isDisabled={!isDirty}
        expand='full'
        onClick={() => onSubmit(getValues())}
        label={'Save'}
      />
    </CenterContainer>
  );

  useEffect(() => {
    if (user) {
      reset({
        displayName: user.displayName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber,
      });
    }
  }, [user, reset]);

  return (
    <BasePageLayout
      title='Profile Information'
      defaultBackButtonHref='/spending'
      showProfileIcon={false}
      showSignoutButton={false}
      footer={footer}
    >
      <CenterContainer>
        <Content marginTop={'10px'}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <IonList lines='none'>
              <IonItem lines='none'>
                <IonLabel>
                  <InputFormField
                    name='displayName'
                    label='Display Name'
                    placeholder='Display Name'
                    register={register}
                    error={errors.displayName}
                    fill='outline'
                    type='text'
                  />
                </IonLabel>
              </IonItem>
              <IonItem lines='none'>
                <IonLabel>
                  <InputFormField
                    name='email'
                    label='Email'
                    placeholder='Email'
                    register={register}
                    error={errors.email}
                    fill='outline'
                    type='email'
                    readonly={true}
                    validationRules={{
                      required: {
                        value: true,
                        message: 'Email is required',
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Invalid email address',
                      },
                    }}
                  />
                </IonLabel>
              </IonItem>
              <IonItem lines='none'>
                <IonLabel>
                  <InputFormField
                    name='phoneNumber'
                    label='Phone'
                    placeholder='Phone'
                    register={register}
                    error={errors.phoneNumber}
                    fill='outline'
                    type='text'
                    readonly={true}
                    validationRules={{
                      required: {
                        value: true,
                        message: 'Phone number is required',
                      },
                      pattern: {
                        value: /^\+?[1-9]\d{1,14}$/,
                        message: 'Invalid phone number',
                      },
                    }}
                  />
                </IonLabel>
              </IonItem>
            </IonList>
          </form>
        </Content>
      </CenterContainer>
    </BasePageLayout>
  );
};

export default ProfileInformationPage;
