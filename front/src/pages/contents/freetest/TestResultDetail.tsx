import {DialogActions, DialogContent, DialogTitle} from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import LabelledImageCard from "component/imgs/LabelledImageCard";


interface Props {
    data: any;
    handleClose: () => void;
}

const TestResultDetail = ({data, handleClose}: Props) => {
    const result = data?.resultJson ? JSON.parse(data.resultJson) : null;
    const images = data?.testFiles;

    return (
        <>
            <DialogTitle>{`${data?.id} - ${data?.classes}`}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {result?.map((item) => (
                        <LabelledImageCard key={item.label}
                            label={item.label}
                            images={item.ids.map((id) => images.find((img) => img.id === id))}
                        />
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