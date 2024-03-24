import ExpandComp from "component/ExpandComp";
import LabelledImageCard from "component/imgs/LabelledImageCard";
import {FileModel} from "model/GlobalModel";

interface Props {
    files: FileModel[];
}

const LabelledImages = ({files}: Props) => {
    const groupByLabel = (files) => {
        return files.reduce((groups, file) => {
            const label = file.label || 'none';
            if (!groups[label]) {
                groups[label] = [];
            }
            groups[label].push(file);
            return groups;
        }, {});
    };

    const filesByLabel = groupByLabel(files);

    return (
        <ExpandComp title="Labelled Images">
            {Object.entries(filesByLabel).map(([label, files]) => (
                <LabelledImageCard
                    key={label}
                    label={label}
                    images={Object.values(files)}
                />
            ))}
        </ExpandComp>
    );
};

export default LabelledImages;