export default {
  template: `
    <div class="container-fluid p-0 m-0">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div class="container-fluid px-4">
          <span class="navbar-brand text-warning ms-3">Parking Portal</span>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#userNavbar">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse ms-3" id="userNavbar">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <router-link class="nav-link" to="/userHome">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/userSummary">Summary</router-link>
              </li>
            </ul>
            <ul class="navbar-nav ms-auto me-3">
              <li class="nav-item">
                <button class="btn btn-danger nav-link fw-semibold" @click="logout">Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Content -->
      <div class="container mt-5">
        <h2 class="fw-bold text-center mb-4 text-primary">User Summary</h2>

        <!-- Summary Cards -->
        <div class="row g-4 mb-4">
          <div class="col-md-6">
            <div class="card border-info shadow-sm h-100">
              <div class="card-body text-center">
                <h5 class="card-title text-info">Total Bookings</h5>
                <p class="fs-2 fw-bold">{{ totalBookings }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-success shadow-sm h-100">
              <div class="card-body text-center">
                <h5 class="card-title text-success">Total Amount Spent</h5>
                <p class="fs-2 fw-bold text-success">₹ {{ totalAmount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking Table -->
        <div v-if="bookings.length">
          <div class="table-responsive shadow-sm">
            <table class="table table-bordered table-striped table-hover text-center">
              <thead class="table-light">
                <tr>
                  <th>#</th>
                  <th>Lot Location</th>
                  <th>Spot ID</th>
                  <th>Vehicle No</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Bill Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(b, i) in bookings" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td>{{ b.lot_location }}</td>
                  <td>{{ b.spot_id }}</td>
                  <td>{{ b.vehicle_number }}</td>
                  <td>{{ b.start_time }}</td>
                  <td>{{ b.end_time || 'Active' }}</td>
                  <td class="fw-semibold text-primary">₹ {{ b.amount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="text-center mt-5 text-muted fs-5">
          No bookings found.
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      bookings: [],
      totalBookings: 0,
      totalAmount: 0,
    };
  },
  mounted() {
    this.fetchSummary();
  },
  methods: {
    async fetchSummary() {
      try {
        const response = await fetch("/api/user/summary", {
          headers: {
            "Content-Type": "application/json",
            "Auth-Token": localStorage.getItem("auth_token"),
          },
        });
        const data = await response.json();
        this.bookings = data.bookings || [];
        this.totalBookings = data.total_bookings || 0;
        this.totalAmount = data.total_amount || 0;
      } catch (err) {
        console.error("Failed to fetch summary", err);
      }
    },
    logout() {
      localStorage.removeItem("auth_token");
      this.$router.push("/login");
    },
  },
};
