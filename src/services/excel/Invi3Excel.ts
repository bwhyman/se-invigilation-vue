import type { Invigilation } from '@/types'
import * as XLSX from 'xlsx-js-style'
import { IMPORT } from '../Const'
import { getInviDateByInviWeeksAndDayOfWeek, getInviFileTime } from '../Utils'

/**
 * 读取随堂考试管理
 * @param file
 * @returns
 */
export const readSuitangkaosInviExcel = (file: Blob) => {
  return new Promise<Invigilation[]>((resolve, reject) => {
    const reader = new FileReader()
    const invis: Invigilation[] = []
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result
      const wb = XLSX.read(data, { type: 'binary' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet)
      try {
        for (let i = 1; i < rows.length; i++) {
          const row: any = rows[i]
          //console.log(row)
          if (!row['随堂考试管理']) {
            reject('不是，随堂考试管理，文件。无法读取！')
            return
          }
          const locationRow = row['__EMPTY_8']
          const locations = locationRow.split(',')
          for (const location of locations) {
            const invi: Invigilation = {}
            invi.course = {}
            invi.course.courseName = row['__EMPTY_1']
            invi.course.teacherName = row['__EMPTY_2']
            invi.course.clazz = row['__EMPTY_3']
            invi.course.location = location
            const inviW = row['__EMPTY_5']
            const inviDayOfW = row['__EMPTY_6']
            invi.date = getInviDateByInviWeeksAndDayOfWeek(inviW, inviDayOfW)
            invi.time = getInviFileTime(row['__EMPTY_7'])
            invi.status = IMPORT
            //
            invi.amount = 2
            invis.push(invi)
          }
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

/**
 * 排考结果信息
 * @param file
 * @returns
 */
export const readPaikaojieguoInviExcel = (file: Blob) => {
  return new Promise<Invigilation[]>((resolve, reject) => {
    const reader = new FileReader()
    const invis: Invigilation[] = []
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result
      const wb = XLSX.read(data, { type: 'binary' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet)
      try {
        for (let i = 1; i < rows.length; i++) {
          const row: any = rows[i]
          if (!row['排考结果信息']) {
            reject('不是，排考结果信息，文件。无法读取！')
            return
          }
          // console.log(row)
          const invi: Invigilation = {}
          invi.course = {}
          invi.course.location = row['__EMPTY_10']
          invi.course.courseName = row['__EMPTY_1']
          invi.course.teacherName = row['__EMPTY_4']
          invi.course.clazz = row['__EMPTY_7']
          invi.date = row['__EMPTY_13']
          const times = row['__EMPTY_15'].split('~')
          invi.time = { starttime: times[0], endtime: times[1] }
          invi.status = IMPORT
          invi.amount = 2
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
