import Home from "./components/Home.js";
import Login from "./components/Login.js";
import Register from "./components/Register.js";
import AdminHome from "./components/AdminHome.js";
import AdminSearch from "./components/AdminSearch.js";
import AdminSummary from "./components/AdminSummary.js";
import AdminUsers from "./components/AdminUsers.js";
import UserHome from "./components/UserHome.js";
import UserSummary from "./components/UserSummary.js";


const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/adminHome", component: AdminHome },
  { path: "/adminSearch", component: AdminSearch },
  { path: "/adminSummary", component: AdminSummary },
  { path: "/adminUsers", component: AdminUsers },
  { path: "/userHome", component: UserHome },
  { path: "/userSummary", component: UserSummary },

];

const router = new VueRouter({
  routes,
});

const app = new Vue({
  el: "#app",
  router,
  template:`
    <div class="container-fluid p-0 m-0">
      <router-view></router-view>
    </div>
  `,
  data: {
    loggedIn: false,
  },
  methods: {},
}); 