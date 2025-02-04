import styles from './App.module.css';
import WithDragHandles from './variants/with-drag-handles';
import WithGhostIndicator from './variants/with-ghost-indicator';
import WithLineIndicator from './variants/with-line-indicator';

const App = () => {
	return (
		<div className={styles.main}>
			<div className={styles.variant}>
				<h2>With Drag Handles</h2>
				<WithDragHandles />
			</div>
			<div className={styles.variant}>
				<h2>With Ghost Indicator</h2>
				<WithGhostIndicator />
			</div>
			<div className={styles.variant}>
				<h2>With Line Indicator</h2>
				<WithLineIndicator />
			</div>
		</div>
	);
};

export default App;
