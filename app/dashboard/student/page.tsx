/* Reference-led rule: the running record makes evidence readable at a glance, keeps machine review provisional, and centres educator judgement. */
import { StudentRecordView } from "@/components/student-record-view";

export const metadata = { title: "Student Running Record" };

export default function StudentProfilePage() {
  return <StudentRecordView />;
}
