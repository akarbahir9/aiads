import React from 'react';
import AppRouter from './router';
import { Toaster } from 'sonner';
import { AuthProvider } from './hooks/useAuth';

function App() {
    return (
        <AuthProvider>
            <AppRouter />
            <Toaster position="bottom-right" richColors theme="dark" />
        </AuthProvider>
    );
}

export default App;
