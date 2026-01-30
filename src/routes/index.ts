import { Hono } from "hono";
import v1Routes from "@/routes/v1Routes";

const apiRoutes = new Hono();

apiRoutes.route("/v1", v1Routes);

export default apiRoutes;
