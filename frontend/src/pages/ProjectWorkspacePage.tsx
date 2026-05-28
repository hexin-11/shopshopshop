import Editor from "./OpenCutEditorPage";

export default function ProjectWorkspacePage({ navigate }: { navigate: (route: "projects" | "analytics" | "dashboard") => void }) {
  return <Editor />;
}
