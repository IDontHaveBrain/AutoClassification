import Box from '@mui/material/Box';

interface Props {
  children: React.ReactNode;
}

const BaseSearch = ({ children }: Props) => {
  return (
    <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
      {children}
    </Box>
  );
};

export default BaseSearch;
