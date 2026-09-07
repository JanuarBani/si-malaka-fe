import Navigo from "navigo";
import { AuthService } from "../services/authService";
import { showToast } from "../components/layout/Toast";
import Login from "../pages/auth/Login";
import Layout, { attachLayoutEvents } from "../components/layout/Layout";
import AdminDashboard, { initAdminDashboard } from "../pages/admin/Dashboard";
import OperatorDashboard, {
  initOperatorDashboard,
} from "../pages/operator/Dashboard";
import PimpinanDashboard, {
  initPimpinanDashboard,
} from "../pages/pimpinan/Dashboard";
import KKPRList, { initKKPRList } from "../pages/kkpr/List";
import KKPRForm, { initKKPRForm } from "../pages/kkpr/Form";
import KKPRDetail, { initKKPRDetail } from '../pages/kkpr/Detail';
import MapPage, { initMap } from "../pages/gis/MapPage";
import VerificationList, {
  initVerificationList,
} from "../pages/gis/VerificationList";
import VerificationForm, {
  initVerificationForm,
} from "../pages/gis/VerificationForm";
import MappingPage, { initMappingPage } from "../pages/gis/MappingPage";
import LayerList, { initLayerList } from '../pages/gis/LayerList';
import Statistics, { initStatistics } from "../pages/reports/Statistics";
import Reports, { initReports } from "../pages/reports/Reports";
import UserList, { initUserList } from "../pages/users/UserList";
import UserForm, { initUserForm } from "../pages/users/UserForm";
import DocumentsList, {
  initDocumentsList,
} from "../pages/documents/DocumentsList";
import ZonasiList, { initZonasiList } from '../pages/gis/ZonasiList';
import KecamatanList, { initKecamatanList } from "../pages/gis/KecamatanList";
import DesaList, { initDesaList } from "../pages/gis/DesaList";

const router = new Navigo("/");
const render = (html) => {
  document.getElementById("app").innerHTML = html;
  attachLayoutEvents();
};

const authGuard = (callback) => {
  return (match) => {
    if (!AuthService.isAuthenticated()) {
      router.navigate("/login");
      return;
    }
    const user = AuthService.getUser();
    if (!user) {
      AuthService.clearTokens();
      router.navigate("/login");
      return;
    }
    callback(user, match);
  };
};

const ROLE_PATHS = {
  ADMIN: "/admin/dashboard",
  OPERATOR_GIS: "/operator/dashboard",
  PIMPINAN: "/pimpinan/dashboard",
};

router.on("/login", () => {
  if (AuthService.isAuthenticated()) {
    const user = AuthService.getUser();
    if (user) {
      router.navigate(ROLE_PATHS[user.role] || "/");
      return;
    }
  }
  render(Login());
  document
    .getElementById("login-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = e.target.username.value.trim();
      const password = e.target.password.value;
      if (!username || !password) {
        showToast("Username/email dan password wajib diisi", "error");
        return;
      }
      const btn = document.getElementById("login-btn");
      btn.disabled = true;
      btn.innerHTML = "Memproses...";
      try {
        await AuthService.loginAndRedirect(username, password);
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = "Masuk";
      }
    });
});

// Dashboard routes
router.on(
  "/admin/dashboard",
  authGuard((user) => {
    render(
      Layout({
        user,
        content: AdminDashboard(),
        activeMenu: "/admin/dashboard",
      }),
    );
    requestAnimationFrame(() => initAdminDashboard(user));
  }),
);
router.on(
  "/operator/dashboard",
  authGuard((user) => {
    render(
      Layout({
        user,
        content: OperatorDashboard(),
        activeMenu: "/operator/dashboard",
      }),
    );
    requestAnimationFrame(() => initOperatorDashboard(user));
  }),
);
router.on(
  "/pimpinan/dashboard",
  authGuard((user) => {
    render(
      Layout({
        user,
        content: PimpinanDashboard(),
        activeMenu: "/pimpinan/dashboard",
      }),
    );
    requestAnimationFrame(() => initPimpinanDashboard(user));
  }),
);

