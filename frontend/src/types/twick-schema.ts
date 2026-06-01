export interface TwickElement {
  id: string;
  trackId: string;
  name: string;
  type: string;
  s: number; // Start time in seconds
  e: number; // End time in seconds
  props: {
    text?: string;
    fill?: string;
    url?: string;
    x?: number;
    y?: number;
    scale?: number;
    opacity?: number;
    rotation?: number;
    [key: string]: any;
  };
}

export interface TwickTrack {
  id: string;
  name: string;
  type: string;
  elements: TwickElement[];
}

export interface TwickTimelineData {
  properties: {
    width: number;
    height: number;
    fps: number;
    background: {
      type: string;
      color?: string;
    };
  };
  tracks: TwickTrack[];
  version: number;
  metadata?: {
    chapters?: any[];
  };
}

/**
 * Converts internal TProject timeline state into Twick standard JSON representation
 */
export function convertProjectToTwickJSON(project: any): TwickTimelineData {
  const activeScene = project.scenes?.find((s: any) => s.id === project.currentSceneId) || project.scenes?.[0];
  const tracks: TwickTrack[] = [];

  if (activeScene) {
    const sceneTracks = activeScene.tracks;
    
    const mapElement = (el: any, trackId: string): TwickElement => {
      // Convert MediaTime (ticks / nanoseconds) to standard seconds
      const s = typeof el.startTime === 'number' ? el.startTime / 1000000000 : 0;
      const duration = typeof el.duration === 'number' ? el.duration / 1000000000 : 0;
      const e = s + duration;
      
      const props: any = {
        x: el.params?.position?.x ?? 0,
        y: el.params?.position?.y ?? 0,
        scale: el.params?.scale ?? 1,
        opacity: el.params?.opacity ?? 1,
        rotation: el.params?.rotation ?? 0,
      };

      let type = el.type;

      if (el.type === "text") {
        props.text = el.params?.content || el.text || el.name || "";
        props.fill = el.params?.color || el.params?.fill || "#FFFFFF";
      } else if (el.type === "video" || el.type === "image" || el.type === "audio") {
        props.url = el.url || "";
      } else if (el.type === "graphic") {
        if (el.definitionId === "rectangle") {
          type = "rect";
          props.fill = el.params?.fill || "#3b82f6";
          props.radius = el.params?.radius ?? 0;
          props.strokeColor = el.params?.strokeColor || "transparent";
          props.lineWidth = el.params?.lineWidth ?? 0;
        } else if (el.definitionId === "ellipse" || el.definitionId === "circle") {
          type = "circle";
          props.fill = el.params?.fill || "#10b981";
          props.strokeColor = el.params?.strokeColor || "transparent";
          props.lineWidth = el.params?.lineWidth ?? 0;
        } else {
          props.fill = el.params?.fill || "#3b82f6";
          props.strokeColor = el.params?.strokeColor || "transparent";
          props.lineWidth = el.params?.lineWidth ?? 0;
        }
      }

      return {
        id: el.id,
        trackId,
        name: el.name || el.id,
        type,
        s,
        e,
        props,
      };
    };

    // 1. Add main video track
    if (sceneTracks?.main) {
      tracks.push({
        id: sceneTracks.main.id,
        name: sceneTracks.main.name || "Main Video",
        type: "video",
        elements: (sceneTracks.main.elements || []).map((el: any) => mapElement(el, sceneTracks.main.id)),
      });
    }

    // 2. Add overlay tracks
    if (Array.isArray(sceneTracks?.overlay)) {
      sceneTracks.overlay.forEach((track: any) => {
        tracks.push({
          id: track.id,
          name: track.name || track.type,
          type: track.type,
          elements: (track.elements || []).map((el: any) => mapElement(el, track.id)),
        });
      });
    }

    // 3. Add audio tracks
    if (Array.isArray(sceneTracks?.audio)) {
      sceneTracks.audio.forEach((track: any) => {
        tracks.push({
          id: track.id,
          name: track.name || "Audio",
          type: "audio",
          elements: (track.elements || []).map((el: any) => mapElement(el, track.id)),
        });
      });
    }
  }

  const fpsVal = project.settings?.fps;
  const numericFps = typeof fpsVal === 'object' && fpsVal !== null
    ? (fpsVal.numerator / fpsVal.denominator)
    : (typeof fpsVal === 'number' ? fpsVal : 30);

  const sortedChapters = [...(project.metadata?.chapters || [])].sort((a, b) => a.time - b.time);

  return {
    properties: {
      width: project.settings?.canvasSize?.width ?? 1280,
      height: project.settings?.canvasSize?.height ?? 720,
      fps: numericFps,
      background: {
        type: project.settings?.background?.type ?? "color",
        color: project.settings?.background?.color ?? "#000000",
      },
    },
    tracks,
    version: 6,
    metadata: {
      chapters: sortedChapters,
    },
  };
}
