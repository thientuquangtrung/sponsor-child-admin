import { Toaster } from 'sonner';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';

import UploadTracker from './components/common/UploadTracker';
import { ThemeProvider } from './contexts/ThemeContext';
import Router from './routes';
import { store } from './redux/store';
import { SocketProvider } from './contexts/SocketContext';

export default function App() {
    return (
        <ReduxProvider store={store}>
            <ThemeProvider>
                <SocketProvider>
                    <BrowserRouter>
                        <Router />
                        <Toaster richColors />
                        <UploadTracker />
                    </BrowserRouter>
                </SocketProvider>
            </ThemeProvider>
        </ReduxProvider>
    );
}
