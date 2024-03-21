import {Card, CardMedia, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";


interface Props {
    data: any;
    handleClose: () => void;
}

const TestResultDetail = ({data, handleClose}: Props) => {
    const result = JSON.parse(data.resultJson);
    const images = data.testFiles;

    return (
        <>
            <DialogTitle>{`${data.id} - ${data.classes}`}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {result.map((item) => (
                        <Grid item xs={12} key={item.label}>
                            <h2>{item.label}</h2>
                            <Grid container spacing={2}>
                                {item.ids.map((id) => {
                                    const image = images.find((img) => img.id === id);
                                    return (
                                        <Grid item xs={3} key={id}>
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={image.url}
                                                    alt={image.originalFileName}
                                                />
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} autoFocus>
                    닫기
                </Button>
            </DialogActions>
        </>
    );
}

export default TestResultDetail;