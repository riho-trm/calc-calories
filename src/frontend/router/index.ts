import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "../views/Login.vue";
// import LoginTest from "../views/LoginTest.vue";
import TopView from "../views/TopView.vue";
import MembershipRegistration from "../views/MembershipRegistration.vue";
import TopMenu from "../views/TopMenu.vue";
import AdminMenu from "../views/AdminMenu.vue";
import RegisterEstimatedAmount from "../views/RegisterEstimatedAmount.vue";
import EstimatedAmountList from "../views/EstimatedAmountList.vue";
import EditEstimatedAmount from "../views/EditEstimatedAmount.vue";
import MyPage from "../views/MyPage.vue";
import { authorizeToken } from "./guards";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  // {
  //   path: "/logintest",
  //   name: "loginTest",
  //   component: LoginTest,
  // },
  {
    path: "/topview",
    name: "TopView",
    component: TopView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/register",
    name: "Register",
    component: MembershipRegistration,
  },
  {
    path: "/topmenu",
    name: "TopMenu",
    component: TopMenu,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/adminmenu",
    name: "AdminMenu",
    component: AdminMenu,
  },
  {
    path: "/registerestimatedamount",
    name: "RegisterEstimatedAmount",
    component: RegisterEstimatedAmount,
  },
  {
    path: "/estimatedamountlist",
    name: "EstimatedAmountList",
    component: EstimatedAmountList,
  },
  {
    path: "/editestimatedamount/:id",
    name: "EditEstimatedAmount",
    component: EditEstimatedAmount,
  },
  {
    path: "/mypage",
    name: "MyPage",
    component: MyPage,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
router.beforeEach(authorizeToken);

export default router;
