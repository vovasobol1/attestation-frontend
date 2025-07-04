// components/RequireAuth.js
import { Navigate } from 'react-router-dom';

const RequireAuth = ({ children }) => {
    const isAuthed = localStorage.getItem('admin') === 'true';
    return isAuthed ? children : <Navigate to="/login" />;
};

export default RequireAuth;
