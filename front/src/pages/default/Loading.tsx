import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export const Loading = () => {
  return (
      <Box
          sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              bgcolor: 'background.default',
              color: 'text.primary',
          }}
      >
          <Box
              sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  boxShadow: 3,
                  borderRadius: '10px',
              }}
          >
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                  Loading...
              </Typography>
          </Box>
      </Box>
  );
};
