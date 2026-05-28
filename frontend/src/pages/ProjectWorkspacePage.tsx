import { useState } from "react";
import { projects } from "../data/mockData";
import EditorHeader from "../components/editor/EditorHeader";
import EditorSidebar from "../components/editor/EditorSidebar";
import AssetsPanel from "../components/editor/AssetsPanel";
import PreviewPanel from "../components/editor/PreviewPanel";
import TimelinePanel from "../components/editor/TimelinePanel";
import PropertiesPanel from "../components/editor/PropertiesPanel";

export default function ProjectWorkspacePage({ navigate }: { navigate: (route: "projects" | "dashboard") => void }) {
  const projectId = window.location.pathname.split("/").pop() ?? "p-earphone";
  const project = projects.find((item) => item.id === projectId) ?? projects[0];
  const [activeTab, setActiveTab] = useState("media");

  return (
    <div className="flex h-screen w-full flex-col bg-[#F4F4F5] text-[#171719] font-sans overflow-hidden">
      <EditorHeader navigate={navigate} projectName={project.name} />
      
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <AssetsPanel />
        
        <div className="flex flex-1 flex-col overflow-hidden relative border-r border-[#E5E7EB]">
          <PreviewPanel />
          <TimelinePanel />
        </div>
        
        <PropertiesPanel />
      </div>
    </div>
  );
}
