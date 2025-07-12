export default {
  template: `
  <div class="container-fluid p-0 m-0">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div class="container-fluid px-4">
          <router-link class="navbar-brand text-warning fw-semibold ms-3" to="/adminHome">
            Admin Panel
          </router-link>

          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNavbar">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse ms-3" id="adminNavbar">
            <!-- Left side nav links -->
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <router-link class="nav-link" to="/adminHome">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/adminUsers">Users</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/adminSearch">Search</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/adminSummary">Summary</router-link>
              </li>
            </ul>

            <!-- Right side logout -->
            <ul class="navbar-nav ms-auto me-5">
              <li class="nav-item">
                <button class="nav-link btn btn-danger" @click="logout">Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

    <!-- Alerts -->
    <div class="container mt-4">
      <div v-if="emessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ emessage }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
      <div v-if="smessage" class="alert alert-success alert-dismissible fade show" role="alert">
        {{ smessage }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    </div>

    <!-- User Table -->
    <div class="container my-4">
      <div v-if="users.length > 0">
        <div class="text-center mb-4">
          <h2 class="text-primary fw-bold border-bottom pb-2">Registered Users</h2>
        </div>
        <div class="table-responsive">
          <table class="table table-striped table-hover align-middle text-center">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Address</th>
                <th>Pincode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.address }}</td>
                <td>{{ user.pincode }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteUser(user.id)">
                    <i class="bi bi-trash3-fill me-1"></i>Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- No Users Fallback -->
      <div v-else class="text-center text-muted mt-5">
        <h4 class="fw-light"><i class="bi bi-person-x me-2"></i>No users found.</h4>
      </div>
    </div>
  </div>
  `,

  data() {
    return {
      users: [],
      emessage: '',
      smessage: '',
    };
  },

  mounted() {
    this.fetchUsers();
  },

  methods: {
    async fetchUsers() {
      try {
        const response = await fetch("/api/admin/users", {
          headers: {
            "Content-Type": "application/json",
            "Auth-Token": localStorage.getItem("auth_token")
          },
        });
        const data = await response.json();
        this.users = data;
      } catch (err) {
        console.error("Error fetching users", err);
      }
    },

    async deleteUser(userId) {
      try {
        const response = await fetch(`/api/admin/user/delete/${userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Auth-Token": localStorage.getItem("auth_token")
          },
        });
        if (response.ok) {
          this.fetchUsers();
          this.smessage = "User deleted successfully.";
          this.emessage = '';
        } else {
          const errorData = await response.json();
          this.emessage = errorData.message || "Failed to delete user.";
          this.smessage = '';
        }
      } catch (err) {
        console.error("Error deleting user", err);
        this.emessage = "Error occurred during deletion.";
        this.smessage = '';
      }
    },

    logout() {
      localStorage.removeItem("auth_token");
      this.$router.push("/login");
    },
  },
};
