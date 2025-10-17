import Elysia from "elysia";
import { bulkSMSPlugin } from "../main/messages/sms.plugin";
import prometheusPlugin from 'elysia-prometheus'
import { LoginPlugin } from "../main/login/login.plugin";

export const AllPlugins = new Elysia({ name: "All mini API "})
	.use(
		prometheusPlugin({
			metricsPath: '/metrics',
			staticLabels: { service: 'my-app' },
			dynamicLabels: {
				userAgent: (ctx) =>
					ctx.request.headers.get('user-agent') ?? 'unknown'
			}
		})
	)
	.use(LoginPlugin)
    .use(bulkSMSPlugin)
