import logo from './logo.svg';
import './App.css';
import { Fib } from './Fib';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Fib />
        <a href="/">Home</a>
        <a href="/otherpage">Other Page</a>
      </header>
    </div>
  );
}

export default App;
