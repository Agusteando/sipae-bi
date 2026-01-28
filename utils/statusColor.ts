export function getStatusColor(item: {
  status: number | string;
  returned: number | null;
  destiempo: number | null;
  deadline: string;
}) {
  const status = String(item.status);
  const returned = Number(item.returned) === 1;
  const destiempo = Number(item.destiempo) === 1;

  const currentDate = new Date();
  const deadlineDate = new Date(item.deadline);

  if (status === "1" && !returned) return "#28a745";
  if (destiempo && !returned) return "#ffc107";
  if (status === "0" && currentDate > deadlineDate) return "#dc3545";
  if (returned) return "#fd7e14";
  if (currentDate <= deadlineDate && status === "0") return "#007bff";
  return "#6c757d";
}
