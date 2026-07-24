export function statusLabel(status: string): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "IN_REVIEW":
      return "In Review";
    case "APPROVED":
      return "Approved";
    case "CHANGES_REQUESTED":
      return "Changes Requested";
    default:
      return status;
  }
}

export function statusClasses(status: string): string {
  switch (status) {
    case "APPROVED":
      return "bg-ok-soft text-ok";
    case "IN_REVIEW":
      return "bg-warn-soft text-warn";
    case "CHANGES_REQUESTED":
      return "bg-bad-soft text-bad";
    default:
      return "bg-draft-soft text-draft";
  }
}
