import { UnauthorizedException } from "@nestjs/common";
import { type IncomingHttpHeaders } from "node:http";
import { auth } from "../auth.js";

export type RequestHeaders = {
  headers: IncomingHttpHeaders;
};

function toHeaders(request: RequestHeaders) {
  const headers = new Headers();

  for (const [name, value] of Object.entries(request.headers)) {
    if (value) {
      headers.set(name, Array.isArray(value) ? value.join(", ") : value);
    }
  }

  return headers;
}

export async function getRequiredSession(request: RequestHeaders) {
  const session = await auth.api.getSession({
    headers: toHeaders(request),
  });

  if (!session) {
    throw new UnauthorizedException();
  }

  return session;
}
