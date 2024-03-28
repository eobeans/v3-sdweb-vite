<script lang="ts" setup>
import { ref } from "vue"
import { ElMessage } from "element-plus"
import { useDevice } from "@/hooks/useDevice"
import { useTranslate } from "./hooks/useTranslate"
import { usePrompt } from "./hooks/usePrompt"
import { useStableDiffusion } from "./hooks/useStableDiffusion"

// 百度翻译
const { promptStrZh, translatePrompt } = useTranslate()

// 提示词
const { promptStr, negativePromptStr, promptCombind, promptCombindOpts, generaterPromptStr, changePromptCombind } =
  usePrompt()

// stable-diffusion
const {
  txt2ImgParams,
  txt2ImgRemoteParams,
  checkpointModel,
  modelOpts,
  samplerOpts,
  vaeModel,
  vaeOpts,
  loraModel,
  loraStr,
  imgSrc,
  imgList,
  loraOpts,
  getRemoteTxt2Img,
  getTxt2Img,
  getSDOptions,
  getSDModelOpts,
  postSDModelOpts,
  getVaeOpts,
  getLoraOpts
} = useStableDiffusion()

getSDOptions()
getSDModelOpts()
getVaeOpts()
getLoraOpts()

// 更改提示词组合方式
const beforeChangePromptCombind = (val: string) => {
  changePromptCombind(val)
  translatePrompt(promptStr.value)
  if (loraStr.value) {
    promptStr.value += loraStr.value
    promptStrZh.value += loraStr.value
  }
}

// 生成提示词
const beforeGeneraterPromptStr = () => {
  generaterPromptStr()
  translatePrompt(promptStr.value)
  if (loraStr.value) {
    promptStr.value += loraStr.value
    promptStrZh.value += loraStr.value
  }
}
beforeGeneraterPromptStr()

const loading = ref(false)
const remoteType = ref("2")
const xApiKey = ref("b68ce212fa3d6bcf0ecfd78c0c05d003052b185bf78bbbcde96062001e439476")
// 点击开始文生图
const beforeGetTxt2Img = async () => {
  try {
    loading.value = true
    if (remoteType.value == "1") {
      txt2ImgRemoteParams.prompt = promptStr.value
      txt2ImgRemoteParams.negative_prompt = negativePromptStr.value
      await getRemoteTxt2Img(xApiKey.value)
    } else if (remoteType.value == "2") {
      txt2ImgParams.prompt = promptStr.value
      txt2ImgParams.negative_prompt = negativePromptStr.value
      await getTxt2Img()
    }
  } catch (err: any) {
    ElMessage.error(err)
  } finally {
    loading.value = false
  }
}

// 更改模型或者vae
const modelChange = async () => {
  try {
    loading.value = true
    const params = { sd_model_checkpoint: checkpointModel.value, sd_vae: vaeModel.value }
    const res = await postSDModelOpts(params)
    if (res.status == 200) {
      ElMessage.success("操作成功")
    }
  } finally {
    loading.value = false
  }
}

// 选择lora
const loraWeight = ref(1)
const selectLora = () => {
  const val = loraModel.value
  if (val.length !== 0) {
    // console.log(val) // <lora:RMSDXL_Creative:1>
    const rate = Math.floor((loraWeight.value / val.length) * 100) / 100
    loraStr.value = val
      .map((str) => {
        return `<lora:${str}:${rate}>`
      })
      .join(",")
  } else {
    loraStr.value = ""
  }
  const oldPrompt = promptStr.value
    .split(",")
    .filter((str) => {
      return str && !str.includes("<lora:")
    })
    .join(",")
  promptStr.value = oldPrompt
  promptStr.value += ","
  promptStr.value += loraStr.value
}

// 页面控制
const batch_number = ref(10)
const modeEnv = import.meta.env.VITE_NODE_ENV == "production" ? "2" : "1"
if (modeEnv == "2") {
  batch_number.value = 1
}

