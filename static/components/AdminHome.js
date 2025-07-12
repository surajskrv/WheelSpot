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

      <div class="container mt-4" v-if="emessage">
      <div class="alert alert-danger d-flex justify-content-between" role="alert">
          {{ emessage }}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
      </div>
      <div class="container mt-4" v-if="smessage">
      <div class="alert alert-success d-flex justify-content-between" role="alert">
          {{ smessage }}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
      </div>

      <div class="container mt-4">
        <!-- Parking Lots head section name with all lot button-->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="text-primary">Parking Lots</h4>
            <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#addLotModal">+ Add Lot</button>
        </div>

        <!--- Parking lots details list --->
        <div class="row">
          <div class="col-md-4 mb-4" v-for="lot in lots" :key="lot.id">
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Parking#{{lot.id}}  {{ lot.location }}</h5>
                <p><strong>(Occupied: {{ lot.occupied_spots }}/{{ lot.total_spots }})</strong></p>

                <!-- Spot Statuses -->
                <div class="d-flex flex-wrap gap-1 mb-2">
                  <button v-for="spot in lot.spots"
                  :key="spot.id"
                  class="badge btn"
                  :class="spot.status === 'O' ? 'bg-success' : 'bg-secondary'"
                  @click="viewSpot(spot.id)"
                  data-bs-toggle="modal"
                  data-bs-target="#spotModal">
                  {{ spot.status }}
                  </button>
                </div>

                <div class="d-flex justify-content align-items-center">
                  <button class="btn btn-outline-warning me-2" data-bs-toggle="modal"data-bs-target="#updateLot"@click="openEditModal(lot)">Edit</button>
                  <button class="btn btn-outline-danger ms-2" @click="deleteLot(lot.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!---- Add lot module -->
      <div class="modal fade" id="addLotModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-warning">
              <h5 class="modal-title">Add New Parking Lot</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="createLot(newLot)">
                <div class="mb-3">
                  <label for="location" class="form-label">Location</label>
                  <input type="text" class="form-control" id="location" v-model="newLot.location" required>
                </div>
                <div class="mb-3">
                  <label for="address" class="form-label">Address</label>
                  <input type="text" class="form-control" id="address" v-model="newLot.address" required>
                </div>
                <div class="mb-3">
                  <label for="pincode" class="form-label">Pincode</label>
                  <input type="text" class="form-control" id="pincode" v-model="newLot.pincode" required>
                </div>
                <div class="mb-3">
                  <label for="price" class="form-label">Price per Hour</label>
                  <input type="number" class="form-control" id="price" v-model="newLot.price" required>
                </div>
                <div class="mb-3">
                  <label for="total_spots" class="form-label">Total Spots</label>
                  <input type="number" class="form-control" id="total_spots" v-model="newLot.total_spots" required>
                </div>
                <div class="mb-3 d-flex justify-content-end">
                  <button type="button" class="btn btn-secondary me-3" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-success me-3">Add Lot</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!---- Update/Edit lot Module -->
      <div class="modal fade" id="updateLot" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-warning">
              <h5 class="modal-title">Edit Parking Lot</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="UpdateLot">
                <div class="mb-3">
                <label for="location" class="form-label">Location</label>
                <input type="text" class="form-control" id="location" v-model="updateLotData.location" required>
                </div>
                <div class="mb-3">
                <label for="address" class="form-label">Address</label>
                <input type="text" class="form-control" id="address" v-model="updateLotData.address" required>
                </div>
                <div class="mb-3">
                <label for="pincode" class="form-label">Pincode</label>
                <input type="text" class="form-control" id="pincode" v-model="updateLotData.pincode" required>
                </div>
                <div class="mb-3">
                <label for="price" class="form-label">Price per Hour</label>
                <input type="number" class="form-control" id="price" v-model="updateLotData.price" required>
                </div>
                <div class="mb-3">
                <label for="total_spots" class="form-label">Total Spots</label>
                <input type="number" class="form-control" id="total_spots" v-model="updateLotData.total_spots" required>
                </div>
                <div class="mb-3 d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-3" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-success me-3">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Spot Modal -->
      <div class="modal fade" id="spotModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-warning">
                <h5 class="modal-title">View/Delete Parking Spot</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                  <label>ID:</label>
                  <input type="text" class="form-control" :value="spotId" readonly>
                </div>
                <div class="mb-3">
                  <label>Status:</label>
                  <input type="text" class="form-control" :value="spotStatus" readonly>
                  <div v-if="spotStatus === 'O'" class="mt-3">
                    <label>Customer ID:</label>
                    <input type="text" class="form-control" :value="userId" readonly>
                    <label class="mt-3">Vehicle Number:</label>
                    <input type="text" class="form-control" :value="vehicleNum" readonly>
                    <label class="mt-3">Date & Time of Parking:</label>
                    <input type="text" class="form-control" :value="startTime" readonly>
                    <p class="text-center text-danger mt-3">Can't Delete Occupied Spot</p>
                  </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger"
                        :disabled="spotStatus === 'O'"
                        @click="deleteSpot(spotId)">
                Delete
                </button>
                <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      lots: [],
      spotId: null,
      lotId:null,
      spotStatus: '',
      userId:null,
      startTime:'',
      vehicleNum:'',
      newLot:{
        location: '',
        address: '',
        pincode: '',
        price: null,
        total_spots: null,
      },
      updateLotData: {
        id: null,  
        location: '',
        address: '',
        pincode: '',
        price: 0,
        total_spots: 0,
      },
      emessage: '',
      smessage: '',
    };
  },
  mounted() {
    this.fetchLots();
  },
  methods: {
    async fetchLots() {
      try {
        const response = await fetch("/api/admin/lot/view", {
          headers: {
            "Content-Type": "application/json",
            "Auth-Token": localStorage.getItem("auth_token")
          },
        });
        const data = await response.json();
        this.lots = data;
        console.log("Fetched lots:", this.lots);
      } catch (err) {
        console.error("Error fetching lots", err);
      }
    },
    async createLot(lotData){
      try {
        const response = await fetch("/api/admin/lot/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Auth-Token": localStorage.getItem("auth_token")
          },
          body: JSON.stringify({
            location: lotData.location,
            address: lotData.address,
            pincode: lotData.pincode,
            price: lotData.price,
            total_spots: lotData.total_spots,
          }),
        });
        await this.fetchLots();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addLotModal'));
        modal.hide();
        this.smessage = "Lot created successfully.";
        if (!response.ok) {
          this.emessage = "Failed to create lot.";
        };
      } catch (err) {
        console.error("Error creating lot", err);
      }
    },
    openEditModal(lot) {
      this.updateLotData = {
        id: lot.id,
        location: lot.location,
        address: lot.address,
        pincode: lot.pincode,
        price: lot.price,
        total_spots: lot.total_spots,
      };
      const modal = new bootstrap.Modal(document.getElementById('updateLot'));
      modal.show();
    },
    async UpdateLot() {
      try {
        const lotId = this.updateLotData.id;
        const response = await fetch(`/api/admin/lot/update/${lotId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Auth-Token": localStorage.getItem("auth_token"),
          },
          body: JSON.stringify({
            location: this.updateLotData.location,
            address: this.updateLotData.address,
            pincode: this.updateLotData.pincode,
            price: this.updateLotData.price,
            total_spots: this.updateLotData.total_spots,
          }),
        });

        const result = await response.json();
        this.smessage = result.message || "Lot updated successfully.";

        if (!response.ok) {
          this.emessage = result.message || "Failed to update lot.";
          return;
        }

        await this.fetchLots();
        const modal = bootstrap.Modal.getInstance(document.getElementById('updateLot'));
        modal.hide();
      } catch (err) {
        console.error("Error updating lot", err);
      }
    },
    async deleteLot(lotId) {
      try {
        const response = await fetch(`/api/admin/lot/delete/${lotId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Auth-Token": localStorage.getItem("auth_token")
          },
        });
        if (!response.ok) {
          const result = await response.json();
          this.emessage = result.message || "Failed to delete lot.";
          return;
        }
        this.fetchLots();
        this.smessage = "Lot deleted successfully.";
      } catch (err) {
        console.error("Error deleting lot", err);
      }
    },
    async viewSpot(spot_id) {
      try {
        const response = await fetch(`/api/admin/spot/${spot_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Auth-Token": localStorage.getItem("auth_token")
          },
        });
        const data = await response.json();
        this.spotId = data.id;
        this.lotId = data.lot_id;
        this.spotStatus = data.status;
        this.userId = data.userId || null;
        this.startTime = data.startTime || '';
        this.vehicleNum = data.vehicleNum || '';
        this.fetchLots();
        const modal = bootstrap.Modal.getInstance(document.getElementById('spotModal'));
        modal.hide();
      } catch (err) {
        console.error("Error viewing spot", err);
      }
    },
    async deleteSpot(spot_id) {
      try{
        const response = await fetch(`/api/admin/spot/${spot_id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Auth-Token": localStorage.getItem("auth_token")
          },
        });
        if (!response.ok) {
          const result = await response.json();
          this.emessage = result.message || "Failed to delete spot.";
          return;
        }
        this.fetchLots();
        const modal = bootstrap.Modal.getInstance(document.getElementById('spotModal'));
        modal.hide();
        this.smessage = "Spot deleted successfully.";
      }catch (err){
        console.log("Error deleting spot", err)
      }
    },
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
  },
};
