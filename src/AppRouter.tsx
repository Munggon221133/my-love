import { Routes, Route } from "react-router-dom";
import App from "./App";
import Gallery from "./pages/Gallery/Gallery";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/gallery" element={<Gallery />} />
        </Routes>
    );
}
