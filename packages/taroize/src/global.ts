export const usedComponents = new Set<string>()

export const errors: string[] = []

export const globals = {
  hasCatchTrue: false
}

export const resetGlobals = () => {
  globals.hasCatchTrue = false
  // tslint:disable-next-line: no-use-before-declare
  THIRD_PARTY_COMPONENTS.clear()
}

interface IError {
  msg: string | null, // 错误
  time?: number, // 修改所需时间
  msgDetail?: string // 修改建议
}

const logs = new Map<string, Array<IError>>()
export const logCollector = (url: string, msg: string, time = 1, msgDetail?: string) => {
  if (logs.has(url)) {
    const _errors: Array<IError> = logs.get(url) || []
    _errors.push({
      msg: msg,
      time: time,
      msgDetail: msgDetail
    })
    logs.set(url, _errors)
  } else {
    logs.set(url, [{
      msg: msg,
      time: time,
      msgDetail: msgDetail
    }])
  }
}

export const getCollector = (url: string) => {
  return logs.get(url)
}

export const resetLogCollector = () => {
  logs.clear()
}

export const THIRD_PARTY_COMPONENTS = new Set<string>()
