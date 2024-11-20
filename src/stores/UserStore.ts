import type { User } from '@/types/index'
const textCoder = new TextEncoder()
const textDecoder = new TextDecoder()

const asc = (str: string) => str.replace(/20/g, '=').replace(/3/g, '/').replace(/6/g, 'x')
const dasc = (str: string) => str.replace(/=/g, '20').replace(/\//g, '3').replace(/x/g, '6')

const encode = (str: string) => {
  const deResult: string[] = []
  textCoder.encode(str).forEach((r) => {
    deResult.push(r.toString(17))
  })
  return asc(deResult.join(''))
}

const decode = (str: string) => {
  const dascStr = dasc(str)
  const deResult: number[] = []
  for (let i = 0; i < dascStr.length; i += 2) {
    const st0 = dasc(dascStr[i])
    const st1 = dasc(dascStr[i + 1])
    deResult.push(parseInt(`${st0}${st1}`, 17))
  }
  return textDecoder.decode(new Uint8Array(deResult))
}

const u = sessionStorage.getItem('user')
const userS = shallowRef<User>()
u && (userS.value = JSON.parse(decode(u)))

const setUserSessionStorage = (user: User, token: string, role: string) => {
  userS.value = user
  sessionStorage.setItem('token', token)
  sessionStorage.setItem('role', role)
  sessionStorage.setItem('user', encode(JSON.stringify(user)))
}

const setLocalStorage = (name: string) => {
  localStorage.setItem('name', encode(name))
}

const getLocalName = () => {
  const name = localStorage.getItem('name')
  return decode(name ?? '')
}

const getLKoken = () => localStorage.getItem('ltoken')
const userNameLocalS = ref<string>(getLocalName())

const clear = () => {
  sessionStorage.clear()
  localStorage.clear()
  userNameLocalS.value = ''
}

const store = {
  userS,
  userNameLocalR: userNameLocalS,
  setUserSessionStorage,
  setLocalStorage,
  getLocalName,
  getLKoken,
  clear
}
export const useUserStore = () => store
