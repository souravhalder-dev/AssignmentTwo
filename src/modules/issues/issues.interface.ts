export interface typeIssue {
  title: string;
  description: string;
  type: "bug" | "feature_request";
  reporter_id: number;
  status?: "open" | "in_progress" | "resolved";
}
