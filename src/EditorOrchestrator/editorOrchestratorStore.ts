import { useMarkwhenStore } from "@/Markwhen/markwhenStore";
import { defineStore } from "pinia";
import {
  type Event,
  type DateFormat,
  type DateRange,
  type DateRangeIso,
  type Timeline,
  toDateRange,
  
} from "@markwhen/parser/lib/Types";
import { ref } from "vue";
import {
  dateRangeToString,
  type DisplayScale,
} from "@/Markwhen/utilities/dateTimeUtilities";
import { useEventMapStore } from "@/Markwhen/eventMapStore";
import { isEventNode } from "@markwhen/parser/lib/Noder";
import type {
  EventPath,
} from "@/Views/ViewOrchestrator/useStateSerializer";
import { todayRange, type EventCreationParams } from "@/NewEvent/newEventStore";
import { set } from "@vueuse/core";

export const useEditorOrchestratorStore = defineStore(
  "editorOrchestrator",
  () => {
    const markwhenStore = useMarkwhenStore();
    const eventMapStore = useEventMapStore();

    const editable = ref(true);
    const showTagFilterButtons = ref(true);
    const hoveringEventPath = ref<EventPath>();
    const choosingColor = ref(false);

    const setText = (text: string, range?: { from: number; to: number }) => {
      markwhenStore.setRawTimelineString(text, range);
    };

    const addPage = () => {
      console.log("addPage here in editorOrchestratorStore.ts might be problematic!");
      setText(markwhenStore.rawTimelineString);
    };

    const movePages = (from: number, to: number) => {
      console.log("movePages here in editorOrchestratorStore.ts might be problematic!");
      setText(markwhenStore.rawTimelineString);
    };

    const setPageTimelineString = (newString: string) => {
      const pageMetadata = markwhenStore.pageTimeline.metadata;
      const currentTimelineString = markwhenStore.rawTimelineString;
      const pre = currentTimelineString.substring(
        0,
        pageMetadata.startStringIndex
      );
      const post = currentTimelineString.substring(pageMetadata.endStringIndex);
      const newTimelineString = pre + newString + post;

      setText(newTimelineString);
    };

    const deletePage = (index: number) => {
      console.log("deletePage here in editorOrchestratorStore.ts might be problematic!");
      setText(markwhenStore.rawTimelineString);
    };

    const editEventDateRange = (
      event: Event,
      range: DateRangeIso,
      scale: DisplayScale,
      preferredInterpolationFormat: DateFormat | undefined
    ) => {
      if (equivalentRanges(toDateRange(event.value.dateRangeIso), range)) {
        return;
      }
      const timelineString = markwhenStore.rawTimelineString;

      const inTextFrom = event.value.dateRangeInText.from;
      const inTextTo = event.value.dateRangeInText.to;
      const pre = timelineString.slice(0, inTextFrom);
      const post = timelineString.slice(inTextTo);

      const newString =
        pre +
        `${dateRangeToString(toDateRange(range), scale, preferredInterpolationFormat)}` +
        post;

      setText(newString);
    };

    const clearHoveringEvent = () => {
      hoveringEventPath.value = undefined;
    };

    const setHoveringEventPath = (path: EventPath) => {
      hoveringEventPath.value = eventMapStore.getAllPaths(path);
    };

    const setHoveringEvent = (e: Event | number) => {
      hoveringEventPath.value = eventMapStore.getAllPaths(e);
    };

    const setChoosingColor = (choosing: boolean) => {
      choosingColor.value = choosing;
    };

    const newEventInsertionIndex = () =>
      markwhenStore.pageTimeline.metadata.endStringIndex;

    const newEventString = (params: EventCreationParams) =>
      `${params.range || dateRangeToString(todayRange(), "day", undefined)}: ${
        params.title || "Event"
      }${params.description ? "\n" + params.description : ""}`;

    const createEvent = (params: EventCreationParams) => {
      if (typeof params.range !== "string") {
        throw new Error("Range must be preconverted to string at this point");
      }
      const index = newEventInsertionIndex();
      const es = markwhenStore.rawTimelineString;
      const newString =
        es.slice(0, index) +
        `\n${
          params.range || dateRangeToString(todayRange(), "day", undefined)
        }: ${params.title || "Event"}${
          params.description ? "\n" + params.description : ""
        }\n` +
        es.slice(index);
      setText(newString);
    };

    const createEventFromRange = (
      range: DateRange | undefined,
      scale: DisplayScale,
      preferredInterpolationFormat?: DateFormat | undefined
    ) => {
      if (!range) {
        return;
      }
      const dateRangeString = dateRangeToString(
        range,
        scale,
        preferredInterpolationFormat
      );
      // events-reference
      const index = newEventInsertionIndex();
      const es = markwhenStore.rawTimelineString;
      const newString =
        es.slice(0, index) + `\n${dateRangeString}: Event\n` + es.slice(index);

      setText(newString);
    };

    const showInEditor = (e: Event | EventPath) => {};

    return {
      // state
      editable,
      showTagFilterButtons,
      hoveringEventPath,
      choosingColor,

      // actions
      addPage,
      movePages,
      deletePage,
      editEventDateRange,
      setHoveringEvent,
      clearHoveringEvent,
      createEventFromRange,
      setChoosingColor,
      setPageTimelineString,
      showInEditor,
      setHoveringEventPath,
      createEvent,
      setText,
      newEventString,
    };
  }
);

const equivalentRanges = (r1: DateRange, r2: DateRange) =>
  +r1.fromDateTime === +r2.fromDateTime && +r1.toDateTime === +r2.toDateTime;

// const editorTransformer = (
//   timelineString: string,
//   method: EditMethod,
//   timelines: Timeline[],
//   arg?: any
// ): string => {
//   switch (method) {
//     case ADD_PAGE:
//       return addPage(timelineString, timelines);
//     case MOVE_PAGES:
//       return movePages(timelineString, timelines, arg.from, arg.to);
//     case DELETE_PAGE:
//       return DELETE_PAGE(timelineString, timelines, arg);
//   }
//   return "";
// };

export const newOrder = (order: number[], from: number, to: number) => {
  if (from > to) {
    order.splice(from, 1);
    order.splice(to, 0, from);
  } else {
    order.splice(to + 1, 0, from);
    order.splice(from, 1);
  }
  return order;
};
