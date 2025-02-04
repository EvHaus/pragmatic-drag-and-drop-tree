import styles from './App.module.css';
import WithContainerScroll from './variants/with-container-scroll';
import WithDragHandles from './variants/with-drag-handles';
import WithGhostIndicator from './variants/with-ghost-indicator';

const App = () => {
	return (
		<div className={styles.main}>
			<div className={styles.variant}>
				<h2>With Container Scroll</h2>
				<WithContainerScroll />
			</div>
			<div className={styles.variant}>
				<h2>With Drag Handles</h2>
				<WithDragHandles />
			</div>
			<div className={styles.variant}>
				<h2>With Ghost Indicator</h2>
				<WithGhostIndicator />
			</div>
		</div>
	);
};

export default App;
