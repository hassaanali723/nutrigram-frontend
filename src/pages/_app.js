import { AuthProvider } from '../contexts/AuthContext';
import { DailyLogProvider } from '../context/DailyLogContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <DailyLogProvider>
        <Component {...pageProps} />
      </DailyLogProvider>
    </AuthProvider>
  );
}

export default MyApp;