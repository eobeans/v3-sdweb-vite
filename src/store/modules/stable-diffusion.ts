import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { type SdLoginRequestData } from "@/api/stable-diffusion/types/txt2img"
import { setSDAuth, removeSDAuth } from "@/utils/cache/local-storage"

export const useStableDiffusionStore = defineStore("stable-diffusion", () => {
  const username = ref<string>("")
  const password = ref<string>("")
  /** 登录 */
  const login = async (loginData: SdLoginRequestData) => {
    username.value = loginData.username
    password.value = loginData.password
    setSDAuth(loginData)
  }

  /** 登出 */
  const logout = () => {
    username.value = ""
    password.value = ""
    removeSDAuth()
  }

  return { username, password, login, logout }
})

/** 在 setup 外使用 */
export function useStableDiffusionStoreHook() {
  return useStableDiffusionStore(store)
}
