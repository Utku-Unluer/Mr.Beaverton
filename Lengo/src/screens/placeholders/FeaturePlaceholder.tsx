import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, List, Divider } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { commonStyles } from '../../styles/theme';

type RootStackParamList = {
  Home: undefined;
  FeaturePlaceholder: { featureId: number; featureName: string; description: string };
};

type FeaturePlaceholderRouteProp = RouteProp<RootStackParamList, 'FeaturePlaceholder'>;

// Her özellik için beklenen işlevselliği tanımla
const featureRequirements: Record<number, string[]> = {
  1: [
    'E-posta/şifre ile kullanıcı kaydı',
    'E-posta/şifre ile kullanıcı girişi',
    'Şifre kurtarma',
    'Kullanıcı profili görüntüleme ve yönetimi',
    'Oturum yönetimi',
    'Güvenli token depolama'
  ],
  2: [
    'Önizleme bilgileriyle tüm kullanıcı listelerini görüntüleme',
    'Liste sıralama ve filtreleme seçenekleri',
    'Hızlı eylemler (öğrenme, quiz, detayları görüntüleme)',
    'Liste ilerlemesi için görsel göstergeler',
    'Yenilemek için çekme ve sayfalandırma'
  ],
  3: [
    'Doğrulama ile liste oluşturma formu',
    'Kaynağı belirtmek için isteğe bağlı bağlam alanı',
    'Liste için dil seçimi',
    'Oluşturmadan sonra hemen kelime ekleme seçeneği',
    'Yaygın liste türleri için şablon/kategori seçimi'
  ],
  4: [
    'Otomatik tamamlama önerileri ile kelime ekleme formu',
    'API kullanarak otomatik anlam getirme',
    'Toplu kelime ekleme özelliği',
    'Bağlam örneği alanı',
    'Resim/telaffuz ilişkilendirme (isteğe bağlı)'
  ],
  5: [
    'Çoktan seçmeli alıştırmalar',
    'Oturum sırasında ilerleme takibi',
    'Motivasyon için seri sayacı',
    'Cevaplara geri bildirim',
    'Oturum devam ettirme ve geçmişi',
    'Çeşitli alıştırma türleri'
  ],
  6: [
    'Öğrenme Modundan daha zorlu sorular',
    'Puan takibi ve geçmişi',
    'Zaman sınırı seçeneği',
    'Yanlış cevapların incelenmesi',
    'Quiz sonuçları özeti',
    'Sonuçları paylaşma işlevselliği'
  ],
  7: [
    'Listedeki tüm kelimeleri anlamlarıyla görüntüleme',
    'Kelime düzenleme ve silme',
    'Liste bilgilerini düzenleme',
    'İlerleme istatistikleri',
    'Öğrenme/Quiz modu başlatma seçenekleri',
    'Kelime sıralama ve filtreleme'
  ],
  8: [
    'Genel öğrenme istatistikleri',
    'Liste bazında ilerleme görünümü',
    'Kelime hakimiyeti göstergeleri',
    'İlerleme geçmişi grafikleri',
    'Öğrenme serileri ve başarılar',
    'Önerilen inceleme kelimeleri'
  ],
  9: [
    'Tüm içerikte global arama',
    'Listeye, tarihe, ilerleme düzeyine göre filtreleme',
    'Son aramalar geçmişi',
    'Sesli arama özelliği',
    'Önerilen arama terimleri',
    'Arama sonuçlarından doğrudan eylemler'
  ],
  10: [
    'Tema ve görünüm ayarları',
    'Bildirim tercihleri',
    'Varsayılan liste seçenekleri',
    'Öğrenme oturumu yapılandırmaları',
    'Veri yönetimi (dışa aktarma/içe aktarma/temizleme)',
    'Hesap ayarları entegrasyonu'
  ],
  11: [
    'Temel uygulamada olmayan benzersiz değer önerisi',
    'Mobile özgü yeteneklerin kullanımı',
    'Mevcut özelliklerle entegrasyon',
    'Kullanıcı dostu deneyim',
    'Performans değerlendirmesi'
  ],
  12: [
    'Öğrenme etkinliğini artıran orijinal fikir',
    'Mobil öncelikli tasarım yaklaşımı',
    'Temel özelliklerle sorunsuz entegrasyon için tasarım',
    'Sosyal veya işbirlikçi yönleri dikkate alma',
    'Özellik keşfedilebilirliğine odaklanma'
  ]
};

