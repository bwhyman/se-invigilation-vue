import type { Invigilation } from '@/types'
import * as XLSX from 'xlsx-js-style'
import { IMPORT } from '../Const'

export const readInviExcel = (file: Blob) => {
  return new Promise<Invigilation[]>((resolve, reject) => {
    const reader = new FileReader()
    const invis: Invigilation[] = []
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result
      const wb = XLSX.read(data, { type: 'binary' })
      const sheet = wb.Sheets[wb.SheetNames[0]]

      for (const r of XLSX.utils.sheet_to_json(sheet) as any) {
        const invi = readInviRow(r, reject)
        if (!invi) return
        invi.status = IMPORT
        if (~invi.course!.location!.replaceAll('，', ',').indexOf(',')) {
          const array = r['地点'].replace('，', ',').split(',') as string[]
          for (const loc of array) {
            const invi2 = JSON.parse(JSON.stringify(invi))
            invi2.location = loc
            invis.push(invi2)
          }
          continue
        }

        invis.push(invi)
      }
    }
    reader.onloadend = () => {
      resolve(invis)
    }
    reader.readAsArrayBuffer(file)
  })
}

const readInviRow = (r: any, reject: any) => {
  const invi: Invigilation = {}

  // course name
  let courseName = r['课程名称']
  if (!courseName || courseName.length == 0) {
    reject('课程名称为空')
    return
  }

  ~courseName.indexOf('[') && (courseName = courseName.substring(0, courseName.indexOf('[')))
  invi.course = {}
  invi.time = {}

  invi.course.courseName = courseName

  // teacher name
  let teacherName = r['授课教师']
  ~teacherName.indexOf('[') && (teacherName = teacherName.substring(0, teacherName.indexOf('[')))
  invi.course.teacherName = teacherName

  // class
  if (r['班级'] && r['班级'].length > 0) {
    invi.course.clazz = r['班级']
  }
  if (!r['考试日期']) {
    reject('监考日期为空。表格中日期使用文本类型，不要使用日期类型')
    return
  }
  // 监考日期
  const inviDate = getInviDate(r['考试日期'], reject)
  if (!inviDate) return
  invi.date = inviDate

  // 监考时间
  const rtime = getTime(r['考试时间'], r['开始时间'], r['结束时间'], reject)
  if (!rtime) return
  invi.time.starttime = rtime.stime
  invi.time.endtime = rtime.etime

  //
  invi.amount = Number(`${r['监考人数']}`.replace('人', ''))
  if (!invi.amount) {
    reject('监考人数读取错误')
    return
  }
  //
  invi.course.location = r['地点'].replaceAll('（T）', '')
  if (!invi.course.location || invi.course.location.length == 0) {
    reject('监考地点为空')
    return
  }

  return invi
}

const getInviDate = (str: string, reject: (str: string) => void) => {
  const inviDate = str.replaceAll('/', '-').replaceAll('.', '-')
  const dateStrArray = inviDate.split('-')
  if (!dateStrArray || dateStrArray.length == 0) {
    reject('考试日期读取失败')
    return
  }
  if (dateStrArray[0].length != 4) {
    reject('考试日期请使用4位，例如，2024')
    return
  }
  // 补位
  if (dateStrArray[1].length == 1) {
    dateStrArray[1] = `0${dateStrArray[1]}`
  }
  if (dateStrArray[2].length == 1) {
    dateStrArray[2] = `0${dateStrArray[2]}`
  }

  const temp = dateStrArray.join('-')
  if (temp.length != 10) {
    reject('考试日期请使用格式：2024-08-04')
    return
  }
  return temp
}

const getTime = (time: string, stime: string, etime: string, reject: (str: string) => void) => {
  const rtime = { stime: '', etime: '' }
  if (time) {
    const inviTime = time.replaceAll('-', '~').replaceAll('：', ':')
    rtime.stime = inviTime.split('~')[0]
    rtime.etime = inviTime.split('~')[1]
  }
  if (stime && stime.length > 0) {
    rtime.stime = stime.replaceAll('：', ':')
    rtime.etime = etime.replaceAll('：', ':')
  }
  if (!rtime.stime.includes(':') || !rtime.etime.includes(':')) {
    reject('考试时间读取错误。格式：08:00')
    return
  }
  rtime.stime = getTimeFix(rtime.stime)
  rtime.etime = getTimeFix(rtime.etime)

  return rtime
}
// 补位
const getTimeFix = (time: string) => {
  const timeA = time.split(':')
  if (timeA[0].length == 1) {
    timeA[0] = `0${timeA[0]}`
  }
  if (timeA[1].length == 1) {
    timeA[1] = `0${timeA[1]}`
  }
  return timeA.join(':')
}
