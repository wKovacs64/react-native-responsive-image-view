import { Image } from 'react-native';
import {
  mockUriGood,
  mockUriBad,
  mockUriSlowGood,
  mockUriSlowBad,
  mockResourceGood,
  mockWidth,
  mockHeight,
} from './src/__fixtures__';

jest
  .spyOn(Image, 'getSize')
  .mockImplementation((uri, onLoad = () => {}, onError = () => {}) => {
    switch (uri) {
      case mockUriGood:
        onLoad(mockWidth, mockHeight);
        break;
      case mockUriBad:
        onError(new Error(uri));
        break;
      case mockUriSlowGood:
        setImmediate(onLoad);
        break;
      case mockUriSlowBad:
        setImmediate(() => {
          onError(uri);
        });
        break;
      default:
        throw new Error(`Unexpected URI value in test: ${uri}`);
    }
  });

// @ts-expect-error: contrary to what TS thinks, the current implementation of
// resolveAssetSource _can_ return `null`, so this is a valid mock.
jest.spyOn(Image, 'resolveAssetSource').mockImplementation((source) => {
  if (source === mockResourceGood) {
    return { width: mockWidth, height: mockHeight };
  }
  return null;
});
