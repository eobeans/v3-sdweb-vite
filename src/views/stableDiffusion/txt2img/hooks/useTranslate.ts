import { ref } from "vue"
import axios from "axios"
import CryptoJS from "crypto-js"

export function useTranslate() {
  const appid = "20240319001998640"
  const salt = "1024256"
  const key = "dr2tzlKTZ0nJVKx94irK"
  const promptStrZh = ref("")

  /** 翻译 */
  const translatePrompt = async (promptStr: string) => {
    const str1 = appid + promptStr + salt + key
    const sign = CryptoJS.MD5(str1).toString()
    axios
      .get("baidu/api/trans/vip/translate", {
        params: {
          q: promptStr,
          from: "en",
          to: "zh",
          appid: appid,
          salt: salt,
          sign: sign
        }
      })
      .then(function (res: any) {
        promptStrZh.value = res.data.trans_result[0].dst
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  return { promptStrZh, translatePrompt }
}
