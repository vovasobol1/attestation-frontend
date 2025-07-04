import logo from './logo.svg';
import './App.css';
import AttestationForm from "./pages/AttestationForm";
import {Route, Router, Routes} from "react-router-dom";
import SearchAttestation from "./pages/SearchAttestation";
import RequireAuth from "./components/RequireAuth";
import LoginPage from "./pages/LoginPage";
import EditAttestation from "./pages/EditAttestation";
import ResultPage from "./pages/ResultPage";
import {NotifierProvider} from "./components/Notifier";

function App() {
    return (
        <NotifierProvider>
            <div className="App">
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/"
                    element={
                        <RequireAuth>
                            <AttestationForm />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/search"
                    element={
                        <RequireAuth>
                            <SearchAttestation />
                        </RequireAuth>
                    }
                />
                <Route path="/edit" element={
                    <RequireAuth>
                        <EditAttestation />
                    </RequireAuth>
                } />
                <Route path="/result/:passport" element={<ResultPage />} />
                {/*<Route path="/uploud" element={<ResultPage />} />*/}
            </Routes>
        </div>
        </NotifierProvider>
    );
}

export default App;
