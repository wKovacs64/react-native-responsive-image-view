export const mockUriGood = 'mockUriGood';
export const mockUriBad = 'mockUriBad';
export const mockUriSlowGood = 'mockUriSlowGood';
export const mockUriSlowBad = 'mockUriSlowBad';
export const mockResourceGood = 1000;
export const mockResourceBad = 9999;
export const mockWidth = 800;
export const mockHeight = 600;
export const aspectRatio = 16 / 9;
export const consumerViewProps = {
  hitSlop: {
    top: 10,
    bottom: 10,
    left: 0,
    right: 0,
  },
  style: {
    padding: 20,
  },
};
export const consumerImageProps = {
  onLayout: jest.fn().mockName('Image#onLayout'),
  style: {
    height: '50%',
    width: '50%',
  },
};