// 点击批量生成
const beforeBatchGetTxt2Img = async () => {
  for (let i = 0; i < batch_number.value; i++) {
    generaterPromptStr()
    if (loraStr.value) {
      promptStr.value += loraStr.value
      promptStrZh.value += loraStr.value
    }
    txt2ImgParams.steps = Math.floor(Math.random() * (50 - 25 + 1)) + 25 // 步长为 25 - 50
    txt2ImgParams.prompt = promptStr.value
    txt2ImgParams.negative_prompt = negativePromptStr.value
    await getTxt2Img()
  }
}

const reomteTypeChange = () => {
  loraModel.value = []
  loraStr.value = ""
  generaterPromptStr()
  translatePrompt(promptStr.value)
}

const { isMobile } = useDevice()
</script>

<template>
  <div v-loading="loading" class="app-container">
    <div :class="isMobile ? 'flex-col' : 'flex-row'">
      <div :style="isMobile ? 'width: 100%;' : 'width: 50%; margin-right: 40px;'">
        <div :class="isMobile ? 'flex-col justify-center' : 'flex-row'">
          <el-select
            v-model="remoteType"
            @change="reomteTypeChange"
            class="mg-10"
            style="width: 180px; margin-right: 10px"
          >
            <el-option label="远程API" value="1" />
            <el-option label="本地SD-API" value="2" />
          </el-select>
          <div class="mg-10"><el-button type="primary" @click="beforeGetTxt2Img">点击开始文生图</el-button></div>
          <div class="mg-10">
            <el-button type="primary" @click="beforeGeneraterPromptStr">生成正向提示词</el-button>
          </div>
          <div v-if="remoteType == '2'" class="mg-10">
            <el-button type="primary" @click="beforeBatchGetTxt2Img">批量生成</el-button>
          </div>
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
          <el-form label-width="auto" label-position="left">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="模型">
                  <el-select v-model="checkpointModel" @change="modelChange" placeholder="请选择模型">
                    <el-option v-for="op in modelOpts" :key="op.label" :label="op.label" :value="op.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="Vae">
                  <el-select v-model="vaeModel" @change="modelChange" placeholder="请选择Vae">
                    <el-option v-for="op in vaeOpts" :key="op.label" :label="op.label" :value="op.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="isMobile ? 24 : 12">
                <el-form-item label="Lora权重">
                  <el-input-number v-model="loraWeight" :min="0.01" :max="1" :stpe="0.01" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="Lora">
                  <el-select v-model="loraModel" @change="selectLora" multiple clearable placeholder="请选择Lora">
                    <el-option v-for="op in loraOpts" :key="op.label" :label="op.label" :value="op.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="isMobile ? 24 : 12">
                <el-form-item label="生产批次">
                  <el-input-number v-model="batch_number" :min="1" :max="modeEnv == '2' ? 10 : 10000" />
                </el-form-item>
              </el-col>
              <el-col :span="isMobile ? 24 : 12">
                <el-form-item label="数量/批次">
                  <el-input-number v-model="txt2ImgParams.batch_size" :min="1" :max="4" />
                </el-form-item>
              </el-col>
              <el-col :span="isMobile ? 24 : 12">
                <el-form-item label="采样器">
                  <el-select v-model="txt2ImgParams.sampler_index" placeholder="请选择采样器">
                    <el-option v-for="item in samplerOpts" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="isMobile ? 24 : 12">
                <el-form-item label="步长">
                  <el-input-number v-model="txt2ImgParams.steps" :min="20" :max="50" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
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
              </el-col>
              <el-col :span="24">
                <el-form-item label="提示词">
                  <el-input type="textarea" :rows="4" v-model="promptStr" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="提示词（中文）">
                  <div>{{ promptStrZh }}{{ loraStr ? "," + loraStr : null }}</div>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="反向提示词">
                  <el-input v-model="negativePromptStr" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
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
