import { request } from "@/utils/service"
import type * as Txt2ImgType from "./types/txt2img"

/** 获取文生图接口 */
export function getTxt2ImgDataApi(data: Txt2ImgType.Txt2ImgRequestData) {
  return request<Txt2ImgType.Txt2ImgResponseData>({
    url: "sd/sdapi/v1/txt2img",
    method: "post",
    data: data
  })
}

/** 获取文生图接口 */
export function getTxt2ImgDataRemoteApi(data: Txt2ImgType.Txt2ImgRequestData) {
  return request<Txt2ImgType.Txt2ImgRemoteResponseData>({
    url: "remote/sd/txt2img",
    method: "post",
    data: data
  })
}
