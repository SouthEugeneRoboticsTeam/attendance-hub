import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

const root = document.createElement('div');
root.setAttribute('class', 'root');
document.body.append(root);

const Root = () => (
    <AppContainer>
        <p>Hello, world!</p>
    </AppContainer>
);

render(<Root />, root);
