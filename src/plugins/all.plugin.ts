import Elysia from "elysia";
import { bulkSMSPlugin } from "../main/messages/sms.plugin";
// import prometheusPlugin from 'elysia-prometheus'
import { LoginPlugin } from "../main/login/login.plugin";
import { main } from "./global.plugin";
import { ClassPlugin } from "../main/classes/class.plugin";
import { SubjectPlugin } from "../main/subject/subject.plugin";
import { TeachersPlugin } from "../main/teachers/teachers.plugin";

export const AllPlugins = new Elysia({ name: "All mini API "})
	// .use(
	// 	prometheusPlugin({
	// 		metricsPath: '/metrics',
	// 		staticLabels: { service: 'my-app' },
	// 		dynamicLabels: {
	// 			userAgent: (ctx) =>
	// 				ctx.request.headers.get('user-agent') ?? 'unknown'
	// 		}
	// 	})
	// )
	.use(LoginPlugin)
    .use(bulkSMSPlugin)
	.use(ClassPlugin)
	.use(SubjectPlugin)
	.use(TeachersPlugin)
	.use(main)
