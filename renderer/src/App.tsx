import React from 'react';
import SplitPane from 'react-split-pane'
import RequestsSidebar from './components/RequestsSidebar';
import './App.css'

const App = () => {
    return (
        <SplitPane split="vertical" minSize={300} defaultSize={500}>
            <div className="RequestsPane"><RequestsSidebar /></div>
            <div />
        </SplitPane>
    )
}

export default App