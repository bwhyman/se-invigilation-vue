import type { ImportTimetable, Invigilation, Timetable, User, InviDetail } from '@/types'
import * as XLSX from 'xlsx'
import { IMPORT } from './Const'

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
            // 具体节
            const tempP = getPeriod(j - (i - 1))
            // 同一节中有多门课
            for (let m = 0; m < sections.length; m += 5) {
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
            // 具体节
            const tempP = getPeriod(j - (i - 1))
            // 同一节中有多门课
            for (let m = 0; m < sections.length; m += 5) {
              // 课程名称
              const name = getCourseName(sections[m])
              //
              const weeks = formatWeeks(sections[m + 2])
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
  if (weeks.indexOf(',') !== -1) {
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
  if (weeks.indexOf('-') !== -1) {
    const weeksSplit = weeks.split('-')
    wArrays.push({ startweek: Number(weeksSplit[0]), endweek: Number(weeksSplit[1]) })
    return
  }
  return wArrays
}

// 提取课表中周的具体数字
const formatWeeks = (weeks: string) => {
  weeks = weeks.replaceAll('单', '').replaceAll('双', '')
  return weeks.substring(0, weeks.indexOf('周'))
}

// 获取课表课程名称
const getCourseName = (str: string) => {
  if (str.indexOf('[') !== -1) {
    str = str.substring(0, str.indexOf('['))
  }
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

// 读取用户表
export const readUsersExcel = (file: Blob) => {
  return new Promise<User[]>((resolve) => {
    const reader = new FileReader()
    const users: User[] = []
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result
      const wb = XLSX.read(data, { type: 'binary' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      XLSX.utils.sheet_to_json(sheet).forEach((r: any) => {
        let role = 'pL6sC'
        if (r['权限']) {
          role = r['权限']
        }
        users.push({
          name: r['姓名'],
          account: `${r['账号']}`,
          mobile: `${r['手机号']}`,
          department: r['部门'],
          role: role
        })
      })
    }

    reader.onloadend = () => {
      resolve(users)
    }
    reader.readAsBinaryString(file)
  })
}

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
        if (invi.course!.location!.replace('，', ',').indexOf(',') != -1) {
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

  if (courseName.indexOf('[') != -1) {
    courseName = courseName.substring(0, courseName.indexOf('['))
  }
  invi.course = {}
  invi.time = {}

  invi.course.courseName = courseName

  // teacher name
  let teacherName = r['授课教师']
  if (teacherName.indexOf('[') != -1) {
    teacherName = teacherName.substring(0, teacherName.indexOf('['))
  }
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
  invi.course.location = r['地点']
  if (!invi.course.location || invi.course.location.length == 0) {
    reject('监考地点为空')
    return
  }

  return invi
}

//
export const exportInvisDetails = (invis: Invigilation[], details: InviDetail[]) => {
  let index = 0
  const rows = invis.map((invi) => {
    const row: any = {}
    row['#'] = index += 1
    row['授课教师'] = invi.course?.teacherName ?? ''
    row['课程'] = invi.course?.courseName ?? ''
    row['班级'] = invi.course?.clazz ?? ''
    row['考试时间'] = `${invi.date} ${invi.time?.starttime}~${invi.time?.endtime}` ?? ''
    row['考试地点'] = `${invi.course?.location}` ?? ''
    row['人数'] = invi.amount ?? ''
    row['导入'] = invi.importer?.userName ?? ''
    row['下发'] = invi.dispatcher?.userName ?? ''
    row['分配'] = invi.allocator?.userName ?? ''
    row['监考教师'] = invi.executor?.map((exe) => exe.userName).join(';')
    return row
  })
  let ind = 0
  const detailRows = details.map((detail) => {
    const row: any = {}
    row['#'] = ind += 1
    row['专业'] = detail.departmentName
    row['工号'] = detail.account
    row['教师'] = detail.name
    row['次数'] = detail.count
    return row
  })

  const workBook = XLSX.utils.book_new()
  const jsonWorkSheet = XLSX.utils.json_to_sheet(rows)
  const jsonWorkSheet2 = XLSX.utils.json_to_sheet(detailRows)
  XLSX.utils.book_append_sheet(workBook, jsonWorkSheet, `监考详细信息`)
  XLSX.utils.book_append_sheet(workBook, jsonWorkSheet2, `监考统计`)
  return XLSX.writeFile(workBook, '监考详细信息.xlsx')
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
          const cellRows = cell.split(/\r\n+/)
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
