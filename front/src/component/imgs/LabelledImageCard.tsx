import Grid from "@mui/material/Grid";
import ImageCard from "component/imgs/ImageCard";

interface LabelledImageCardProps {
    label: string;
    images: { id?: string; url: string; originalFileName?: string }[];
}

const LabelledImageCard = ({label, images}: LabelledImageCardProps) => {
    return (
        <Grid item xs={12} key={label}>
            <h2>{label}</h2>
            <Grid container spacing={2}>
                {images.map((image) => (
                    <ImageCard key={image.id} id={image.id} url={image.url} originalFileName={image.originalFileName} />
                ))}
            </Grid>
        </Grid>
    );
}

export default LabelledImageCard;