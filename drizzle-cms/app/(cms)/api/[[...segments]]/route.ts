import { config } from "@/drizzle-cms.config";
import {
  DELETE_REQUEST,
  POST_REQUEST,
  PUT_REQUEST,
} from "@/package/drizzle-routes";

export async function GET(request: Request) {
  console.log(request);
  return Response.json({ message: "get" });
}

export const POST = POST_REQUEST(config);
export const PUT = PUT_REQUEST(config);
export const DELETE = DELETE_REQUEST(config);
