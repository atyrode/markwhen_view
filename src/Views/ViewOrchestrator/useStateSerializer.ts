import { computed, ref, toRaw, watchEffect } from "vue";
import type { NodeArray, Node } from "@markwhen/parser/lib/Node";
import type { Timeline } from "@markwhen/parser/lib/Types";
import { useAppStore } from "@/App/appStore";
import { useMarkwhenStore } from "@/Markwhen/markwhenStore";
import { useTransformStore } from "@/Markwhen/transformStore";
import { useEditorOrchestratorStore } from "@/EditorOrchestrator/editorOrchestratorStore";
import { useEventDetailStore } from "@/EventDetail/eventDetailStore";
import { useAppSettingsStore } from "@/AppSettings/appSettingsStore";
import { useRoute } from "vue-router";

export type EventPath = number[];

export interface AppState {
  isDark?: boolean;
  timelineSettings?: boolean;
  hoveringPath?: EventPath;
  detailPath?: EventPath;
  path?: string;
  colorMap: Record<string, Record<string, string>>;
}
export interface MarkwhenState {
  rawText?: string;
  parsed?: Timeline[];
  transformed?: Node<NodeArray>;
}

export const equivalentPaths = (p1?: EventPath, p2?: EventPath): boolean => {
  if (!p1 || !p2) {
    return false;
  }
  const path1 = p1;
  const path2 = p2;

  return (
    path1.length > 0 &&
    path2.length > 0 &&
    path1.length === path2.length &&
    path1.every((pathValue, index) => path2[index] === pathValue)
  );
};

export const useStateSerializer = () => {
  const appSettingsStore = useAppSettingsStore();
  const markwhenStore = useMarkwhenStore();
  const transformStore = useTransformStore();
  const editorOrchestrator = useEditorOrchestratorStore();
  const eventDetailStore = useEventDetailStore();
  const route = useRoute()

  const colorMap = computed(() => {
    return { "default": markwhenStore.timelines[markwhenStore.pageIndex].tags}
  });

  const appState = computed<AppState>(() => ({
    isDark: appSettingsStore.inferredDarkMode,
    timelineSettings: appSettingsStore.timelineSettings,
    hoveringPath: toRaw(editorOrchestrator.hoveringEventPath) || undefined,
    detailPath: toRaw(eventDetailStore.detailEventPath),
    path: route.path,
    colorMap: colorMap.value,
  }));

  const markwhenState = computed<MarkwhenState>(() => ({
    rawText: markwhenStore.rawTimelineString,
    parsed: markwhenStore.timelines,
    transformed: transformStore.transformedEvents,
  }));
  
  return { appState, markwhenState }
};
