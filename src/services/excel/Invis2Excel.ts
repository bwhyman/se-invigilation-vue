import type { InviDetail, Invigilation } from '@/types'
import * as XLSX from 'xlsx-js-style'

//
export const exportInvisDetails = (invis: Invigilation[], details: InviDetail[]) => {
  let index = 0
  const data = invis.map((invi) => [
    getExcelCell(`${(index += 1)}`, 'right'),
    getExcelCell(invi.course?.teacherName ?? ''),
    getExcelCell(invi.course?.courseName ?? ''),
    getExcelCell(invi.course?.clazz ?? ''),
    getExcelCell(`${invi.date} ${invi.time?.starttime}~${invi.time?.endtime}` ?? ''),
    getExcelCell(`${invi.course?.location}` ?? ''),
    getExcelCell(invi.amount + ''),
    getExcelCell(invi.importer?.userName ?? ''),
    getExcelCell(invi.dispatcher?.userName ?? ''),
    getExcelCell(invi.allocator?.userName ?? ''),
    getExcelCell(invi.executor?.map((exe) => exe.userName).join(';') ?? '')
  ])

  data.unshift([
    setExcelTitleCell('#', 'right'),
    setExcelTitleCell('授课教师'),
    setExcelTitleCell('课程名称'),
    setExcelTitleCell('班级'),
    setExcelTitleCell('考试时间'),
    setExcelTitleCell('考试地点'),
    setExcelTitleCell('监考人数'),
    setExcelTitleCell('录入'),
    setExcelTitleCell('下发'),
    setExcelTitleCell('分配'),
    setExcelTitleCell('监考教师')
  ])

  let ind = 0
  const detailData = details.map((detail) => [
    getExcelCell(`${(ind += 1)}`, 'right'),
    getExcelCell(detail.departmentName ?? ''),
    getExcelCell(detail.account + ''),
    getExcelCell(detail.name ?? ''),
    getExcelCell(detail.count + '')
  ])

  detailData.unshift([
    setExcelTitleCell('#', 'right'),
    setExcelTitleCell('专业'),
    setExcelTitleCell('工号'),
    setExcelTitleCell('姓名'),
    setExcelTitleCell('次数')
  ])
  const workBook = XLSX.utils.book_new()

  const jsonWorkSheet = XLSX.utils.aoa_to_sheet(data)
  jsonWorkSheet['!cols'] = getCellWidth(data)
  const jsonWorkSheet2 = XLSX.utils.aoa_to_sheet(detailData)
  jsonWorkSheet2['!cols'] = getCellWidth(detailData)
  XLSX.utils.book_append_sheet(workBook, jsonWorkSheet, `监考详细信息`)
  XLSX.utils.book_append_sheet(workBook, jsonWorkSheet2, `监考统计`)
  return XLSX.writeFile(workBook, '监考详细信息.xlsx')
}

//
export const exportInvisDetailsDate = (invis: Invigilation[], sdate: string, edate: string) => {
  let index = 0
  const data: any[][] = invis.map((invi) => [
    getExcelCell(`${(index += 1)}`, 'right'),
    getExcelCell(invi.course?.teacherName ?? ''),
    getExcelCell(invi.course?.courseName ?? ''),
    getExcelCell(invi.course?.clazz ?? ''),
    getExcelCell(`${invi.date} ${invi.time?.starttime}~${invi.time?.endtime}` ?? ''),
    getExcelCell(`${invi.course?.location}` ?? ''),
    getExcelCell(invi.executor?.map((exe) => exe.userName).join('; ') ?? '')
  ])

  data.unshift([
    setExcelTitleCell('#', 'right'),
    setExcelTitleCell('授课教师'),
    setExcelTitleCell('课程名称'),
    setExcelTitleCell('班级'),
    setExcelTitleCell('考试时间'),
    setExcelTitleCell('考试地点'),
    setExcelTitleCell('监考教师')
  ])

  const workBook = XLSX.utils.book_new()
  const jsonWorkSheet = XLSX.utils.aoa_to_sheet(data)
  jsonWorkSheet['!cols'] = getCellWidth(data)
  XLSX.utils.book_append_sheet(workBook, jsonWorkSheet, `监考信息`)
  return XLSX.writeFile(workBook, `监考信息-${sdate}-${edate}.xlsx`)
}

const setExcelTitleCell = (data: string, ali: string = 'center') => {
  return {
    v: data,
    t: 's',
    s: {
      font: {
        sz: 12,
        name: '等线',
        bold: true
      },
      alignment: {
        horizontal: ali
      },
      fill: {
        fgColor: { rgb: 'BEBEBE' }
      }
    }
  }
}

const getExcelCell = (data: string, ali: string = 'left') => {
  return {
    v: data,
    t: 's',
    s: {
      alignment: {
        horizontal: ali
      }
    }
  }
}

const getCellWidth = (data: any[][]) => {
  const colsWidth: { wch: number }[] = []

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    for (let j = 0; j < row.length; j++) {
      const cell: string = row[j].v
      let len = 0
      for (let k = 0; k < cell.length; k++) {
        if (cell.charCodeAt(k) > 255) {
          len += 2
          continue
        }
        len++
      }

      if (len <= 4) len = 4
      if (!colsWidth[j]) {
        colsWidth[j] = { wch: len }
        continue
      }
      colsWidth[j].wch = Math.max(colsWidth[j].wch, len)
    }
  }

  return colsWidth
}
