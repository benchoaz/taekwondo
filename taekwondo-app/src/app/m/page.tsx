import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function MobileRoot() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  if (token) {
    redirect("/m/dashboard");
  } else {
    redirect("/m/login");
  }
}
