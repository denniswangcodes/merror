import { useState, useEffect } from 'react';
import './App.css';

function App() {

  const [initMsg, setInitMsg] = useState(null);
  const [todos, setTodos] = useState([]);

  // useEffect(() => {
  //   fetch("/home")
  //     .then((res) => res.json())
  //     .then((data) => setInitMsg(data.message));
  // }, []);

  return (
    <div className="App">
      {/* <header className="App-header">
        <p>{!initMsg ? "Loading..." : initMsg}</p>
      </header> */}

      Functional React Todo List <br></br>
      <input type="text" />
      <button> Add Todo </button> <br></br>
      <button> Clear Complete </button>
      <button> Clear List</button>

    </div>
  );
}

export default App;
