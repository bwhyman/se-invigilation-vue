import type { Course, ImportTimetable, Invigilation, Timetable, User } from '@/types'
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
            if (!x) continue
            const section = x.v
            const courseRegx = /(\w.+|\W.+)\n/g
            const sections = section.match(courseRegx)
            // 同一节中有门课
            for (let m = 0; m < sections.length; m += 4) {
              // 具体节
              let tempP = ''
              switch (j - (i - 1)) {
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

              let name = sections[m].replace('\n', '')
              if (name.indexOf('[') !== -1) {
                name = name.substring(0, name.indexOf('['))
              }
              let weeks = sections[m + 2].replace('\n', '').replace('单', '').replace('双', '')
              weeks = weeks.substring(0, weeks.indexOf('[') - 1)
              const wArrays: Timetable[] = []
              getWeeks(weeks, wArrays)

              wArrays.forEach((w) => {
                const temp: { courseName?: string; location?: string; clazz?: string } = {}
                w.teacherName = teach.name
                w.period = tempP
                w.dayweek = k + 1
                temp.courseName = name
                temp.clazz = sections[m + 1].replace('\n', '')
                temp.location = sections[m + 3].replace('\n', '')
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

const getWeeks = (weeks: string, wArrays: Timetable[]) => {
  if (weeks.length === 1) {
    wArrays.push({ startweek: Number(weeks), endweek: Number(weeks) })
    return
  }
  if (weeks.indexOf('-') !== -1 && weeks.indexOf(',') === -1) {
    const weeksSplit = weeks.split('-')
    wArrays.push({ startweek: Number(weeksSplit[0]), endweek: Number(weeksSplit[1]) })
    return
  }
  if (weeks.indexOf(',') !== -1) {
    const weeksSplit = weeks.split(',')
    weeksSplit.forEach((w) => {
      getWeeks(w, wArrays)
    })
  }
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
    const inviDate = r['考试日期'].replace('/', '-')
    invi.date = inviDate

    //
    const inviTime = r['考试时间']
    invi.time.starttime = inviTime.split('~')[0]
    invi.time.endtime = inviTime.split('~')[1]
  }

  if (r['开始时间'] && r['开始时间'].length > 0) {
    invi.date = r['开始时间'].split(' ')[0]
    invi.time.starttime = r['开始时间'].split(' ')[1]
    invi.time.endtime = r['结束时间'].split(' ')[1]
  }
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

export const readDingtalkExcel = (file: Blob) => {
  return new Promise<User[]>((resolve) => {
    const reader = new FileReader()
    const users: User[] = []
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result
      const wb = XLSX.read(data, { type: 'binary' })
      const sheet = wb.Sheets[wb.SheetNames[0]]

      for (const r of XLSX.utils.sheet_to_json(sheet) as any) {
        const t: User = {
          name: r['name'],
          dingUserId: r['userid'],
          dingUnionId: r['unionid'],
          mobile: r['mobile']
        }
        users.push(t)
      }
    }

    reader.onloadend = () => {
      resolve(users)
    }
    reader.readAsBinaryString(file)
  })
}
