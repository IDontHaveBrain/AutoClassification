import {Box, Button, Typography} from "@mui/material";
import {Link} from "react-router-dom";

export const NotFound = () => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            textAlign="center"
        >
            <Typography variant="h2" gutterBottom>
                404 - Not Found
            </Typography>
            <Typography variant="subtitle1">
                Sorry, the page you are looking for does not exist.
            </Typography>
            <Button sx={{ mt: 3 }} variant="contained" color="primary" component={Link} to="/">
                Go to Home Page
            </Button>
        </Box>
    );
};