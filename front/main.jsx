class App extends React.Component {
  
    render() {
        return (
            <div className="app">
                Hello chat app
            </div>
        )
    }
}

const domContainer = document.getElementById('root');
ReactDOM.render(<App/>, domContainer);
  