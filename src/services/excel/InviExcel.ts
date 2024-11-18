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
  courseName = courseName.trim()
  ~courseName.indexOf('[') && (courseName = courseName.substring(0, courseName.indexOf('[')))
  invi.course = {}
  invi.time = {}

  invi.course.courseName = courseName

  // teacher name
  let teacherName = r['授课教师']
  if (teacherName) {
    teacherName = teacherName.trim()
    ~teacherName.indexOf('[') && (teacherName = teacherName.substring(0, teacherName.indexOf('[')))
  }
  invi.course.teacherName = teacherName ?? '*'

  // class
  const clazz = r['班级']
  invi.course.clazz = clazz ? clazz.trim() : '*'

  // 监考日期
  const date = r['考试日期']
  if (date) {
    const inviDate = getDateFix(date, reject)
    invi.date = inviDate
  }
  //
  const dateTime = r['考试时间']
  if (dateTime) {
    const rtime = getTime(dateTime, reject)
    invi.time.starttime = rtime?.stime
    invi.time.endtime = rtime?.etime
  }

  // 监考时间
  if (r['开始时间'] && r['结束时间']) {
    const rtime = getStartEndTime(r['开始时间'], r['结束时间'], reject)
    if (!rtime) {
      reject(`读取到${r['开始时间']}~${r['结束时间']}；错误`)
      return
    }
    rtime.date && (invi.date = rtime.date)
    invi.time.starttime = rtime.stime
    invi.time.endtime = rtime.etime
  }

  //
  let amount = r['监考人数']
  if (!amount) {
    reject(`${invi.course.courseName}；监考人数读取错误`)
    return
  }
  amount = Number(amount.replace('人', '').trim())
  if (Number.isNaN(amount)) {
    reject(`${invi.course.courseName}；监考人数读取错误`)
    return
  }
  invi.amount = amount

  //
  const localion = r['地点']
  if (!localion) {
    reject(`${invi.course.courseName}；监考地点为空`)
    return
  }
  invi.course.location = localion.replaceAll('（T）', '').trim()
  return invi
}

const getTime = (time: string, reject: (str: string) => void) => {
  const rtime = { stime: '', etime: '' }
  const inviTime = time.replaceAll('-', '~').replaceAll('：', ':')
  if (!inviTime.includes(':')) {
    reject(`读取到${inviTime}；考试时间读取错误。格式：08:00`)
  }
  rtime.stime = getTimeFix(inviTime.split('~')[0])
  rtime.etime = getTimeFix(inviTime.split('~')[1])
  return rtime
}

const getStartEndTime = (stime: string, etime: string, reject: (str: string) => void) => {
  const rtime = { stime: '', etime: '', date: '' }
  if (stime && stime.length >= 6) {
    const date = getDateFix(stime.split(' ')[0], reject)
    date && (rtime.date = date)
    if (date) {
      rtime.date = date
      stime = stime.split(' ')[1]
      etime = etime.split(' ')[1]
    }
  }

  if (stime && stime.length > 0) {
    rtime.stime = stime.replaceAll('：', ':')
    rtime.etime = etime.replaceAll('：', ':')
  }
  if (!rtime.stime.includes(':') || !rtime.etime.includes(':')) {
    let msg = rtime.stime
    if (!rtime.etime.includes(':')) {
      msg = rtime.etime
    }
    reject(`读取到${msg}；考试时间读取错误。格式：08:00`)
    return
  }
  rtime.stime = getTimeFix(rtime.stime.trim())
  rtime.etime = getTimeFix(rtime.etime.trim())

  return rtime
}
// 时间补位
const getTimeFix = (time: string) => {
  const timeA = time.split(':')
  if (timeA[0].length === 1) {
    timeA[0] = `0${timeA[0]}`
  }
  if (timeA[1].length === 1) {
    timeA[1] = `0${timeA[1]}`
  }
  return timeA.join(':')
}
// 日期补位
const getDateFix = (date: string, reject: (str: string) => void) => {
  const inviDate = date.replaceAll('/', '-').replaceAll('.', '-')
  const dateStrArray = inviDate.split('-')
  if (!dateStrArray || dateStrArray.length == 0) {
    reject(`读取到${dateStrArray}；考试日期读取失败`)
    return
  }
  if (dateStrArray[0].length !== 4) {
    reject(`读取到${dateStrArray[0]}；考试年份请使用4位，例如，2024`)
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
    reject(`读取到${temp}；考试日期请使用格式：2024-08-04`)
    return
  }
  return temp
}
