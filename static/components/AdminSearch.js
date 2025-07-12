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

      <div class="container py-4">
        <!-- Search Section -->
        <div class="card shadow-sm mb-4">
          <div class="card-body d-flex flex-column flex-md-row align-items-md-center gap-3">
            <label class="form-label m-0 me-2">Search By:</label>
            <select class="form-select w-auto" v-model="searchType">
              <option value="" disabled>Select Type</option>
              <option value="location">Location</option>
              <option value="user">User ID</option>
              <option value="spot">Spot ID</option>
            </select>
            <input v-model.trim="query" type="text" class="form-control" placeholder="Enter query..." @keyup.enter="performSearch">
            <button class="btn btn-primary" @click="performSearch">Search</button>
          </div>
        </div>

        <!-- Results Section -->
        <div v-if="results.length > 0">
          <h5 class="text-secondary fw-bold mb-3">Search Results</h5>
          
          <!-- Result: Lot -->
          <div v-for="result in results" :key="result.id || result.lot_id" class="mb-3">
            <div v-if="result.type === 'lot'" class="card shadow-sm">
              <div class="card-header bg-info text-white">
                Lot #{{ result.lot_id }} - {{ result.address }}
              </div>
              <div class="card-body">
                <p><strong>Occupied:</strong> {{ result.occupied }} / {{ result.capacity }}</p>
                <div class="d-flex flex-wrap">
                  <div
                    v-for="spot in result.spots"
                    :key="spot.id"
                    class="badge me-2 mb-2 px-3 py-2"
                    :class="spot.is_occupied ? 'bg-danger' : 'bg-success'"
                  >
                    {{ spot.id }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Result: User -->
            <div v-if="result.type === 'user'" class="card shadow-sm">
              <div class="card-body">
                <p class="mb-1"><strong>{{ result.name }}</strong> ({{ result.email }})</p>
                <p class="mb-0">Pincode: {{ result.pincode }}</p>
              </div>
            </div>

            <!-- Result: Spot -->
            <div v-if="result.type === 'spot'" class="card shadow-sm">
              <div class="card-body">
                <p class="mb-0">
                  Spot ID: <strong>{{ result.id }}</strong> |
                  Lot ID: <strong>{{ result.lot_id }}</strong> |
                  Occupied: <span :class="result.is_occupied ? 'text-danger fw-bold' : 'text-success fw-bold'">
                    {{ result.is_occupied ? 'Yes' : 'No' }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else-if="searched" class="text-center text-muted mt-5 fs-5">
          No results found for your query.
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      searchType: '',
      query: '',
      results: [],
      searched: false
    };
  },
  mounted() {
    const { type, query } = this.$route.query;
    if (type && query) {
      this.searchType = type;
      this.query = query;
      this.fetchSearchResults();
    }
  },
  watch: {
    '$route.query'(newQuery) {
      this.searchType = newQuery.type || '';
      this.query = newQuery.query || '';
      this.fetchSearchResults();
    }
  },
  methods: {
    performSearch() {
      this.$router.replace({ query: { type: this.searchType, query: this.query } });
    },
    async fetchSearchResults() {
      this.searched = true;
      if (!this.query) {
        this.results = [];
        return;
      }
      try {
        const response = await fetch(`/api/admin/search?type=${this.searchType}&query=${this.query}`, {
          headers: {
            "Content-Type": "application/json",
            "Auth-Token": localStorage.getItem("auth_token")
          },
        });
        const data = await response.json();
        this.results = data;
      } catch (err) {
        console.error("Error fetching search results:", err);
        this.results = [];
      }
    },
    logout() {
      localStorage.removeItem("auth_token");
      this.$router.push('/login');
    }
  }
};
