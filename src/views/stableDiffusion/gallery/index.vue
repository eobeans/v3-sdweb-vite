<script lang="ts" setup>
import { ref } from "vue"
import { useDevice } from "@/hooks/useDevice"
import { useImgDB } from "../imgDB/hooks/useImgDB"

const { isMobile } = useDevice()
const { getImgNameList } = useImgDB()

const loading = ref(false)
const imgList = ref<string[]>([])
const showImgList = ref<string[]>([])
const getImgList = async () => {
  loading.value = true
  imgList.value = await getImgNameList()
  showImgList.value = imgList.value.slice(0, 20)
  loading.value = false
}
getImgList()

const pageSize = ref(20)
const page = ref(1)
const contentRef = ref()
const searchMore = () => {
  const content = contentRef.value
  if (content.scrollHeight - content.clientHeight - content.scrollTop < 200) {
    page.value++
    if (page.value * pageSize.value > imgList.value.length) {
      showImgList.value = imgList.value.slice(0, imgList.value.length)
    } else {
      showImgList.value = imgList.value.slice(0, page.value * pageSize.value)
    }
  }
}
</script>

<template>
  <div class="app-container" v-loading="loading" ref="contentRef" @scroll="searchMore" style="overflow-y: scroll">
    <div v-if="!isMobile">
      <el-row :gutter="10">
        <el-col v-for="(name, index) in showImgList" :key="index" :span="6">
          <div style="width: auto; height: 200px; background-color: aqua; margin: 10px">
            {{ name }}
            <!-- <el-image
              :src="`http://eobeans/top/${name}`"
              fit="fill" lazy
              :preview-src-list="[`http://eobeans/top/${name}`]"
            /> -->
          </div></el-col
        >
      </el-row>
      <el-row>
        <el-col :span="24">
          <div class="scroll-footer">~~总要有个底线吧~~</div>
        </el-col>
      </el-row>
    </div>
    <div v-else>
      <div
        v-for="(name, index) in showImgList"
        :key="index"
        style="width: auto; height: 200px; background-color: aqua; margin: 10px"
      >
        {{ name }}
        <!-- <el-image :src="`http://eobeans/top/${name}`" fit="fill" lazy :preview-src-list="[`http://eobeans/top/${name}`]" /> -->
      </div>
      <div class="scroll-footer">~~总要有个底线吧~~</div>
    </div>
  </div>
</template>

<style scoped>
.scroll-footer {
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #8a919f;
}
</style>
