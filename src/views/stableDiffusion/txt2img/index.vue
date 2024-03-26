<script lang="ts" setup>
import { ref, reactive } from "vue"
import { type Txt2ImgRequestData, type SDModelList } from "@/api/stable-diffusion/types/txt2img"
import { setXApiKey } from "@/utils/cache/cookies"
import axios from "axios"
import { ElMessage } from "element-plus"
import { getSDAuth } from "@/utils/cache/local-storage"
import { useDevice } from "@/hooks/useDevice"
import { useTranslate } from "./hooks/useTranslate"
import { usePrompt } from "./hooks/usePrompt"

const { isMobile } = useDevice()

const samplerOpts: any = reactive([
  { label: "Euler", value: "Euler" },
  { label: "DPM++ 2M Karras", value: "DPM++ 2M Karras" }
])

// 百度翻译
const { promptStrZh, translatePrompt } = useTranslate()

// 提示词
const { promptStr, promptCombind, promptCombindOpts, generaterPromptStr, changePromptCombind } = usePrompt()

// 更改提示词组合方式
const beforeChangePromptCombind = (val: string) => {
  changePromptCombind(val)
  translatePrompt(promptStr.value)
}

// 点击生成图片
const beforeGeneraterPromptStr = () => {
  generaterPromptStr()
  translatePrompt(promptStr.value)
}
beforeGeneraterPromptStr()

// 负面提示词
const negativePromptStr = ref("nsfw")

// SD接口服务
const sdAuth = getSDAuth()
const localSdInstance = axios.create({
  baseURL: "/localSd",
  timeout: 100000,
  auth: {
    username: sdAuth.username,
    password: sdAuth.password
  },
  headers: {
    "Access-Control-Allow-Origin": "*", // "http://localhost:3333",
    "Access-Control-Allow-Methods": "GET, POST",
    "Access-Control-Allow-Headers": "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range"
  }
})

/** 文生图请求参数 */
const txt2ImgRemoteParams: Txt2ImgRequestData = reactive({
  width: "512",
  height: "768",
  steps: 32,
  prompt: promptStr,
  negative_prompt: negativePromptStr,
  model_id: "midjourney"
})

const txt2ImgParams: Txt2ImgRequestData = reactive({
  width: "512",
  height: "768",
  steps: 32,
  n_iter: 1,
  batch_size: 1,
  sampler_index: "Euler",
  prompt: promptStr,
  negative_prompt: negativePromptStr
})

const remoteType = ref("2")
const imgSrc = ref("")
const imgUrl = ref("")
const imgList = ref([])
const loading = ref(false)
const xApiKey = ref("b68ce212fa3d6bcf0ecfd78c0c05d003052b185bf78bbbcde96062001e439476")
const getTxt2Img = async () => {
  try {
    loading.value = true
    if (remoteType.value == "1") {
      setXApiKey(xApiKey.value)
      const remoteSdInstance = axios.create({
        baseURL: "https://api.midjourneyapi.xyz/",
        headers: {
          "X-API-KEY": xApiKey.value,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST",
          "Access-Control-Allow-Headers":
            "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range"
        }
      })
      const res: any = await remoteSdInstance.post("sd/txt2img", txt2ImgRemoteParams)
      if (res.status == 200) {
        imgList.value = res.data.output
        imgSrc.value = res.data.output[0]
      } else {
        ElMessage.error(res.statusText)
      }
      console.log("goapi.ai", res)
    } else if (remoteType.value == "2") {
      if (imgUrl.value) {
        URL.revokeObjectURL(imgUrl.value)
      }
      const res2: any = await localSdInstance.post("sdapi/v1/txt2img", txt2ImgParams)
      if (res2.status == 200) {
        imgList.value = res2.data.images.map((item: string) => {
          const base64 = `data:image/jpeg;base64,${item}`
          downloadImg(base64)
          return base64
        })
        imgSrc.value = `data:image/jpeg;base64,${res2.data.images[0]}`
        const blob = new Blob([res2.data.images[0]], { type: "jpeg" })
        imgUrl.value = URL.createObjectURL(blob)
      }
    }
  } catch (err: any) {
    ElMessage.error(err)
  } finally {
    loading.value = false
  }
}