router.on(
  "/kkpr",
  authGuard((user) => {
    render(Layout({ user, content: KKPRList(user), activeMenu: "/kkpr" }));
    requestAnimationFrame(() => initKKPRList(user));
  }),
);

router.on(
  "/kkpr/tambah",
  authGuard((user) => {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR_GIS") {
      router.navigate(ROLE_PATHS[user.role]);
      return;
    }
    render(
      Layout({ user, content: KKPRForm(user), activeMenu: "/kkpr/tambah" }),
    );
    setTimeout(() => initKKPRForm(user), 0);
  }),
);

router.on(
  "/kkpr/edit/:id",
  authGuard((user) => {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR_GIS") {
      router.navigate(ROLE_PATHS[user.role]);
      return;
    }
    const id = window.location.pathname.split("/").pop();
    render(Layout({ user, content: KKPRForm(user, id), activeMenu: "/kkpr" }));
    setTimeout(() => initKKPRForm(user, id), 0);
  }),
);

router.on('/kkpr/:id', authGuard((user) => {
  const id = window.location.pathname.split('/').pop();
  if (!id) {
    router.navigate('/kkpr');
    return;
  }
  render(Layout({ user, content: KKPRDetail(user, id), activeMenu: '/kkpr' }));
  requestAnimationFrame(() => initKKPRDetail(user, id));
}));


router.on(
  "/map",
  authGuard((user) => {
    const app = document.getElementById("app");
    app.innerHTML = Layout({
      user,
      content: MapPage(user),
      activeMenu: "/map",
    });
    attachLayoutEvents();
    initMap(app);
  }),
);

router.on(
  "/gis/verification",
  authGuard((user) => {
    if (user.role !== "OPERATOR_GIS" && user.role !== "ADMIN") {
      router.navigate(ROLE_PATHS[user.role]);
      return;
    }
    render(
      Layout({
        user,
        content: VerificationList(user),
        activeMenu: "/gis/verification",
      }),
    );
    requestAnimationFrame(() => initVerificationList(user));
  }),
);

router.on(
  "/gis/verification/:id",
  authGuard((user) => {
    if (user.role !== "OPERATOR_GIS" && user.role !== "ADMIN") {
      router.navigate(ROLE_PATHS[user.role]);
      return;
    }
    const parts = window.location.pathname.split("/");
    const id = parts[parts.length - 1];
    if (!id) {
      router.navigate("/gis/verification");
      return;
    }
    render(
      Layout({
        user,
        content: VerificationForm(user, id),
        activeMenu: "/gis/verification",
      }),
    );
    requestAnimationFrame(() => initVerificationForm(user, id));
  }),
);

router.on(
  "/gis/mapping",
  authGuard((user) => {
    if (user.role !== "OPERATOR_GIS") {
      router.navigate(ROLE_PATHS[user.role]);
      return;
    }
    render(
      Layout({ user, content: MappingPage(user), activeMenu: "/gis/mapping" }),
    );
    requestAnimationFrame(() => initMappingPage(user));
  }),
);

router.on(
  "/gis/layers",
  authGuard((user) => {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR_GIS") {
      router.navigate(ROLE_PATHS[user.role]);
      return;
    }
    render(
      Layout({ user, content: LayerList(user), activeMenu: "/gis/layers" }),
    );
    requestAnimationFrame(() => initLayerList(user));
  }),
);

router.on(
  "/statistik",
  authGuard((user) => {
    render(
      Layout({ user, content: Statistics(user), activeMenu: "/statistik" }),
    );
    requestAnimationFrame(() => initStatistics(user));
  }),
);

router.on(
  "/laporan",
  authGuard((user) => {
    render(Layout({ user, content: Reports(user), activeMenu: "/laporan" }));
    requestAnimationFrame(() => initReports(user));
  }),
);


