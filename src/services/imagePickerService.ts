import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary
} from 'react-native-image-picker';

const defaultOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  includeBase64: false,
  selectionLimit: 1
};

const getUriFromResponse = (response: ImagePickerResponse): string | undefined => {
  if (response.didCancel || response.errorCode) {
    return undefined;
  }

  return response.assets?.[0]?.uri;
};

export const imagePickerService = {
  async pickFromCamera(): Promise<string | undefined> {
    const response = await launchCamera(defaultOptions);

    return getUriFromResponse(response);
  },

  async pickFromLibrary(): Promise<string | undefined> {
    const response = await launchImageLibrary(defaultOptions);

    return getUriFromResponse(response);
  }
};
