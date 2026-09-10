import AboutPage from "@/components/about-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Bhairavi Bhajans",
  description: "Learn about the journey, musicians, and devotional music of Bhairavi Bhajans.",
};

export default function Page() {
  return <AboutPage />;
}
