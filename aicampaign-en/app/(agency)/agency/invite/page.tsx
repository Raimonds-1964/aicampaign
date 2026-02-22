import { Suspense } from "react";
import InviteClient from "./InviteClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InviteClient />
    </Suspense>
  );
}
