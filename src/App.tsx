import { BrowserRouter, Routes, Route } from "react-router-dom";

import Composer from "./pages/Composer/Composer";
import Puzzle from "./pages/Puzzle/Puzzle";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<p>No routes</p>} />
        <Route path="/puzzle/:id?" element={<Puzzle />} />
        <Route path="/composer" element={<Composer />} />
      </Routes>
    </BrowserRouter>
  );
}
