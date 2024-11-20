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

      try {
        for (const r of XLSX.utils.sheet_to_json(sheet) as any) {
          const invi = readInviRow(r)
          if (!invi) return
          invi.status = IMPORT
          const moreLocations = invi.course!.location!.replaceAll('，', ',')
          if (~moreLocations.indexOf(',')) {
            const array = moreLocations.split(',') as string[]
            for (const loc of array) {
              const invi2 = JSON.parse(JSON.stringify(invi))
              invi2.location = loc
              invis.push(invi2)
            }
            continue
          }
          invis.push(invi)
        }
      } catch (error) {
        reject(error)
        return
      }
    }
    reader.onloadend = () => {
      resolve(invis)
    }
    reader.readAsArrayBuffer(file)
  })
}

const readInviRow = (r: any) => {
  const invi: Invigilation = {}

  // course name
  let courseName = r['课程名称']
  if (!courseName || courseName.length == 0) {
    throw '课程名称为空'
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
  invi.course.teacherName = teacherName ?? '外院系教师'

  // class
  const clazz = r['班级']?.trim()
  invi.course.clazz = clazz ?? '*'

  // 监考日期
  const date = r['考试日期']
  if (date) {
    const inviDate = getDateFix(date)
    invi.date = inviDate
  }
  //
  const dateTime = r['考试时间']?.trim()
  if (dateTime) {
    const rtime = getTime(dateTime)
    invi.time.starttime = rtime?.stime
    invi.time.endtime = rtime?.etime
  }

  let startTime = r['开始时间'] as string | undefined
  startTime = startTime?.trim()
  let endTime = r['结束时间'] as string | undefined
  endTime = endTime?.trim()
  if ((!invi.time.starttime && !startTime) || (!invi.time.endtime && !endTime)) {
    throw `读取到${invi.course.courseName}，考试时间为空`
  }

  // 监考时间
  if (startTime && endTime) {
    const rtime = getStartEndTime(startTime, endTime)
    if (!rtime) {
      throw `读取到${invi.course.courseName}，${startTime}~${endTime}；错误`
    }
    if (!invi.date && !rtime.date) {
      throw `读取到${invi.course.courseName}，考试日期为空`
    }
    rtime.date && (invi.date = rtime.date)
    invi.time.starttime = rtime.stime
    invi.time.endtime = rtime.etime
  }

  //
  const amount = parseInt(r['监考人数']?.replace('人', '')?.trim())
  if (Number.isNaN(amount)) {
    throw `读取到${invi.course.courseName}，监考人数错误`
  }
  invi.amount = amount

  //
  const localion = r['地点']?.replaceAll('（T）', '')?.trim()
  if (!localion) {
    throw `读取到${invi.course.courseName}，监考地点为空`
  }
  invi.course.location = localion
  return invi
}

const getTime = (time: string) => {
  const rtime = { stime: '', etime: '' }
  const inviTime = time.replaceAll('-', '~').replaceAll('：', ':')
  if (!inviTime.includes(':')) {
    throw `读取到${inviTime}，考试时间错误。格式：08:00`
  }
  rtime.stime = getTimeFix(inviTime.split('~')[0])
  rtime.etime = getTimeFix(inviTime.split('~')[1])
  return rtime
}

const getStartEndTime = (stime: string, etime: string) => {
  const rtime = { stime: '', etime: '', date: '' }
  if (stime.length >= 6) {
    const date = getDateFix(stime.split(' ')[0])
    if (date) {
      rtime.date = date
      stime = stime.split(' ')[1]
      etime = etime.split(' ')[1]
    }
  }

  rtime.stime = stime.replaceAll('：', ':')
  rtime.etime = etime.replaceAll('：', ':')

  if (!rtime.stime.includes(':') || !rtime.etime.includes(':')) {
    const msg = `${rtime.stime}~${rtime.etime}`
    throw `读取到${msg}，考试时间错误。格式：08:00`
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
const getDateFix = (date: string) => {
  const inviDate = date.replaceAll('/', '-').replaceAll('.', '-')
  const dateStrArray = inviDate.split('-')
  if (!dateStrArray || dateStrArray.length == 0) {
    throw `读取到${dateStrArray}，考试日期错误`
  }
  if (dateStrArray[0].length !== 4) {
    throw `读取到${dateStrArray[0]}，考试年份请使用4位，例如，2024`
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
    throw `读取到${temp}，考试日期请使用格式：2024-08-04`
  }
  return temp
}
