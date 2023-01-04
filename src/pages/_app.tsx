import type { AppProps } from 'next/app';

import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-full">
      <Component {...pageProps} />
    </div>
  );
}
