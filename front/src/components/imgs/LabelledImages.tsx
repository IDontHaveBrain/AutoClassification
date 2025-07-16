import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box,Modal } from '@mui/material';
import { type FileModel } from 'model/GlobalModel';

import ExpandComp from 'components/ExpandComp';
import LabelledImageCard from 'components/imgs/LabelledImageCard';

interface Props {
    files: FileModel[];
}

const LabelledImages = ({ files }: Props) => {
    const { t } = useTranslation('common');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const groupByLabel = (files: FileModel[]) => {
        return files.reduce((groups, file) => {
            const label = file.label || t('noLabel');
            if (!groups[label]) {
                groups[label] = [];
            }
            groups[label].push(file);
            return groups;
        }, {} as Record<string, FileModel[]>);
    };

    const filesByLabel = groupByLabel(files);

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    return (
        <>
            <ExpandComp title={t('labelledImages')}>
                {Object.entries(filesByLabel).map(([label, files]) => (
                    <LabelledImageCard
                        key={label}
                        label={label}
                        images={files.map(file => ({
                            id: file.id.toString(),
                            url: file.url,
                            originalFileName: file.originalFileName,
                        }))}
                        onImageClick={handleImageClick}
                    />
                ))}
            </ExpandComp>
            <Modal
                open={!!selectedImage}
                onClose={handleCloseModal}
                aria-labelledby="image-modal"
                aria-describedby="image-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    maxWidth: '90%',
                    maxHeight: '90%',
                    overflow: 'auto',
                }}>
                    {selectedImage && (
                        <img src={selectedImage} alt={t('enlargedView')} style={{ width: '100%', height: 'auto' }} />
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default LabelledImages;
