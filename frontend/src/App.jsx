import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddPatient from './pages/AddPatient';
import MedCards from "./pages/MedCards.jsx";
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/head" element={<HomePage />} />
                <Route path="/medcards" element={<MedCards />} />
                <Route path="/add" element={<AddPatient />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;