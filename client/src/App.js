import logo from './logo.svg';
import './App.css';
import { Fib } from './Fib';

function App() {
  return (
    <div className="App">
      <header className="App-header"></header>
      <h1>Fib Calculator</h1>
      <Fib />
      <a href="/">Home</a>
      <a href="/otherpage">Other Page</a>
    </div>
  );
}

export default App;
