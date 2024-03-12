import { IconButton, TextField, Grid } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { FC } from "react";

interface ClassifyItemsProps {
  classifyItems: string[];
  setClassifyItems: any;
}

const ClassifyItems = ({ classifyItems, setClassifyItems }:ClassifyItemsProps) => {
  const handleAdd = () => {
    setClassifyItems((prevItems: string[]) => [...prevItems, '']);
  };

  const handleRemove = (index: number) => {
    setClassifyItems((prevItems: string[]) => prevItems.filter((item, i) => i !== index));
  };

  return (
    <Grid container direction="row" spacing={2}>
      {classifyItems.map((item, index) => (
        <Grid item key={index}>
          <TextField
            value={item}
            onChange={event => {
              const newValue = event.target.value;
              setClassifyItems((prevItems: string[]) => prevItems.map((item, i) => i === index ? newValue : item));
            }}
          />
          <IconButton onClick={() => handleRemove(index)}>
            <RemoveCircleOutlineIcon />
          </IconButton>
        </Grid>
      ))}
      <IconButton onClick={handleAdd}>
        <AddCircleOutlineIcon />
      </IconButton>
    </Grid>
  );
};

export default ClassifyItems;