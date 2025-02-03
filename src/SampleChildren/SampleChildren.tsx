import type React from 'react';
import type { ChildPropsType } from '../types';
import styles from './SampleChildren.module.css';

const SampleChildren = ({ children, containerRef }: ChildPropsType) => (
	<ul
		className={styles.main}
		ref={containerRef as React.RefObject<HTMLUListElement>}
	>
		{children}
	</ul>
);

export default SampleChildren;
