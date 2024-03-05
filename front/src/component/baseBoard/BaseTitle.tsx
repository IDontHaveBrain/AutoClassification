import { Card, CardActions, CardContent, CardHeader } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { ReactNode } from "react";

interface Props {
  title: string;
  content?: string;
  additionalInfo?: string;
  children?: ReactNode;
}

export const BaseTitle = ({ title, content, additionalInfo }: Props) => {
  return (
    <Typography fontSize={"1.5rem"} gutterBottom fontWeight={"bold"}>
      {title}
    </Typography>
  );
};

export default BaseTitle;
