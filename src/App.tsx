import { useState } from "react";
import type { FormEvent } from "react";
import taroLogo from "./assets/taro.jpg";

function App() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = value.trim().toLowerCase();

    if (!cleaned) return;

    if (cleaned === "taro") {
      setResult("success");
    } else {
      setResult("error");
    }
  };

  return (
    <div className="container">
      <img src={taroLogo} className="taro" alt="Taro cat" />

      <form onSubmit={handleSubmit} className="input-row">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setResult(null);
          }}
          placeholder="Write the cat name (ENG)"
          className="text-input"
        />
        <button type="submit" className="hidden-submit" />
      </form>

      {result === "success" && (
        <div className="alert success">
          ✅ Correct! TARO detected 🐾
        </div>
      )}

      {result === "error" && (
        <div className="alert error">
          ❌ Wrong — try again 😼
        </div>
      )}
    </div>
  );
}

export default App;