router.on(
  "/users",
  authGuard((user) => {
    if (user.role !== "ADMIN") {
      router.navigate(ROLE_PATHS[user.role]);
      return;
    }
    render(Layout({ user, content: UserList(user), activeMenu: "/users" }));
    requestAnimationFrame(() => initUserList(user));
  }),
);

router.on(
  "/users/tambah",
  authGuard((user) => {
    if (user.role !== "ADMIN") {
      router.navigate(ROLE_PATHS[user.role]);
      return;
    }
    render(Layout({ user, content: UserForm(user), activeMenu: "/users" }));
    requestAnimationFrame(() => initUserForm(user));
  }),
);

router.on(
  "/users/edit/:id",
  authGuard((user) => {
    if (user.role !== "ADMIN") {
      router.navigate(ROLE_PATHS[user.role]);
      return;
    }
    const parts = window.location.pathname.split("/");
    const id = parts[parts.length - 1];
    if (!id) {
      router.navigate("/users");
      return;
    }
    render(Layout({ user, content: UserForm(user, id), activeMenu: "/users" }));
    requestAnimationFrame(() => initUserForm(user, id));
  }),
);

router.on(
  "/dokumen",
  authGuard((user) => {
    render(
      Layout({ user, content: DocumentsList(user), activeMenu: "/dokumen" }),
    );
    requestAnimationFrame(() => initDocumentsList(user));
  }),
);

router.on(
  "/zonasi",
  authGuard((user) => {
    if (user.role !== "ADMIN") {
      router.navigate(ROLE_PATHS[user.role]);
      return;
    }
    render(Layout({ user, content: ZonasiList(user), activeMenu: "/zonasi" }));
    requestAnimationFrame(() => initZonasiList(user));
  }),
);

router.on(
  "/kecamatan",
  authGuard((user) => {
    if (user.role !== "ADMIN") {
      router.navigate(ROLE_PATHS[user.role]);
      return;
    }
    render(
      Layout({ user, content: KecamatanList(user), activeMenu: "/kecamatan" }),
    );
    requestAnimationFrame(() => initKecamatanList(user));
  }),
);

router.on(
  "/desa",
  authGuard((user) => {
    if (user.role !== "ADMIN") {
      router.navigate(ROLE_PATHS[user.role]);
      return;
    }
    render(Layout({ user, content: DesaList(user), activeMenu: "/desa" }));
    requestAnimationFrame(() => initDesaList(user));
  }),
);


// Placeholder routes lainnya
const placeholderPage = (title) => {
  return `<div class="text-center py-20"><h2 class="text-2xl font-bold text-gray-700">${title}</h2><p class="text-gray-500">Fitur ini akan segera hadir.</p></div>`;
};
const registerPlaceholderRoute = (path, title) => {
  router.on(
    path,
    authGuard((user) => {
      render(
        Layout({ user, content: placeholderPage(title), activeMenu: path }),
      );
    }),
  );
};
[
  "/dokumen",
  "/arsip",
  "/map",
  "/monitoring",
  "/statistik",
  "/laporan",
  "/users",
  "/gis/verification",
  "/gis/mapping",
  "/gis/layers",
  "/rdtr",
  "/zonasi",
].forEach((path) => {
  const title = path.charAt(1).toUpperCase() + path.slice(2).replace(/-/g, " ");
  registerPlaceholderRoute(path, title);
});

router.on("/", () => {
  if (AuthService.isAuthenticated()) {
    const user = AuthService.getUser();
    if (user) router.navigate(ROLE_PATHS[user.role]);
    else router.navigate("/login");
  } else {
    router.navigate("/login");
  }
});

router.notFound(() => {
  render('<h1 class="text-center mt-10">404 Not Found</h1>');
});

document.addEventListener("DOMContentLoaded", () => {
  router.resolve();
});

export default router;
