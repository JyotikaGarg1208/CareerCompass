import cron from "node-cron";
import { sendInterviewReminder } from "./utils/email";
import prisma from "@/prisma/schema.prisma"; // Or your DB instance
import { addDays, isAfter, isBefore } from "date-fns";

// Run every day at 7am
cron.schedule("0 7 * * *", async () => {
  console.log("Running interview reminder job...");
  const now = new Date();
  const tomorrow = addDays(now, 1);

  // Get jobs with interviews in next 24h
  const jobs = await prisma.jobApp.findMany({
    where: {
      status: "Interview",
      interviewDate: {
        gte: now,
        lt: tomorrow,
      },
    },
    include: { user: true }, // get user email
  });

  for (const job of jobs) {
    if (job.user?.email) {
      await sendInterviewReminder(
        job.user.email,
        job.position,
        job.company,
        job.interviewDate
      );
    }
  }
});
