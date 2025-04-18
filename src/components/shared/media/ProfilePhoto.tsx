import { IonAvatar, IonIcon } from '@ionic/react';
import { pencil } from 'ionicons/icons';
import styled from 'styled-components';
import { storage } from '@infrastructure/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useCamera } from '@hooks/device';

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const StyledAvatar = styled(IonAvatar)`
  width: 7rem;
  height: 7rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 300px) {
    width: 4rem;
    height: 4rem;
  }

  @media (min-width: 550px) {
    width: 6rem;
    height: 6rem;
  }

  @media (min-width: 597px) {
    width: 8rem;
    height: 8rem;
  }

  @media (min-width: 768px) {
    width: 11rem;
    height: 11rem;
  }

  @media (min-width: 992px) {
    width: 12rem;
    height: 12rem;
  }

  @media (min-width: 1200px) {
    width: 12rem;
    height: 12rem;
  }
`;

const Placeholder = styled.div`
  background-color: #dbeafe;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 500;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 640px) {
    font-size: 0.875rem;
  }

  @media (min-width: 768px) {
    font-size: 1rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.125rem;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const EditIcon = styled(IonIcon)`
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border-radius: 50%;
  padding: 0.2rem;
  cursor: pointer;
  font-size: 1.5rem;
`;

interface ProfilePhotoProps {
  photoUrl: string;
  name: string;
  storagePath?: string;
  className?: string;
  style?: React.CSSProperties;
  editable?: boolean;
  updatePhotoUrl?: (photoUrl: string) => void;
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  photoUrl,
  name,
  storagePath = '',
  className = '',
  style,
  editable = true,
  updatePhotoUrl = () => {},
}) => {
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  const { takePhoto } = useCamera();

  // Generate initials if no image is provided
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const uploadPhotoToStorage = async (webPath: string) => {
    try {
      const response = await fetch(webPath);
      const blob = await response.blob();

      // Create a reference in Firebase Storage
      const storageRef = ref(storage, `${storagePath}/photo_${new Date().getTime()}.jpg`);

      // Upload the image
      await uploadBytes(storageRef, blob);

      // Get the download URL of the uploaded image
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading photo: ', error);
    }
  };

  const handleTakePhotoEvent = async () => {
    try {
      const photo = await takePhoto();
      if (photo?.webPath) {
        const photoUrl = await uploadPhotoToStorage(photo.webPath);
        updatePhotoUrl(photoUrl ?? '');
        setProfilePhotoUrl(photoUrl ?? '');
      }
    } catch (error) {
      console.error('Error updating photo URL:', error);
    }
  };

  useEffect(() => {
    setProfilePhotoUrl(photoUrl);
  }, [photoUrl]);

  return (
    <Container className={className}>
      <StyledAvatar style={style}>
        {profilePhotoUrl ? (
          <img src={profilePhotoUrl} alt={name || 'Avatar'} />
        ) : (
          <Placeholder>{getInitials(name)}</Placeholder>
        )}
      </StyledAvatar>
      {editable && (
        <EditIcon
          icon={pencil}
          size='small'
          color='dark'
          onClick={async () => await handleTakePhotoEvent()}
        />
      )}
    </Container>
  );
};

export default ProfilePhoto;
