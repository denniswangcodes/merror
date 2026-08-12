import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Launches the OS photo library or camera with native crop/zoom editing ("resizer") enabled. */
export async function pickImage(source: 'library' | 'camera', aspect: [number, number]): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', `Merror needs ${source === 'camera' ? 'camera' : 'photo library'} access to add a photo.`);
    return null;
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: 'images',
    allowsEditing: true,
    aspect,
    quality: 1,
  };
  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || !result.assets?.[0]) return null;
  return result.assets[0].uri;
}

/** Resizes + compresses a picked image to a base64 JPEG data URL, stepping quality down to stay under maxChars. */
export async function compressToDataUrl(
  uri: string,
  { maxPx = 1200, quality = 0.85, maxChars = Infinity }: { maxPx?: number; quality?: number; maxChars?: number } = {},
): Promise<string> {
  const resized = await ImageManipulator.manipulate(uri).resize({ width: maxPx }).renderAsync();

  const qualitySteps = [quality, 0.6, 0.4];
  let result = await resized.saveAsync({ compress: qualitySteps[0], format: SaveFormat.JPEG, base64: true });
  for (let i = 1; i < qualitySteps.length && (result.base64?.length ?? 0) > maxChars; i++) {
    result = await resized.saveAsync({ compress: qualitySteps[i], format: SaveFormat.JPEG, base64: true });
  }
  return `data:image/jpeg;base64,${result.base64}`;
}

/** Instagram-style source picker — Camera / Library / Cancel. */
export function showImageSourceSheet(onPick: (source: 'library' | 'camera') => void) {
  Alert.alert('Add a photo', undefined, [
    { text: 'Take Photo', onPress: () => onPick('camera') },
    { text: 'Choose from Library', onPress: () => onPick('library') },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
