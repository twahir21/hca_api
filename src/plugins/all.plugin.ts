import Elysia from "elysia";
import { bulkSMSPlugin } from "../main/messages/sms.plugin";
import { schoolsPlugin } from "../main/schools/schools.plugin";
import { linksPlugin } from "../main/links/links.plugin";
import prometheusPlugin from 'elysia-prometheus'
import { LoginPlugin } from "../main/login/login.plugin";
import { sendEmailPlugin } from "../email/send.email";
import { main } from "./global.plugin";
import { ClassPlugin } from "../main/classes/class.plugin";
import { SubjectPlugin } from "../main/subject/subject.plugin";
// import { TeachersPlugin } from "../main/teachers/teachers.plugin";
// import { botPlugin } from "./bot/bot";
// import { groqPlugin } from "./bot/qrok";


export const AllPlugins = new Elysia({ name: "All mini API "})
	// .onBeforeHandle(() => {
	// })
    // .onAfterResponse(() => {
		// metrics 
    //     console.log("[THIS RUNS]")
    // })
	.use(
		prometheusPlugin({
			metricsPath: '/metrics',
			staticLabels: { service: 'school-api' },
			dynamicLabels: {
				userAgent: (ctx) =>
					ctx.request.headers.get('user-agent') ?? 'unknown'
			}
		})
	)
	.use(LoginPlugin)
    .use(bulkSMSPlugin)
	.use(ClassPlugin)
	.use(SubjectPlugin)
	// .use(TeachersPlugin)
	.use(main)
	// .use(botPlugin)
	// .use(groqPlugin)
	.use(schoolsPlugin)
	.use(linksPlugin)
	.use(sendEmailPlugin)
