import type { ImportTimetable, Timetable } from '@/types'
import * as XLSX from 'xlsx-js-style'

export const readTimetableExcel = (file: Blob, isCollege = true) => {
  return new Promise<ImportTimetable[]>((resolve, reject) => {
    const reader = new FileReader()
    const teachers: ImportTimetable[] = []
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result
      const wb = XLSX.read(data, { type: 'binary' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      // 每名教师
      for (let i = 1; i <= sheet['!rows']!.length; i += 10) {
        const teach: ImportTimetable = { name: '', courses: [] }
        // 获取教师姓名
        teach.name = sheet[`A${i}`].v.replace('东北林业大学', '').replace('教师课表', '').trim()
        // const existName = teachers.find((t) => t.name == teach.name)?.name
        // if (existName) {
        //   reject(`本科课表中，教师：${teach.name}，重名存在2份课表！`)
        //   return
        // }
        const weekChars = ['B', 'C', 'D', 'E', 'F', 'G', 'H']
        // k,星期
        for (let k = 0; k < weekChars.length; k++) {
          // j,节
          for (let j = i + 3; j <= i + 8; j++) {
            const x = sheet[`${weekChars[k]}${j}`]
            if (!x || x.v.trim().length == 0) continue

            const sections = (x.v.split('\n') as string[]).filter((str) => str !== '')
            for (const sec of sections) {
              if (sec.startsWith('分组')) {
                sections.splice(sections.indexOf(sec), 1)
              }
            }

            const len = sections.length
            if (len % 4 != 0) {
              reject(
                `本科课表中，课程片段行数应为4项的倍数，学院课表：课程/班级/周/教室；个人课表：课程/周/教室/班级。<br>
                教师：<span style="color: red">${teach.name}</span>，星期${k + 1}/${getPeriod(
                  j - (i - 1)
                )}节，读取到${len}行！`
              )
              return
            }
            for (const sec of sections) {
              if (sec.trim().length == 0) {
                sections.splice(sections.indexOf(sec), 1)
              }
            }
            // 具体节
            const tempP = getPeriod(j - (i - 1))
            // 同一节中有多门课
            for (let m = 0; m < sections.length; m += 4) {
              // 获取课程课程名称
              const name = getCourseName(sections[m])
              const weeks = isCollege ? formatWeeks(sections[m + 2]) : formatWeeks(sections[m + 1])
              const wArrays: Timetable[] = []
              getWeeks(weeks, wArrays)
              wArrays.forEach((w) => {
                const temp: { courseName?: string; location?: string; clazz?: string } = {}
                w.period = tempP
                w.dayweek = k + 1
                temp.courseName = name
                temp.clazz = isCollege ? sections[m + 1] : sections[m + 3]
                temp.location = isCollege ? sections[m + 3] : sections[m + 2]
                w.course = temp
                teach.courses.push(w)
              })
            }
          }
        }
        teachers.push(teach)
      }
    }
    reader.onloadend = () => {
      resolve(teachers.filter((teach) => teach.courses.length != 0))
    }
    reader.readAsArrayBuffer(file)
  })
}

// 获取课表中起止周
const getWeeks = (weeks: string, wArrays: Timetable[]) => {
  if (~weeks.indexOf(',')) {
    const weeksSplit = weeks.split(',')
    weeksSplit.forEach((w) => {
      getWeeks(w, wArrays)
    })
    return
  }
  if (weeks.indexOf('-') === -1) {
    wArrays.push({ startweek: Number(weeks), endweek: Number(weeks) })
    return
  }
  if (~weeks.indexOf('-')) {
    const weeksSplit = weeks.split('-')
    wArrays.push({ startweek: Number(weeksSplit[0]), endweek: Number(weeksSplit[1]) })
    return
  }
  return wArrays
}

// 提取课表中周的具体数字
const formatWeeks = (weeks: string) => {
  //console.log(weeks)

  weeks = weeks.replaceAll('单', '').replaceAll('双', '')
  return weeks.substring(0, weeks.indexOf('周'))
}

// 获取课表课程名称
const getCourseName = (str: string) => {
  ~str.indexOf('[') && (str = str.substring(0, str.indexOf('[')))
  return str
}

//
const getPeriod = (num: number) => {
  let tempP = ''
  switch (num) {
    case 4:
      tempP = '12'
      break
    case 5:
      tempP = '34'
      break
    case 6:
      tempP = '56'
      break
    case 7:
      tempP = '78'
      break
    case 8:
      tempP = '910'
      break
    case 9:
      tempP = '1112'
      break
  }
  return tempP
}

// 读取研究生课表
export const readPostGTimetableExcel = (file: Blob) => {
  return new Promise<ImportTimetable[]>((resolve, reject) => {
    const reader = new FileReader()
    const timetables: ImportTimetable[] = []
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result
      const wb = XLSX.read(data, { type: 'binary' })
      const sheet = wb.Sheets[wb.SheetNames[1]]

      const weekChars = ['C', 'D', 'E', 'F', 'G', 'H', 'I']
      // 星期
      for (let i = 0; i < weekChars.length; i++) {
        // 节
        for (let j = 2; j < 14; j += 2) {
          const result = sheet[`${weekChars[i]}${j}`]
          if (!result || result.v.trim().length == 0) continue
          const cell = result.v.trim()
          // 节
          const period = `${j - 1}${j}`
          // 23年度研究生课表分隔符
          // const cellRows = cell.split(/\r\n+/)
          // 24年度研究生课表分隔符
          const cellRows: string[] = cell.replaceAll('\r', '').split('\n')

          if (cellRows.length % 2 != 0) {
            reject(
              `研究生课表中，课程片段行数应为2项的倍数，课程/教师。<br>
              <span style="color: red">星期${i + 1}/第${period}节</span>，读取到${
                cellRows.length
              }行！`
            )
            return
          }

          for (let k = 0; k < cellRows.length; k += 2) {
            const row2 = cellRows[k + 1]
            // 教师名称
            const teacherName = row2.substring(1, row2.indexOf('】'))
            const timetable: ImportTimetable = { name: teacherName, courses: [] }

            const temp = row2.substring(row2.indexOf('(') + 1, row2.indexOf(')'))

            // 拆分为每组，包含教室与周
            for (const groups of temp.split(';')) {
              if (groups.length == 0) break
              const localIndex = groups.indexOf(',')
              const courses: Timetable[] = []
              const weeks = groups
                .substring(localIndex + 1)
                .replaceAll('第', '')
                .replaceAll('周', '')
              getWeeks(weeks, courses)
              courses.forEach((course) => {
                course.course = {}
                if (!course.course) return
                course.course.location = groups.substring(0, localIndex)
                course.course.clazz = '研究生'
                // 节
                course.period = period
                course.course.courseName = cellRows[k].substring(0, cellRows[k].indexOf('（'))
                // 星期
                course.dayweek = i + 1
              })

              timetable.courses.push(...courses)
            }
            timetables.push(timetable)
          }
        }
      }
    }

    reader.onloadend = () => {
      resolve(timetables)
    }
    reader.readAsArrayBuffer(file)
  })
}
