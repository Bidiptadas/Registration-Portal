import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import Toast from './components/common/Toast';

import './styles/animations.css';
import './styles/scrollbar.css';

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
              <AppRoutes />
              <Toast />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
