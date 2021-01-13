import * as path from 'path'
import * as fs from 'fs-extra'
import * as t from 'babel-types'

import {
  printLog,
  promoteRelativePath,
  resolveScriptPath,
  processTypeEnum,
  REG_SCRIPT,
  REG_TYPESCRIPT
} from '@tarojs/helper'

function getRelativePath (
  rootPath: string,
  sourceFilePath: string,
  oriPath: string
) {
  // 处理以/开头的绝对路径，比如 /a/b
  if (path.isAbsolute(oriPath)) {
    if (oriPath.indexOf('/') !== 0) {
      return ''
    }
    const vpath = path.resolve(rootPath, oriPath.substr(1))
    if (!fs.existsSync(vpath)) {
      return ''
    }
    let relativePath = path.relative(path.dirname(sourceFilePath), vpath)
    relativePath = promoteRelativePath(relativePath)
    if (relativePath.indexOf('.') !== 0) {
      return './' + relativePath
    }
    return relativePath
  }
  // 处理非正常路径，比如 a/b
  if (oriPath.indexOf('.') !== 0) {
    const vpath = path.resolve(sourceFilePath, '..', oriPath)
    if (fs.existsSync(vpath)) {
      return './' + oriPath
    }
  }
  return oriPath
}

export function analyzeImportUrl (
  rootPath: string,
  sourceFilePath: string,
  scriptFiles: Set<string>,
  source: t.StringLiteral,
  value: string
) {
  const valueExtname = path.extname(value)
  const rpath = getRelativePath(rootPath, sourceFilePath, value)
  if (!rpath) {
    printLog(processTypeEnum.ERROR, '引用文件', `文件 ${sourceFilePath} 中引用 ${value} 不存在！`)
    return
  }
  if (rpath !== value) {
    value = rpath
    source.value = rpath
  }
  if (value.indexOf('.') === 0) {
    if (REG_SCRIPT.test(valueExtname) || REG_TYPESCRIPT.test(valueExtname)) {
      const vpath = path.resolve(sourceFilePath, '..', value)
      let fPath = value
      if (fs.existsSync(vpath)) {
        fPath = vpath
      } else {
        printLog(processTypeEnum.ERROR, '引用文件', `文件 ${sourceFilePath} 中引用 ${value} 不存在！`)
      }
      scriptFiles.add(fPath)
    } else {
      let vpath = resolveScriptPath(path.resolve(sourceFilePath, '..', value))
      if (vpath) {
        if (!fs.existsSync(vpath)) {
          printLog(processTypeEnum.ERROR, '引用文件', `文件 ${sourceFilePath} 中引用 ${value} 不存在！`)
        } else {
          if (fs.lstatSync(vpath).isDirectory()) {
            if (fs.existsSync(path.join(vpath, 'index.js'))) {
              vpath = path.join(vpath, 'index.js')
            } else {
              printLog(processTypeEnum.ERROR, '引用目录', `文件 ${sourceFilePath} 中引用了目录 ${value}！`)
              return
            }
          }
          let relativePath = path.relative(sourceFilePath, vpath)
          const relativePathExtname = path.extname(relativePath)
          scriptFiles.add(vpath)
          relativePath = promoteRelativePath(relativePath)
          if (/\.wxs/.test(relativePathExtname)) {
            relativePath += '.js'
          } else {
            relativePath = relativePath.replace(relativePathExtname, '.js')
          }
          source.value = relativePath
        }
      }
    }
  }
}

export const incrementId = () => {
  let n = 0
  return () => (n++).toString()
}

export const bannedFeature = {
  app: [{
    name: 'onError',
    message: '不支持使用 App 的 onError 方法',
    recoverTime: 60,
    tips: '请使用 React 的 Error Boundaries(https://reactjs.org/docs/error-boundaries.html)'
  }, {
    name: 'onPageNotFound',
    message: '不支持使用 App 的 onPageNotFound 方法'
  }, {
    name: 'onUnhandledRejection',
    message: '不支持使用 App 的 onUnhandledRejection 方法'
  }, {
    name: 'onThemeChange',
    message: '不支持使用 App 的 onThemeChange 方法'
  }],
  page: [{
    name: 'selectComponent',
    message: '不支持使用 Page 的 selectComponent 方法',
    recoverTime: 20,
    tips: '请使用 React 的 ref(https://reactjs.org/docs/refs-and-the-dom.html)'
  }, {
    name: 'selectAllComponents',
    message: '不支持使用 Page 的 selectAllComponents 方法',
    recoverTime: 20,
    tips: '请使用 React 的 ref(https://reactjs.org/docs/refs-and-the-dom.html)'
  }, {
    name: 'selectOwnerComponent',
    message: '不支持使用 Page 的 selectOwnerComponent 方法',
    recoverTime: 20,
    tips: '请使用 React 的 ref(https://reactjs.org/docs/refs-and-the-dom.html)'
  }, {
    name: 'groupSetData',
    message: '不支持使用 Page 的 groupSetData 方法'
  }],
  component: [{
    name: 'moved',
    message: '不支持使用 Component 的 moved 方法'
  }, {
    name: 'externalClasses',
    message: '不支持使用 Component 的 externalClasses 方法',
    recoverTime: 30,
    tips: 'Taro 3 不存在自定义组件，建议规范类名或使用 CSS Module 代替'
  }, {
    name: 'relations',
    message: '不支持使用 Component 的 relations 方法'
  }, {
    name: 'options',
    message: '不支持使用 Component 的 options 方法'
  }, {
    name: 'definitionFilter',
    message: '不支持使用 Component 的 definitionFilter 方法'
  }],
  baseClass: {
    message: '装饰器 withWeapp 的参数是空对象',
    recoverTime: 10,
    tips: '请检查是否使用了基类去构造 Page 或 Component，这种情况需要手动处理：https://taro-docs.jd.com/taro/docs/taroize-troubleshooting#1-%E6%B2%A1%E6%9C%89%E5%A4%84%E7%90%86%E5%9F%BA%E7%B1%BB'
  },
  uselessConstructor: {
    message: '请不要调用 Page 或 Component 构造器',
    recoverTime: 10,
    tips: '请检查是否使用了基类去构造 Page 或 Component，这种情况需要手动处理：https://taro-docs.jd.com/taro/docs/taroize-troubleshooting#1-%E6%B2%A1%E6%9C%89%E5%A4%84%E7%90%86%E5%9F%BA%E7%B1%BB'
  },
  esWithCommonjs: {
    message: '请不要混用 ES Modules 和 CommonJS',
    recoverTime: 10,
    tips: '详情请见：https://taro-docs.jd.com/taro/docs/taroize-troubleshooting#3-commonjs-%E5%92%8C-es-%E6%A8%A1%E5%9D%97%E5%8C%96%E8%AF%AD%E6%B3%95%E4%B8%8D%E8%83%BD%E6%B7%B7%E7%94%A8'
  },
  importFrom: {
    message: '暂时不支持使用 import from 语法',
    recoverTime: 20,
    tips: '请手动修复'
  }
}
