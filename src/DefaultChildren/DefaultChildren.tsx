import type React from 'react';
import type { ChildPropsType } from '../types';
import styles from './DefaultChildren.module.css';

const DefaultChildren = ({ children, containerRef }: ChildPropsType) => (
	<ul
		className={styles.main}
		ref={containerRef as React.RefObject<HTMLUListElement | null>}
	>
		{children}
	</ul>
);

export default DefaultChildren;
