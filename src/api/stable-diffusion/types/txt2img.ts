export interface Txt2ImgRequestData {
  // 宽度
  width: number | string
  // 高度
  height: number | string
  // 步数
  steps?: number
  // 批次
  n_iter?: number
  // 数量/批
  batch_size?: number
  // 采样器
  sampler_index?: string
  // 正向提示词
  prompt: string
  // 反向提示词
  negative_prompt: string
  // 模型ID
  model_id?: string
}

export interface Txt2ImgRemoteResponseData {
  generationTime: number
  id: number
  meta: any
  output: any
  status: string
}

export interface SDModelList {
  title: string
  model_name?: string
  hash?: string
  sha256?: string
  filename?: string
  config?: string
}

export interface promptCombindOpts {
  label: string
  value: string
}

export type Txt2ImgResponseData = ApiResponseData<string>