// Her özellik için tasarım notlarını tanımla
const designNotes: Record<number, string[]> = {
  1: [
    'Modern kimlik doğrulama UI kalıplarını kullan',
    'Güvenliği ve kullanım kolaylığını önceliklendir',
    'Mobil için biyometrik kimlik doğrulamayı düşün',
    'Net mesajlarla hata yönetimini uygula',
    'Erişilebilirlik için tasarla'
  ],
  2: [
    'Görsel olarak çekici bir liste düzeni oluştur',
    'Önizleme bilgileri içeren kartlar kullan',
    'Etkileşimler için akıcı animasyonlar uygula',
    'İskelet yükleme durumlarını düşün',
    'Listeler arasında kolay gezinme için tasarla'
  ],
  3: [
    'Formu basit ve sezgisel tut',
    'Çok alanlı giriş için adım adım yaklaşım kullan',
    'Yardımcı geri bildirimlerle doğrulama uygula',
    'Klavye kaçınmasını düşün',
    'Daha iyi geri bildirim için mikro etkileşimler ekle'
  ],
  4: [
    'Verimli bir kelime ekleme akışı tasarla',
    'Üretkenlik için toplu eklemeyi düşün',
    'Otomatik tamamlama ve önerileri uygula',
    'API çağrıları sırasında yükleme göstergeleri kullan',
    'Başarı onayları göster'
  ],
  5: [
    'Duolingoya benzer ilgi çekici alıştırma UI oluştur',
    'Geri bildirim ve geçişler için animasyonlar kullan',
    'Çeşitli soru türleri için tasarla',
    'İlerleme göstergelerini uygula',
    'Oyunlaştırma öğelerini düşün'
  ],
  6: [
    'Daha resmi bir quiz deneyimi tasarla',
    'Zorluk için zaman tabanlı öğeleri düşün',
    'Net sonuç görselleştirmesi oluştur',
    'Yanlış cevaplar için inceleme modu uygula',
    'Paylaşılabilir sonuçları düşün'
  ],
  7: [
    'Tüm ayrıntılarla kapsamlı liste görünümü oluştur',
    'Verimli kelime yönetimi için tasarla',
    'Sezgisel düzenleme yeteneklerini uygula',
    'Yaygın görevler için hızlı eylem düğmeleri ekle',
    'Liste içinde arama veya filtrelemeyi düşün'
  ],
  8: [
    'Görsel olarak çekici grafikler ve şemalar oluştur',
    'Anlamlı ilerleme göstergeleri tasarla',
    'Sezgisel zaman tabanlı filtreler uygula',
    'Başarı rozetleri ve ödülleri düşün',
    'Motive edici geri bildirim için tasarla'
  ],
  9: [
    'Önerilerle modern arama UI uygula',
    'Sonuçların hızlı taranması için tasarla',
    'Sesli giriş seçeneğini düşün',
    'İyileştirme için filtre UI uygula',
    'Son ve kaydedilmiş aramaları düşün'
  ],
  10: [
    'Düzenli ayar kategorileri oluştur',
    'Düğmeleri, kaydırıcıları ve seçicileri uygun şekilde uygula',
    'Karanlık/aydınlık mod temalarını düşün',
    'Erişilebilirlik özelleştirmesi için tasarla',
    'Kritik eylemler için onay uygula'
  ],
  11: [
    'Yaratıcı ol ama kullanıcı değerine odaklan',
    'Mobile özgü yetenekleri düşün (kamera, GPS, vb.)',
    'Sezgisel keşif ve kullanım için tasarla',
    'Yeni özellik için kullanıma alma sürecini uygula',
    'Performans etkilerini düşün'
  ],
  12: [
    'Öğrenmeyi geliştiren benzersiz bir özellik oluştur',
    'Masaüstüne göre mobil avantajlara odaklan',
    'Temel özelliklerle sorunsuz entegrasyon için tasarla',
    'Sosyal veya işbirlikçi yönleri düşün',
    'Özellik keşfedilebilirliğine odaklan'
  ]
};

