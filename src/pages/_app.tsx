import type { AppProps } from "next/app";

import "../styles/globals.css";
import "../styles/style.css";
import "../styles/App.css";



// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-full">
      <Component {...pageProps} />
    </div>
  );
}
