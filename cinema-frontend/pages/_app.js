import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }) {
  return (
      <>
        <Navbar />
        <div className="container mt-4">
          <Component {...pageProps} />
        </div>
      </>
  );
}