const FeaturePlaceholder = () => {
  const navigation = useNavigation();
  const route = useRoute<FeaturePlaceholderRouteProp>();
  const { featureId, featureName, description } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={[styles.title, {textAlign: 'center', marginTop: 8}]}>{featureName}</Title>
          <View style={{padding: 8}}>
            <Paragraph style={[styles.description, {textAlign: 'justify'}]}>{description}</Paragraph>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Durum: Geliştirme Aşamasında</Text>
          </View>

          <Divider style={styles.divider} />

          <Title style={[styles.sectionTitle, {textAlign: 'center', marginTop: 4}]}>Beklenen İşlevsellik</Title>
          <List.Section style={{marginLeft: -8}}>
            {featureRequirements[featureId]?.map((req, index) => (
              <List.Item
                key={index}
                title={req}
                titleStyle={styles.listItemTitle}
                titleNumberOfLines={5}
                left={props => <MaterialCommunityIcons name="check-circle-outline" size={24} color="#4CAF50" />}
                style={{marginBottom: 8}}
              />
            ))}
          </List.Section>

          <Divider style={styles.divider} />

          <Title style={[styles.sectionTitle, {textAlign: 'center', marginTop: 4}]}>Tasarım Notları</Title>
          <List.Section style={{marginLeft: -8}}>
            {designNotes[featureId]?.map((note, index) => (
              <List.Item
                key={index}
                title={note}
                titleStyle={styles.listItemTitle}
                titleNumberOfLines={5}
                left={props => <MaterialCommunityIcons name="palette-outline" size={24} color="#2196F3" />}
                style={{marginBottom: 8}}
              />
            ))}
          </List.Section>

          <Divider style={styles.divider} />

          <Title style={[styles.sectionTitle, {textAlign: 'center', marginTop: 4}]}>Geliştirici Notları</Title>
          <View style={{padding: 8}}>
            <Paragraph style={[styles.description, {textAlign: 'justify'}]}>
              Bu özellik henüz uygulanmamıştır. Meydan okumanın bir parçası olarak, bu özelliği
              yukarıdaki gereksinimlere ve tasarım notlarına göre uygulamalısınız. Uygulamanın geri kalanıyla
              iyi entegre olduğundan emin olurken kendi yaratıcı dokunuşlarınızı ekleme özgürlüğüne sahipsiniz.
            </Paragraph>
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Ana Sayfaya Dön
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: Platform.select({
    web: {
      height: Dimensions.get('window').height,
      overflow: 'scroll',
      padding: 16,
      backgroundColor: '#0F172A', // slate.900
    },
    default: {
      flex: 1,
      padding: 16,
      backgroundColor: '#0F172A', // slate.900
    },
  }),
  card: {
    marginBottom: 16,
    backgroundColor: '#1E293B', // slate.800
    borderColor: '#334155', // slate.700
    borderWidth: 1,
    paddingHorizontal: 8,
    // Platform-specific shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    color: '#FFFFFF',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#FFFFFF',
    flexWrap: 'wrap',
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
    color: '#94A3B8', // slate.400
    flexWrap: 'wrap',
  },
  statusContainer: {
    backgroundColor: '#422006', // amber bg for dark theme
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B', // amber
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#334155', // slate.700
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    backgroundColor: '#4CAF50', // Green
  },
  listItemTitle: {
    color: '#FFFFFF',
    flexWrap: 'wrap',
    flexShrink: 1,
  }
});

export default FeaturePlaceholder;
