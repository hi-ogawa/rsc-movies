import "./styles.css";
import {
  Outlet,
  ScrollRestoration,
  type unstable_MiddlewareFunction as MiddlewareFunction,
} from "react-router";
import { Header } from "./components/header.tsx";
import { Favorites } from "./components/favorites-bar.tsx";
import { sessionMiddleware } from "./session.ts";
import { dataMiddleware } from "./db.ts";
import { GlobalNavigationLoadingBar } from "./root.client.tsx";
import { ServerHmr } from "@hiogawa/vite-rsc-react-router/client";

export const unstable_middleware: MiddlewareFunction<Response>[] = [
  sessionMiddleware,
  dataMiddleware,
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        {/* TODO: HMR breaks font stylesheet. For now, we add the same in app/styles.css */}
        <link
          href="https://fonts.googleapis.com/css2?family=Boldonse&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif&display=swap"
          rel="stylesheet"
        />
        <title>RSC Movies</title>
      </head>
      <body className="font-instrumentSans pb-56">
        <Header />
        {children}
        <Favorites />
        <ScrollRestoration />
        <GlobalNavigationLoadingBar />
        <ServerHmr />
      </body>
    </html>
  );
}

export default function ServerComponent() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return <h1>Oooops</h1>;
}
