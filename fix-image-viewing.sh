#!/bin/bash
# Fix react-native-image-viewing web compatibility
if [ -f "node_modules/react-native-image-viewing/dist/components/ImageItem/ImageItem.ios.js" ]; then
  cp node_modules/react-native-image-viewing/dist/components/ImageItem/ImageItem.ios.js node_modules/react-native-image-viewing/dist/components/ImageItem/ImageItem.js
  cp node_modules/react-native-image-viewing/dist/components/ImageItem/ImageItem.ios.d.ts node_modules/react-native-image-viewing/dist/components/ImageItem/ImageItem.d.ts
  echo "✓ Fixed react-native-image-viewing for web"
fi

