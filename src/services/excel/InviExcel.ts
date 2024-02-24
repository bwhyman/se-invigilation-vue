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
    reader.readAsBinaryString(file)
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

  //
  if (r['考试日期']) {
    const inviDate = r['考试日期'].replaceAll('/', '-')
    invi.date = inviDate

    //
    const inviTime = r['考试时间'].replaceAll('-', '~')
    invi.time.starttime = inviTime.split('~')[0]
    invi.time.endtime = inviTime.split('~')[1]
  }

  if (r['开始时间'] && r['开始时间'].length > 0) {
    invi.date = r['开始时间'].split(' ')[0]
    invi.time.starttime = r['开始时间'].split(' ')[1]
    invi.time.endtime = r['结束时间'].split(' ')[1]
  }

  invi.time.starttime = invi.time.starttime?.replaceAll('：', ':')
  invi.time.endtime = invi.time.endtime?.replaceAll('：', ':')

  if (!invi.date || invi.date.length == 0) {
    reject('监考日期为空。表格中日期使用文本类型，不要使用日期类型')
    return
  }

  //
  invi.amount = Number(`${r['监考人数']}`.replace('人', ''))
  if (!invi.amount) {
    reject('监考人数为空')
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
