import { InputFormField } from '@/components/forms';
import { Gap } from '@/components/shared';
import ActionButton from '@/components/shared/base/buttons/ActionButton';
import { BasePageLayout, CenterContainer, Content } from '@components/layouts';
import { useAppNotifications } from '@hooks/ui';
import { IonItem, IonLabel, IonList } from '@ionic/react';
import { useAuth } from '@providers/auth';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

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
    try {
      if (formData.displayName !== user?.displayName) {
        await updateDisplayName(formData.displayName);
      }
      if (formData.email !== user?.email) {
        await updateEmail(formData.email);
      }
      showNotification('Profile updated successfully');
    } catch (error) {
      showNotification('Failed to update profile');
    }
  };

  const footer = (
    <CenterContainer>
      <Gap size='5px' />
      <ActionButton
        isLoading={isSubmitting}
        isDisabled={!isDirty}
        expand='full'
        type='submit'
        form='profile-form'
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
      //footer={footer}
    >
      <CenterContainer>
        <Content marginTop={'10px'}>
          <form id='profile-form' onSubmit={handleSubmit(onSubmit)}>
            <IonList lines='none'>
              <IonItem lines='none'>
                <IonLabel>
                  <InputFormField
                    name='displayName'
                    label='Display Name'
                    placeholder='Enter your display name'
                    register={register}
                    error={errors.displayName}
                    fill='outline'
                    type='text'
                    validationRules={{
                      required: {
                        value: true,
                        message: 'Display name is required',
                      },
                      minLength: {
                        value: 2,
                        message: 'Display name must be at least 2 characters',
                      },
                    }}
                  />
                </IonLabel>
              </IonItem>
              <IonItem lines='none'>
                <IonLabel>
                  <InputFormField
                    name='email'
                    label='Email'
                    placeholder='Your email address'
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
                    label='Phone Number'
                    placeholder='Your phone number'
                    register={register}
                    error={errors.phoneNumber}
                    fill='outline'
                    type='tel'
                    readonly={true}
                  />
                </IonLabel>
              </IonItem>
            </IonList>
          </form>
          <div className='ion-margin'>
            <ActionButton
              isLoading={isSubmitting}
              isDisabled={!isDirty}
              expand='block'
              type='submit'
              form='profile-form'
              label={'Save'}
            />
          </div>
        </Content>
      </CenterContainer>
    </BasePageLayout>
  );
};

export default ProfileInformationPage;
