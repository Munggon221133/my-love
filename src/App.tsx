import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import taroLogo from "./assets/taro.jpg";

function App() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = value.trim().toLowerCase();
    if (!cleaned) return;

    if (cleaned === "taro") {
      setResult("success");
      setCount(3);
    } else {
      setResult("error");
      setCount(null);
    }
  };

  // countdown + redirect
  useEffect(() => {
    if (result !== "success" || count === null) return;

    if (count === 0) {
      navigate("/gallery");
      return;
    }

    const timer = setTimeout(() => setCount((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [result, count, navigate]);

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
            setCount(null);
          }}
          placeholder="Write the cat name (ENG)"
          className="text-input"
        />
        <button type="submit" className="hidden-submit" />
      </form>

      {result === "success" && (
        <div className="alert success">
          ✅ Correct! 🐾 <strong>{count}</strong>...
        </div>
      )}

      {result === "error" && (
        <div className="alert error">❌ Wrong — try again 😼</div>
      )}
    </div>
  );
}

export default App;
