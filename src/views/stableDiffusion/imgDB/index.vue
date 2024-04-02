<script lang="ts" setup>
import { ref, reactive } from "vue"
import axios from "axios"
import { useImgDB } from "./hooks/useImgDB"
import { useDevice } from "@/hooks/useDevice"
import { getSDAuth } from "@/utils/cache/local-storage"

const { isMobile } = useDevice()
const { getImgNameList, addImgScore } = useImgDB()

const imagesInstance = axios.create({
  baseURL: "/images",
  timeout: 30000,
  responseType: "blob",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST",
    "Access-Control-Allow-Headers": "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range"
  }
})

const index = ref(0)
const imgList = ref<string[]>([])
const imgSrc = ref("")
const loading = ref(false)
const getImg = async () => {
  try {
    loading.value = true
    window.URL.revokeObjectURL(imgSrc.value)
    const res: any = await imagesInstance.get(imgList.value[index.value])
    imgSrc.value = window.URL.createObjectURL(res.data)
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

const getImgList = async () => {
  imgList.value = await getImgNameList()
  console.log("length", imgList.value.length)
  getImg()
}
getImgList()

const sdAuth: LoginRequestData = getSDAuth()
const scoreData = reactive({
  username: sdAuth.username,
  filename: "",
  score: 0
})
const addScore = async () => {
  scoreData.filename = imgList.value[index.value]
  await addImgScore(scoreData)
  index.value++
  scoreData.score = 0
  getImg()
}
</script>

<template>
  <div class="app-container" v-loading="loading">
    <!-- <div class="m-10">
      <el-button type="primary" @click="getImg">获取图片</el-button>
    </div> -->
    <div :class="isMobile ? 'flex flex-col' : 'flex flex-row'">
      <div class="m-4" style="width: auto">
        <el-image :src="imgSrc" fit="fill" :preview-src-list="[imgSrc]" />
      </div>
      <div class="m-4">
        <el-form>
          <el-form-item label="图片索引">
            <el-slider v-model="index" @change="getImg" show-input :step="1" :min="0" :max="imgList.length" />
          </el-form-item>
          <el-form-item label="评分">
            <el-rate v-model="scoreData.score" @change="addScore" />
          </el-form-item>
        </el-form>
        <div class="mt-4">输入评分会自动切换到下一张图片，可以切换索引更改图片开始索引</div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
