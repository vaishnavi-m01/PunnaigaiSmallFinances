import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  RefreshControl,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { CustomButton } from '../../component/Common/CustomButton';
import { AppIcon, IconName } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { uploadDocument, fetchDashboardThunk } from '../../store/customerSlice';
import { showToast } from '../../store/toastSlice';
import { CustomerDocumentItem } from '../../types/models';

export const MyDocumentsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const documents = useAppSelector(state => state.customer.documents);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CustomerDocumentItem | null>(null);
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchDashboardThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const handleUploadClick = (doc?: CustomerDocumentItem) => {
    setSelectedDoc(doc || documents.find((d: CustomerDocumentItem) => d.status === 'Not Uploaded') || documents[0]);
    setModalVisible(true);
  };

  const handleConfirmUpload = () => {
    if (selectedDoc) {
      dispatch(uploadDocument({ docId: selectedDoc.id, fileUri: 'mock_uploaded_file.pdf' }));
      setModalVisible(false);
      dispatch(
        showToast({
          type: 'success',
          title: 'Document Uploaded',
          message: `${selectedDoc.title} uploaded successfully and submitted for admin verification.`,
        })
      );
    }
  };

  const getDocIconAndTheme = (category: string, status: string): { icon: IconName; bg: string; color: string; statusColor: string; statusText: string } => {
    if (status === 'Verified') {
      let icon: IconName = 'user';
      if (category === 'Address') icon = 'home';
      else if (category === 'Employment') icon = 'briefcase';
      else if (category === 'Identity') icon = 'user';

      return {
        icon,
        bg: '#EAF5EE',
        color: '#0D523B',
        statusColor: '#10B981',
        statusText: 'Verified',
      };
    } else if (status === 'Pending') {
      return {
        icon: 'file-text',
        bg: '#FEF3C7',
        color: '#D97706',
        statusColor: '#F59E0B',
        statusText: '• Pending',
      };
    } else {
      let icon: IconName = 'file-text';
      if (category === 'Other') icon = 'file';

      return {
        icon,
        bg: '#FEE2E2',
        color: '#EF4444',
        statusColor: '#EF4444',
        statusText: 'Not Uploaded',
      };
    }
  };

  const renderDocumentItem = ({ item }: { item: CustomerDocumentItem }) => {
    const docTheme = getDocIconAndTheme(item.category, item.status);

    return (
      <Card
        style={styles.docCard}
        variant="flat"
        padding={12}
        onPress={() => handleUploadClick(item)}
      >
        <View style={styles.docContent}>
          <View style={styles.docLeft}>
            <View style={[styles.iconCircle, { backgroundColor: docTheme.bg }]}>
              <AppIcon name={docTheme.icon} size={18} color={docTheme.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.docStatus, { color: docTheme.statusColor }]}>
                {docTheme.statusText}
              </Text>
            </View>
          </View>

          <AppIcon name="more-horizontal" size={20} color="#94A3B8" />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="My Documents" showBack={true} />

      <View style={styles.content}>
        {isRefreshing ? (
          <View style={{ paddingTop: 16 }}>
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={item => item.id}
            renderItem={renderDocumentItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0D523B" />
            }
          />
        )}
      </View>

      {/* Upload Document Pill Button - Always visible at bottom */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 12) }]}>
        <CustomButton
          title="Upload Document"
          onPress={() => handleUploadClick()}
          variant="primary"
          style={styles.uploadButton}
          gradientColors={['#168A53', '#0D523B']}
        />
      </View>

      {/* Upload Sheet Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Upload Document
                
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <AppIcon name="alert-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalPrompt}>
              Select document to submit:
            </Text>

            {/* Document Select Option Pills */}
            <View style={styles.docOptionsGrid}>
              {documents.map((d: CustomerDocumentItem) => {
                const isSelected = selectedDoc?.id === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[
                      styles.docOption,
                      {
                        borderColor: isSelected ? '#0D523B' : '#E2E8F0',
                        backgroundColor: isSelected ? '#EAF5EE' : '#FFFFFF',
                      },
                    ]}
                    onPress={() => setSelectedDoc(d)}
                  >
                    <Text
                      style={[
                        styles.docOptionText,
                        {
                          color: isSelected ? '#0D523B' : '#0F172A',
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {d.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.uploadDropZone} activeOpacity={0.8}>
              <AppIcon name="upload" size={28} color="#0D523B" />
              <Text style={styles.dropZoneTitle}>
                Browse File or Camera
              </Text>
              <Text style={styles.dropZoneSub}>
                Supports PDF, JPG, PNG (Max 5MB)
              </Text>
            </TouchableOpacity>

            <CustomButton
              title="Submit for Verification"
              onPress={handleConfirmUpload}
              variant="primary"
              style={{ marginTop: 16 }}
              gradientColors={['#168A53', '#0D523B']}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  docCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  docContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docTitle: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  docStatus: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  uploadButton: {
    borderRadius: 24,
    height: 48,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F4F9F6',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  modalPrompt: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '500',
  },
  docOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  docOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderRadius: 10,
  },
  docOptionText: {
    fontSize: 11,
  },
  uploadDropZone: {
    borderWidth: 2,
    borderColor: '#0D523B',
    borderStyle: 'dashed',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneTitle: {
    color: '#0D523B',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  dropZoneSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
});
