import { Camera, CameraResultType, CameraSource, type Photo } from '@capacitor/camera';

export const useCamera = () => {
  const takePhoto = async (): Promise<Photo> => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    return photo;
  };

  return {
    takePhoto,
  };
};
