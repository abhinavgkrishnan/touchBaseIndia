import type { AppProps } from "next/app";
import "../styles/globals.css"; // Adjust the path as needed

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
