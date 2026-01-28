import { defineNuxtPlugin } from "#app";
import VChart from "vue-echarts";

// ECharts core (tree-shaking) + required pieces
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

import { BarChart, LineChart, PieChart } from "echarts/charts";

import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  TitleComponent,
  TransformComponent
} from "echarts/components";

import { UniversalTransition } from "echarts/features";

export default defineNuxtPlugin((nuxtApp) => {
  // Register ECharts modules (THIS fixes: "Renderer 'undefined' is not imported")
  use([
    CanvasRenderer,

    // charts we use (bar now; line/pie kept for upcoming metrics)
    BarChart,
    LineChart,
    PieChart,

    // components
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DatasetComponent,
    TitleComponent,
    TransformComponent,

    // morph / transitions
    UniversalTransition
  ]);

  // Register vue-echarts component globally
  nuxtApp.vueApp.component("VChart", VChart);
});