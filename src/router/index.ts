import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import * as consty from '@/services/Const'

declare module 'vue-router' {
  interface RouteMeta {
    roles?: string[]
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/login/IndexView.vue')
  },
  {
    path: '/',
    component: () => import('@/views/main/IndexView.vue'),
    meta: {
      roles: [consty.USER, consty.COLLEGE_ADMIN, consty.SUBJECT_ADMIN, consty.SUPER_ADMIN]
    },
    children: [
      {
        path: 'info',
        component: () => import('@/views/main/InfoView.vue')
      },
      {
        path: 'settings',
        component: () => import('@/views/main/header/UserSettingView.vue')
      },
      {
        path: 'admin',
        component: () => import('@/views/main/admin/IndexView.vue'),
        meta: {
          roles: [consty.SUPER_ADMIN]
        }
      },
      {
        path: 'college',
        component: () => import('@/views/main/college/IndexView.vue'),
        meta: {
          roles: [consty.COLLEGE_ADMIN]
        },
        children: [
          {
            props: true,
            path: 'imported/:page?',
            alias: 'imported',
            component: () => import('@/views/main/college/ImportedListView.vue')
          },

          {
            props: true,
            path: 'dispatched/:depid?/:page?',
            component: () => import('@/views/main/college/DispatchedListView.vue')
          },
          {
            path: 'imports',
            component: () => import('@/views/main/college/ImportView.vue')
          },
          {
            path: 'functions',
            component: () => import('@/views/main/college/functions/IndexView.vue')
          },
          {
            path: 'addinvi',
            component: () => import('@/views/main/college/AddInviView.vue')
          },
          {
            props: true,
            path: 'notices/:depid',
            component: () => import('@/views/main/college/DispatchNoticeView.vue')
          },
          {
            props: true,
            path: 'inviedit/:inviid',
            component: () => import('@/views/main/college/InviEditView.vue')
          },
          {
            props: true,
            path: 'assigns/:inviid/departments/:depid/names/:name',
            component: () => import('@/views/main/college/AssignView.vue')
          }
        ]
      },
      {
        path: 'subject',
        component: () => import('@/views/main/subject/IndexView.vue'),
        meta: {
          roles: [consty.SUBJECT_ADMIN]
        },
        children: [
          {
            props: true,
            path: 'dispatched/:page?',
            component: () => import('@/views/main/subject/DispatchedListView.vue')
          },
          {
            props: true,
            path: 'assigned/:page?',
            component: () => import('@/views/main/subject/AssignedListView.vue')
          },
          {
            path: 'functions',
            component: () => import('@/views/main/subject/FunctionView.vue')
          },
          {
            props: true,
            path: 'assigns/:inviid',
            component: () => import('@/views/main/subject/AssignView.vue')
          },
          {
            props: true,
            path: 'notices/:inviid',
            component: () => import('@/views/main/subject/AssignNoticeView.vue')
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: routes
})

router.beforeEach((to) => {
  // 排除，没有声明角色权限的路由
  if (!to.meta.roles) {
    return true
  }

  const role = to.meta.roles.find((r) => r == sessionStorage.getItem('role'))
  if (role) {
    return true
  }
  sessionStorage.clear()
  return '/login'
})

export default router
