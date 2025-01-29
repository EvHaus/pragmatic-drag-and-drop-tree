import type { DataType, PreviewPropsType } from '../types';
import styles from './SamplePreview.module.css';

const SamplePreview = ({ item }: PreviewPropsType<DataType>) => {
	return <div className={styles.main}>{item.id}</div>;
};

export default SamplePreview;
