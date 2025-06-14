import "dotenv/config";
import cron from "node-cron";
import { addDays } from "date-fns";
import prisma from "./prisma";
import { sendInterviewReminder } from "./utils/email";

// Runs every day at 7:00 AM (server time)
cron.schedule("0 7 * * *", async () => {
  try {
    console.log("[CRON] Interview Reminder job started...");
    const now = new Date();
    const tomorrow = addDays(now, 1);

    // Get jobs with interviews scheduled in the next 24h
    const jobs = await prisma.jobApplication.findMany({
      where: {
        status: "Interview",
        interviewDate: {
          gte: now,
          lt: tomorrow,
        },
      },
      include: {
        user: true,
      },
    });

    for (const job of jobs) {
      const userEmail = job.user?.email;
      if (userEmail && job.interviewDate) {
        await sendInterviewReminder(
          userEmail,
          job.position,
          job.company,
          job.interviewDate.toISOString().slice(0, 10)
        );
        console.log(
          `[CRON] Sent interview reminder to ${userEmail} for ${job.position} @ ${job.company} (${job.interviewDate})`
        );
      }
    }
    console.log(`[CRON] Finished! Total reminders sent: ${jobs.length}`);
  } catch (err) {
    console.error("[CRON] Error sending interview reminders:", err);
  }
});
