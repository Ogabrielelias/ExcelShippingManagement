// LIBs
import { BrowserRouter, Routes, Route } from "react-router-dom";

// VIEWs
import Home from "../../pages/home";

export function Router() {
    return (
        <BrowserRouter >
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </BrowserRouter>
    );
}
