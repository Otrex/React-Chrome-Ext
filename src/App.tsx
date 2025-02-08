import { useState } from "react";
import Popup from "./components/Popup";
import SuggestionPanel from "./components/SuggestionPannel";
import "./App.css";

function App() {
  const [text, setText] = useState("");

  return (
    <div className="container mx-auto p-4">
      <Popup />
      <textarea
        className="textarea textarea-bordered w-full my-4"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to analyze..."
      />
      <SuggestionPanel text={text} />
    </div>
  );
}

export default App;
