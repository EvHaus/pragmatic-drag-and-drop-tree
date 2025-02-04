import type { PreviewPropsType } from 'pragmatic-drag-and-drop-tree';
import type { DataType } from '../../data/sample';
import styles from './SamplePreview.module.css';

const SamplePreview = ({ item }: PreviewPropsType<DataType>) => {
	return <div className={styles.main}>{item.id}</div>;
};

export default SamplePreview;
