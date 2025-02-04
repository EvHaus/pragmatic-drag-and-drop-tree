import type { DataType, PreviewPropsType } from 'pragmatic-drag-and-drop-tree';
import styles from './SamplePreview.module.css';

const SamplePreview = ({ item }: PreviewPropsType<DataType>) => {
	return <div className={styles.main}>{item.id}</div>;
};

export default SamplePreview;
