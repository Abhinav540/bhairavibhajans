import type { Metadata } from "next";
import AdminLogin from "./admin-login";

export const metadata: Metadata = {
  title: "Admin Login | Bhairavi Bhajans",
  description: "Secure access to the Bhairavi Bhajans admin panel.",
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}