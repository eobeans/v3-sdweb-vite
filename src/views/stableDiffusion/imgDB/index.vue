<script lang="ts" setup>
import { ref } from "vue"
import axios from "axios"

const imagesInstance = axios.create({
  baseURL: "/images",
  timeout: 5000,
  responseType: "blob",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST",
    "Access-Control-Allow-Headers": "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range"
  }
})

const imgSrc = ref("")
const getImg = async () => {
  window.URL.revokeObjectURL(imgSrc.value)
  // const res: any = await imagesInstance.get("1711018453159.jfif")
  const res: any = await imagesInstance.get("")
  imgSrc.value = window.URL.createObjectURL(res.data)
}
</script>

<template>
  <div class="app-container">
    <div class="m-10">
      <el-button type="primary" @click="getImg">获取图片</el-button>
    </div>

    <div>
      <el-image style="width: 512px; height: 768px" :src="imgSrc" fit="fill" />
    </div>
  </div>
</template>

<style scoped></style>
