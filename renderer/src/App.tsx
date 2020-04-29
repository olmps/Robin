import React from 'react';
import SplitPane from 'react-split-pane'
import RequestsSidebar from './components/requests-sidebar/RequestsSidebar';
import './App.css'

const App = () => {
    return (
        <SplitPane split="vertical" minSize={300} defaultSize={500}>
            <RequestsSidebar />
            <div />
        </SplitPane>
    )
}

export default App