// 图片下载
const downloadImg = (base64: string) => {
  const now = new Date()
  const a = document.createElement("a")
  a.href = base64
  a.download = String(now.getTime())
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// 点击批量生成
const batch_number = ref(10)
const beforeBatchGetTxt2Img = async () => {
  for (let i = 0; i < batch_number.value; i++) {
    generaterPromptStr()
    // 步长为 25 - 50
    txt2ImgParams.steps = Math.floor(Math.random() * (50 - 25 + 1)) + 25
    await getTxt2Img()
  }
}

// 获取模型列表
const checkpointModel = ref("")
const getSDOptions = async () => {
  const res: any = await localSdInstance.get("sdapi/v1/options")
  checkpointModel.value = res.data.sd_model_checkpoint
}
getSDOptions()
const modelOpts = ref<SDModelList[]>([])
const getSDModelOpts = async () => {
  const res = await localSdInstance.get("sdapi/v1/sd-models")
  modelOpts.value = res.data
}
getSDModelOpts()

const modelChange = async (val: string) => {
  try {
    loading.value = true
    const params = { sd_model_checkpoint: val }
    const res = await localSdInstance.post("sdapi/v1/options", params)
    if (res.status == 200) {
      ElMessage.success("操作成功")
    }
  } finally {
    loading.value = false
  }
}

// 页面控制
const modeEnv = import.meta.env.VITE_NODE_ENV == "production" ? "2" : "1"
if (modeEnv == "2") {
  batch_number.value = 1
}
</script>

<template>
  <div v-loading="loading" class="app-container">
    <div :class="isMobile ? 'flex-col' : 'flex-row'">
      <div :style="isMobile ? 'width: 100%;' : 'width: 50%; margin-right: 40px;'">
        <div :class="isMobile ? 'flex-col justify-center' : 'flex-row'">
          <el-select v-model="remoteType" class="mg-10" style="width: 180px; margin-right: 10px">
            <el-option label="远程API" value="1" />
            <el-option label="本地SD-API" value="2" />
          </el-select>
          <div class="mg-10"><el-button type="primary" @click="getTxt2Img">点击开始文生图</el-button></div>
          <div class="mg-10">
            <el-button type="primary" @click="beforeGeneraterPromptStr">生成正向提示词</el-button>
          </div>
          <div v-if="remoteType == '2'" class="mg-10">
            <el-button type="primary" @click="beforeBatchGetTxt2Img">批量生成</el-button>
          </div>
          <!-- <el-button type="primary" @click="loginSD">测试登入SD</el-button> -->
        </div>
        <div v-if="remoteType == '1'" class="mg-20">
          <el-form>
            <el-form-item label="x-api-key">
              <el-input v-model="xApiKey" />
            </el-form-item>
            <el-form-item label="steps（步长）">
              <el-input v-model="txt2ImgRemoteParams.steps" />
            </el-form-item>
            <el-form-item label="提示词组合">
              <el-select v-model="promptCombind" @change="beforeChangePromptCombind" aceholder="请选择提示词组合">
                <el-option
                  v-for="item in promptCombindOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="提示词">
              <el-input type="textarea" :rows="4" v-model="promptStr" />
            </el-form-item>
            <el-form-item label="提示词（中文）">
              <div>{{ promptStrZh }}</div>
            </el-form-item>
            <el-form-item label="反向提示词">
              <el-input v-model="negativePromptStr" />
            </el-form-item>
          </el-form>
        </div>
        <div v-if="remoteType == '2'" class="mg-20">
          <el-form label-width="140px" label-position="left">
            <el-form-item label="模型">
              <el-select v-model="checkpointModel" @change="modelChange" placeholder="请选择模型">
                <el-option v-for="item in modelOpts" :key="item.title" :label="item.title" :value="item.title" />
              </el-select>
            </el-form-item>
            <el-form-item label="生产批次">
              <el-input-number v-model="batch_number" :min="1" :max="modeEnv == '2' ? 10 : 10000" />
            </el-form-item>
            <el-form-item label="采样器">
              <el-select v-model="txt2ImgParams.sampler_index" style="width: 220px" placeholder="请选择采样器">
                <el-option v-for="item in samplerOpts" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="数量/批次">
              <el-input-number v-model="txt2ImgParams.batch_size" :min="1" :max="4" />
            </el-form-item>
            <el-form-item label="步长">
              <el-input-number v-model="txt2ImgParams.steps" :min="20" :max="50" />
            </el-form-item>
            <el-form-item label="提示词组合">
              <el-select v-model="promptCombind" @change="beforeChangePromptCombind" aceholder="请选择提示词组合">
                <el-option
                  v-for="item in promptCombindOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="提示词">
              <el-input type="textarea" :rows="4" v-model="promptStr" />
            </el-form-item>
            <el-form-item label="提示词（中文）">
              <div>{{ promptStrZh }}</div>
            </el-form-item>
            <el-form-item label="反向提示词">
              <el-input v-model="negativePromptStr" />
            </el-form-item>
          </el-form>
        </div>
        <div v-if="remoteType == '1'" class="mg-20">图片地址：</div>
        <div class="mg-20">
          <div>{{ remoteType == "1" ? imgSrc : imgUrl }}</div>
        </div>
      </div>
      <div>
        <div class="flex-col justify-center">
          <el-image style="width: 512px; height: 768px" :src="imgSrc" fit="fill" :preview-src-list="imgList" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mg-10 {
  margin: 10px;
}

.mg-20 {
  margin: 20px;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.justify-center {
  justify-content: center;
}
</style>
