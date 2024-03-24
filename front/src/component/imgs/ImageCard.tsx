import {Card, CardMedia} from "@mui/material";
import Grid from "@mui/material/Grid";

interface ImageCardProps {
    id?: string;
    url: string;
    originalFileName?: string;
}

const ImageCard = ({id, url, originalFileName}: ImageCardProps) => {
    return (
        <Grid item xs={3} key={id}>
            <Card>
                <CardMedia
                    component="img"
                    height="140"
                    image={url}
                    alt={originalFileName}
                />
            </Card>
        </Grid>
    );
}

export default ImageCard;