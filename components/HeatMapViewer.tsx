import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface ImageViewerProps {
  heatmapBase64?: string | null;
  style?: object | object[];
}

const HeatImageViewer: React.FC<ImageViewerProps> = ({
  heatmapBase64,
  style,
}) => {
    console.log("Heatmap Base64:", heatmapBase64);
  return (
    <View style={[styles.container, style]}>
      {heatmapBase64 && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `data:image/png;base64,${heatmapBase64}` }}
            style={styles.baseImage}
            resizeMode="contain"
          />
          <View style={styles.gradientOverlay} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative', // Needed for absolute positioning of overlay
    width: '100%',
    height: '100%',
  },
  baseImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8, // Adjust for better color blending
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    // You can also use a radial gradient or other styles
    opacity: 1, // Adjust the intensity of the color
  },
});

export default HeatImageViewer;