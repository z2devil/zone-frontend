import React from 'react';
import styles from './style.module.scss';

const Separator = React.memo(() => <div className={styles.separator} />);

Separator.displayName = 'Separator';

export default Separator;
