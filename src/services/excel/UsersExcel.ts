import type { User } from '@/types'
import * as XLSX from 'xlsx-js-style'
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
