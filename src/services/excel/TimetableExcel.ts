import type { ImportTimetable, Timetable } from '@/types'
import * as XLSX from 'xlsx-js-style'

export const readCollegeTimetableExcel = (file: Blob) => {
  return new Promise<ImportTimetable[]>((resolve) => {
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
        const weekChars = ['B', 'C', 'D', 'E', 'F', 'G', 'H']
        // k,星期
        for (let k = 0; k < weekChars.length; k++) {
          // j,节
          for (let j = i + 3; j <= i + 8; j++) {
            const x = sheet[`${weekChars[k]}${j}`]
            if (!x || x.v.trim().length == 0) continue
            const sections = x.v.split('\n')
            for (const sec of sections) {
              if (sec.trim().length == 0) {
                sections.splice(sections.indexOf(sec), 1)
              }
            }
            // 具体节
            const tempP = getPeriod(j - (i - 1))
            // 同一节中有多门课
            for (let m = 0; m < sections.length; m += 4) {
              const name = getCourseName(sections[m])
              const weeks = formatWeeks(sections[m + 2])
              const wArrays: Timetable[] = []
              getWeeks(weeks, wArrays)
              wArrays.forEach((w) => {
                const temp: { courseName?: string; location?: string; clazz?: string } = {}
                w.teacherName = teach.name
                w.period = tempP
                w.dayweek = k + 1
                temp.courseName = name
                temp.clazz = sections[m + 1]
                temp.location = sections[m + 3]
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
      resolve(teachers)
    }
    reader.readAsBinaryString(file)
  })
}

//
export const readTimetableExcel = (file: Blob) => {
  return new Promise<ImportTimetable[]>((resolve) => {
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
        const weekChars = ['B', 'C', 'D', 'E', 'F', 'G', 'H']
        // k,星期
        for (let k = 0; k < weekChars.length; k++) {
          // j,节
          for (let j = i + 3; j <= i + 8; j++) {
            const x = sheet[`${weekChars[k]}${j}`]

            if (!x || x.v.trim().length == 0) continue
            const sections = x.v.split('\n')
            for (const sec of sections) {
              if (sec.trim().length == 0) {
                sections.splice(sections.indexOf(sec), 1)
              }
            }
            // 具体节
            const tempP = getPeriod(j - (i - 1))
            // 同一节中有多门课
            for (let m = 0; m < sections.length; m += 4) {
              // 课程名称
              const name = getCourseName(sections[m])
              //
              const weeks = formatWeeks(sections[m + 1])
              const wArrays: Timetable[] = []
              getWeeks(weeks, wArrays)
              wArrays.forEach((w) => {
                const temp: { courseName?: string; location?: string; clazz?: string } = {}
                w.teacherName = teach.name
                w.period = tempP
                w.dayweek = k + 1
                temp.courseName = name
                temp.clazz = sections[m + 3]
                temp.location = sections[m + 2]
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
      resolve(teachers)
    }
    reader.readAsBinaryString(file)
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
  return new Promise<ImportTimetable[]>((resolve) => {
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
          const cellRows = cell.split(/\n+/)
          for (let k = 0; k < cellRows.length; k += 2) {
            const row2 = cellRows[k + 1]
            // 教师名称
            const teacherName = row2.substring(1, row2.indexOf('】'))
            const timetable: ImportTimetable = { name: teacherName, courses: [] }

            const temp = row2.substring(row2.indexOf('(') + 1, row2.indexOf(')'))

            // 拆分为每组，包含教室与周
            for (const groups of temp.split(';')) {
              if (groups.length == 0) break
              const locAndWeek = groups.split(',')
              //
              const courses: Timetable[] = []
              const weeks = locAndWeek[1].replaceAll('第', '').replaceAll('周', '')
              getWeeks(weeks, courses)
              courses.forEach((course) => {
                course.course = {}
                if (!course.course) return
                course.course.location = locAndWeek[0]
                course.course.clazz = '研究生'
                // 节
                course.period = period
                course.course.courseName = cellRows[k].substring(0, cellRows[k].indexOf('（'))
                // 星期
                course.dayweek = i + 1
                course.teacherName = teacherName
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
    reader.readAsBinaryString(file)
  })
}
