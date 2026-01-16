/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import { siteConfig } from "@acme/config";
import { createFileRoute } from "@tanstack/react-router";
import { Resend } from "resend";
import { env } from "~/lib/env/server";

let resend: Resend | undefined;
if (env.RESEND_API_KEY) {
  resend = new Resend(env.RESEND_API_KEY);
}

export const Route = createFileRoute("/api/contact/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (resend === undefined) {
          console.warn("resend api key is not configured, skipping email");
          return new Response(
            "resend api key is not configured, skipping email",
            { status: 200 }
          );
        }

        if (!(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL)) {
          return Response.json(
            { error: "Email service is not configured" },
            { status: 500 }
          );
        }

        const body = (await request.json()) as {
          email?: string;
          message?: string;
        };
        const { email, message } = body;

        if (!(message && email)) {
          return Response.json(
            { error: "Missing required fields" },
            { status: 400 }
          );
        }

        try {
          // biome-ignore lint/suspicious/noExtraNonNullAssertion: <resend config 현재 없어도 돌아갈 수 있도록 처리>
          const { data, error } = await resend!!.emails.send({
            from: env.RESEND_FROM_EMAIL as string,
            replyTo: email,
            to: [siteConfig.links.mail],
            subject: "Contact Message",
            text: message,
          });

          if (error) {
            return Response.json({ error }, { status: 500 });
          }

          return Response.json(data);
        } catch (error) {
          return Response.json({ error }, { status: 500 });
        }
      },
    },
  },
});
