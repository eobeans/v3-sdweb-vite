import axios from "axios"
import { ElMessage } from "element-plus"

interface imgListData {
  filename: string
  score: number
  username: string
}

interface addImgScoreData {
  filename: string
  score: number
  username: string
}

export function useImgDB() {
  // 接口服务
  const imgDBInstance = axios.create({
    baseURL: "/imageDB",
    timeout: 10000,
    headers: {
      "Access-Control-Allow-Origin": "*", // "http://localhost:3333",
      "Access-Control-Allow-Methods": "GET, POST",
      "Access-Control-Allow-Headers":
        "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range"
    }
  })

  // 获取图片列表
  const getImgNameList = async () => {
    try {
      const res: any = await imgDBInstance.get("api/imgServer/list")
      if (res.status == 200) {
        return res.data.data.map((item: imgListData) => {
          return item.filename
        })
      }
    } catch (err: any) {
      ElMessage.error(err)
    }
  }

  // 新增图片分数
  const addImgScore = async (formData: addImgScoreData) => {
    try {
      const res: any = await imgDBInstance.post("api/imgServer/newAdd", formData)
      if (res.status == 200) {
        return res.data
      }
    } catch (err: any) {
      ElMessage.error(err)
    }
  }

  // 计算平均分
  const averageScore = async () => {
    try {
      const res: any = await imgDBInstance.post("api/imgServer/average")
      if (res.status == 200) {
        return res.data
      }
    } catch (err: any) {
      ElMessage.error(err)
    }
  }
  return {
    getImgNameList,
    addImgScore,
    averageScore
  }
}
