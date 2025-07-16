import { useTranslation } from 'react-i18next';
import GetAppIcon from '@mui/icons-material/GetApp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import ImageCard from 'components/imgs/ImageCard';

interface LabelledImageCardProps {
    label: string;
    images: { id?: string; url: string; originalFileName?: string }[];
    onImageClick: (_imageUrl: string) => void;
    imageSize?: 'tiny' | 'small' | 'medium' | 'large';
}

const LabelledImageCard = ({ label, images, onImageClick, imageSize = 'tiny' }: LabelledImageCardProps) => {
    const { t } = useTranslation('common');
    const downloadImages = () => {
        images.forEach(image => {
            const link = document.createElement('a');
            link.href = image.url;
            link.download = image.originalFileName || `${label}_image.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    const getGridSpacing = () => {
        switch (imageSize) {
            case 'tiny': return 1;
            case 'small': return 2;
            case 'medium': return 3;
            case 'large': return 4;
            default: return 2;
        }
    };

    const getGridItemSize = () => {
        switch (imageSize) {
            case 'tiny': return { xs: 4, sm: 3, md: 2, lg: 1 };
            case 'small': return { xs: 6, sm: 4, md: 3, lg: 2 };
            case 'medium': return { xs: 12, sm: 6, md: 4, lg: 3 };
            case 'large': return { xs: 12, sm: 12, md: 6, lg: 4 };
            default: return { xs: 6, sm: 4, md: 3, lg: 2 };
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                    <Typography variant="h6" color="primary">{label}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {t('totalImages', { count: images.length })}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<GetAppIcon />}
                    onClick={downloadImages}
                    size="small"
                    aria-label={t('downloadAllImages', { label })}
                >
                    {t('downloadAll')}
                </Button>
            </Box>
            <Grid
                container
                spacing={getGridSpacing()}
                role="list"
                aria-label={t('imagesFor', { label })}
            >
                {images.map((image) => (
                    <Grid
                        size={getGridItemSize()}
                        key={image.id}
                        role="listitem"
                    >
                        <ImageCard
                            url={image.url}
                            originalFileName={image.originalFileName}
                            onClick={() => onImageClick(image.url)}
                            size={imageSize}
                        />
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

export default LabelledImageCard;
