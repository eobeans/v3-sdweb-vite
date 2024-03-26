/** 统一处理 Cookie */

import CacheKey from "@/constants/cache-key"
import Cookies from "js-cookie"

export const getToken = () => {
  return Cookies.get(CacheKey.TOKEN)
}
export const setToken = (token: string) => {
  Cookies.set(CacheKey.TOKEN, token)
}
export const removeToken = () => {
  Cookies.remove(CacheKey.TOKEN)
}

export const getXApiKey = () => {
  return Cookies.get(CacheKey.XAPIKEY)
}
export const setXApiKey = (xApiKey: string) => {
  Cookies.set(CacheKey.XAPIKEY, xApiKey)
}
export const removeXApiKey = () => {
  Cookies.remove(CacheKey.XAPIKEY)
}
