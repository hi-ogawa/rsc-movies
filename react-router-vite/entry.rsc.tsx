import {
  decodeAction,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@hiogawa/vite-rsc/rsc";
import {
  unstable_DecodeCallServerFunction as DecodeCallServerFunction,
  unstable_DecodeFormActionFunction as DecodeFormActionFunction,
  unstable_matchRSCServerRequest as matchRSCServerRequest,
} from "react-router/rsc";

// @ts-ignore
import routes from "../app/routes?react-router-routes";

const decodeCallServer: DecodeCallServerFunction = async (actionId, reply) => {
  const args = await decodeReply(reply);
  const action = await loadServerAction(actionId);
  return action.bind(null, ...args);
};

const decodeFormAction: DecodeFormActionFunction = async (formData) => {
  return await decodeAction(formData);
};

async function callServer(request: Request) {
  return await matchRSCServerRequest({
    decodeCallServer,
    decodeFormAction,
    request,
    routes,
    generateResponse(match) {
      return new Response(renderToReadableStream(match.payload), {
        status: match.statusCode,
        headers: match.headers,
      });
    },
  });
}

export default async function handler(requrest: Request) {
  const ssr = await import.meta.viteRsc.loadSsrModule<
    typeof import("./entry.ssr")
  >("index");
  return ssr.default(requrest, callServer);
}
