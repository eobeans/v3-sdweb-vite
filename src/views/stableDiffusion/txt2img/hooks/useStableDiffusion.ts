import { ref, reactive } from "vue"
import axios from "axios"
import { type Txt2ImgRequestData, type SDModelList } from "@/api/stable-diffusion/types/txt2img"
import { getSDAuth } from "@/utils/cache/local-storage"
import { ElMessage } from "element-plus"

export function useStableDiffusion() {
  const txt2ImgParams: Txt2ImgRequestData = reactive({
    width: "512",
    height: "768",
    steps: 32,
    n_iter: 1,
    batch_size: 1,
    sampler_index: "Euler",
    prompt: "",
    negative_prompt: "nsfw"
  })
  const txt2ImgRemoteParams: Txt2ImgRequestData = reactive({
    width: "512",
    height: "768",
    steps: 32,
    prompt: "",
    negative_prompt: "nsfw",
    model_id: "midjourney"
  })
  const imgSrc = ref("")
  const imgList = ref([])
  const loading = ref(false)

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
      "Access-Control-Allow-Headers":
        "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range"
    }
  })

  // 本地文生图
  const getTxt2Img = async () => {
    try {
      const res2: any = await localSdInstance.post("sdapi/v1/txt2img", txt2ImgParams)
      if (res2.status == 200) {
        imgList.value = res2.data.images.map((item: string) => {
          const base64 = `data:image/jpeg;base64,${item}`
          downloadImg(base64)
          return base64
        })
        imgSrc.value = `data:image/jpeg;base64,${res2.data.images[0]}`
      }
    } catch (err: any) {
      ElMessage.error(err)
    } finally {
      loading.value = false
    }
  }

  // 远程文生图
  const getRemoteTxt2Img = async (token: string) => {
    const remoteSdInstance = axios.create({
      baseURL: "https://api.midjourneyapi.xyz/",
      headers: {
        "X-API-KEY": token,
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

  // 获取当前全局配置-如：当前模型列表等
  const checkpointModel = ref("")
  const getSDOptions = async () => {
    const res: any = await localSdInstance.get("sdapi/v1/options")
    checkpointModel.value = res.data.sd_model_checkpoint
  }

  // 获取模型列表
  const modelOpts = ref<SDModelList[]>([])
  const getSDModelOpts = async () => {
    const res = await localSdInstance.get("sdapi/v1/sd-models")
    modelOpts.value = res.data
  }

  // 更改当前全局配置
  const postSDModelOpts = async (params: any) => {
    const res = await localSdInstance.post("sdapi/v1/options", params)
    return res
  }

  return {
    localSdInstance,
    txt2ImgParams,
    txt2ImgRemoteParams,
    checkpointModel,
    modelOpts,
    imgSrc,
    imgList,
    getRemoteTxt2Img,
    getTxt2Img,
    downloadImg,
    getSDOptions,
    getSDModelOpts,
    postSDModelOpts
  }
}
