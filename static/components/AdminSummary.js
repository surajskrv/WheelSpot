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

    <!-- Summary Cards -->
    <div class="container my-5">
      <div class="text-center mb-5">
        <h1 class="display-6 fw-bold text-primary">Admin Summary Dashboard</h1>
        <p class="text-muted">Overview of parking revenue, spot usage, and user bookings</p>
      </div>

      <div class="row g-4">
        <!-- Revenue Per Lot -->
        <div class="col-md-6">
          <div class="card h-100 border-primary shadow-sm">
            <div class="card-header bg-primary text-white text-center">
              <h5 class="mb-0">Revenue per Lot</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="ps-3">Lot ID</th>
                      <th class="text-end pe-3">Revenue (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in lotRevenue" :key="item.lot_id">
                      <td class="ps-3">{{ item.lot_id }}</td>
                      <td class="text-end pe-3 fw-semibold">{{ item.total_amount }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Spot Usage -->
        <div class="col-md-6">
          <div class="card h-100 border-dark shadow-sm">
            <div class="card-header bg-dark text-white text-center">
              <h5 class="mb-0">Spot Usage</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="ps-3">Lot ID</th>
                      <th>Location</th>
                      <th class="text-center">Available</th>
                      <th class="text-center pe-3">Occupied</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in lotUsage" :key="item.lot_id">
                      <td class="ps-3">{{ item.lot_id }}</td>
                      <td>{{ item.location }}</td>
                      <td class="text-center text-success fw-bold">{{ item.available }}</td>
                      <td class="text-center text-danger fw-bold pe-3">{{ item.occupied }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking History -->
    <div class="container my-5">
      <div class="text-center mb-4">
        <h2 class="fw-bold text-secondary">User Booking History</h2>
      </div>

      <div v-if="bookingHistory.length === 0" class="alert alert-info text-center">
        No booking records found.
      </div>

      <div v-else>
        <div
          v-for="(user, index) in bookingHistory"
          :key="user.email"
          class="mb-5 border-bottom pb-4"
        >
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2">
            <h5 class="mb-1">#{{ index + 1 }} — <span class="fw-bold">{{ user.name }}</span> ({{ user.email }})</h5>
            <span class="badge bg-success fs-6 mt-2 mt-md-0">Total Spent: ₹{{ user.total_spent }}</span>
          </div>

          <div v-if="user.bookings.length === 0" class="alert alert-warning">
            No bookings found for this user.
          </div>

          <div v-else class="table-responsive">
            <table class="table table-bordered table-hover align-middle">
              <thead class="table-light text-center">
                <tr>
                  <th>#</th>
                  <th>Location</th>
                  <th>Spot ID</th>
                  <th>Vehicle</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Bill (₹)</th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr v-for="(b, i) in user.bookings" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td>{{ b.location }}</td>
                  <td>{{ b.spot_id }}</td>
                  <td>{{ b.vehicle_number }}</td>
                  <td>{{ b.start_time }}</td>
                  <td>{{ b.end_time }}</td>
                  <td class="fw-semibold text-primary">{{ b.bill_amount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,

  data() {
    return {
      lotRevenue: [],
      lotUsage: [],
      bookingHistory: [],
    };
  },

  mounted() {
    this.fetchSummary();
  },

  methods: {
    logout() {
      localStorage.removeItem("auth_token");
      this.$router.push("/login");
    },

    async fetchSummary() {
      try {
        const response = await fetch("/api/admin/summary", {
          headers: {
            "Content-Type": "application/json",
            "Auth-Token": localStorage.getItem("auth_token")
          }
        });
        const data = await response.json();

        this.lotRevenue = data.bill;
        this.lotUsage = data.lots;
        this.bookingHistory = data.booking_history;
      } catch (err) {
        console.error("Error loading summary:", err);
      }
    },
  },
};
