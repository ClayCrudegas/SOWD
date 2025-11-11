import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { RivePlant } from '@/components/RivePlant';
import { ArrowLeft, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlantShowcaseScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Plant Animation</Text>
          <Text style={styles.headerSubtitle}>
            Interactive Rive animation showcase
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#e0f2fe', '#bae6fd']}
          style={styles.showcaseContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}>
          <View style={styles.mainPlant}>
            <RivePlant size={250} autoplay={true} interactive={true} />
            <Text style={styles.plantLabel}>Tap to interact!</Text>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant Variants</Text>
          <View style={styles.variantsGrid}>
            <View style={styles.variantCard}>
              <RivePlant size={100} autoplay={true} variant="small" />
              <Text style={styles.variantLabel}>Small</Text>
            </View>
            <View style={styles.variantCard}>
              <RivePlant size={100} autoplay={true} variant="default" />
              <Text style={styles.variantLabel}>Default</Text>
            </View>
            <View style={styles.variantCard}>
              <RivePlant size={100} autoplay={true} variant="large" />
              <Text style={styles.variantLabel}>Large</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Info size={24} color="#3b82f6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>About This Animation</Text>
            <Text style={styles.infoText}>
              This plant uses Rive animation from the marketplace. It features
              smooth bone-rigged animations and interactive hover states. The
              animation responds to user interaction and automatically loops for
              a natural, living garden feel.
            </Text>
            <Text style={styles.infoLink}>
              Source: Rive Marketplace - Wavy Plant Bone Rig
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Animation Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Smooth bone-rigged animations</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Interactive hover states</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Automatic looping</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Web and native support</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Customizable size and variants</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  showcaseContainer: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  mainPlant: {
    alignItems: 'center',
  },
  plantLabel: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  variantsGrid: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  variantCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  variantLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  infoCard: {
    marginHorizontal: 24,
    marginTop: 32,
    padding: 20,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    flexDirection: 'row',
    gap: 16,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#1e40af',
    lineHeight: 22,
    marginBottom: 12,
  },
  infoLink: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  spacer: {
    height: 40,
  },
});
