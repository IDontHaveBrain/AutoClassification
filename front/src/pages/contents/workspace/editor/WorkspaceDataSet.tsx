import ExpandComp from "component/ExpandComp";
import { useState } from "react";

interface Props {
    imgs: any;
    setState: any;
}

const WorkspaceDataSet = ({imgs, setState}: Props) => {
    return (
        <ExpandComp title="DataSet">
            {imgs.map((image, index) => (
                <img src={image.url} alt={image.fileName} key={index}
                     style={{maxWidth: '150px', maxHeight: '150px'}} />
            ))}
        </ExpandComp>
    );
};

export default WorkspaceDataSet;
