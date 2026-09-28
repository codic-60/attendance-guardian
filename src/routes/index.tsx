import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/attendance/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Attendance Planner | Stay Above 75%" },
      {
        name: "description",
        content:
          "Plan classes, simulate leave, and see how many classes you need to stay safe or reach 90% attendance.",
      },
      { property: "og:title", content: "Attendance Planner | Stay Above 75%" },
      {
        property: "og:description",
        content:
          "Plan classes, simulate leave, and see how many classes you need to stay safe or reach 90% attendance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Dashboard />;
}
