import { createFromReadableStream } from "@hiogawa/vite-rsc/ssr";
// @ts-ignore
import * as ReactDomServer from "react-dom/server.edge";
import { RSCStaticRouter, routeRSCServerRequest } from "react-router";
import bootstrapScriptContent from "virtual:vite-rsc/bootstrap-script-content";

export default async function handler(
  request: Request,
  callServer: (request: Request) => Promise<Response>,
) {
  return routeRSCServerRequest({
    request,
    callServer,
    decode: (body) => createFromReadableStream(body),
    renderHTML(getPayload) {
      return ReactDomServer.renderToReadableStream(
        <RSCStaticRouter getPayload={getPayload} />,
        {
          bootstrapScriptContent,
        },
      );
    },
  });
}
