<template>
  <div class="app-container center">
    <div ref="chartDom" style="width: 600px; height: 400px;"></div>
    <div ref="barChartDom" style="width: 600px; height: 400px;"></div>
  </div>
</template>

<style lang="scss" scoped>
.center {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<script setup>
import * as echarts from 'echarts'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const chartDom = ref(null)
const barChartDom = ref(null)
let chartInstance = null
let barChartInstance = null

onMounted(async () => {
  await nextTick();
  chartInstance = echarts.init(chartDom.value);
  const option = {
    title: { text: '港湾北市场未交租金数' },
    tooltip: {},
    xAxis: { data: ["3月9日", "4月9日", "5月9日", "6月9日", "7月9日"] },
    yAxis: {},
    series: [
      { name: '未交租金', type: 'line', data: [107268, 2412207, 45983, 85144, 88639] }
    ]
  };
  chartInstance.setOption(option);

  barChartInstance = echarts.init(barChartDom.value)
  const barOption = {
    title: { text: '港湾北市场未交档主数' },
    tooltip: {},
    xAxis: { data: ["3月9日", "4月9日", "5月9日", "6月9日", "7月9日"] },
    yAxis: {},
    series: [
      { name: '未交档主数', type: 'line', data: [9, 68, 9, 11, 11] }
    ]
  };
  barChartInstance.setOption(barOption);

});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>
