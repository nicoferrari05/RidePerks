import AdminShell from "@/components/platform/AdminShell";
import LoadingBlocks from "@/components/platform/LoadingBlocks";
// Same frame as the page, so the dock stays put while the screen loads.
export default function Loading() {
  return (
    <AdminShell>
      <LoadingBlocks />
    </AdminShell>
  );
}
