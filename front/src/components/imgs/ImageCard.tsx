import { useEffect,useState } from 'react';
import { useTranslation } from 'react-i18next';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { Box,Card, CardMedia, CircularProgress, IconButton, SvgIcon,Typography  } from '@mui/material';

interface ImageCardProps {
    url: string;
    originalFileName?: string;
    onClick: () => void;
    size?: 'tiny' | 'small' | 'medium' | 'large';
}

const ImageCard = ({ url, originalFileName, onClick, size = 'medium' }: ImageCardProps) => {
    const { t } = useTranslation('common');
    const cardStyle = {
        margin: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
    };
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            setLoading(false);
            setImageLoaded(true);
        };
        img.onerror = () => {
            setLoading(false);
            setError(t('imageLoadFailed'));
        };
    }, [url, t]);

    const sizeStyles = {
        tiny: { height: '80px' },
        small: { height: '120px' },
        medium: { height: '180px' },
        large: { height: '240px' },
    };

    return (
        <Card sx={{ ...sizeStyles[size], ...cardStyle }}>
            <Box sx={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading && <CircularProgress />}
                {error && <Typography color="error">{error}</Typography>}
                {imageLoaded && (
                    <CardMedia
                        component="img"
                        image={url}
                        alt={originalFileName || 'Image'}
                        sx={{
                            objectFit: 'contain',
                            maxHeight: '100%',
                            maxWidth: '100%',
                            cursor: 'pointer',
                        }}
                        onClick={onClick}
                    />
                )}
                <IconButton
                    onClick={onClick}
                    sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                    }}
                    aria-label={t('zoomIn', { fileName: originalFileName || t('image') })}
                >
                    <SvgIcon component={ZoomInIcon} fontSize="small" />
                </IconButton>
            </Box>
        </Card>
    );
};

export default ImageCard;
