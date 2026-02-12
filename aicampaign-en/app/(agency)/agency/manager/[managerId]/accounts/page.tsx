import Client from "./Client";

export default async function Page() {
  // ✅ Client component reads managerId from route/search params itself
  return <Client />;
}
