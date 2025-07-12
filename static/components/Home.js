export default {
  template: `
  <div class="container-fluid p-0 m-0">
    <link rel="stylesheet" href="../static/css/home.css">
    <link rel="stylesheet" href="../static/css/nav.css">
    <nav class="navbar navbar-expand-lg navbar-dark nav-sec fixed-top">
      <div class="container">
        <router-link class="navbar-brand d-flex align-items-center" to="/">
          <i class="bi bi-car-front-fill me-2 fs-4"></i>
          <span class="fw-bold fs-4" style="letter-spacing: 0.5px;">WheelSpot</span>
        </router-link>
        <div class="ms-auto">
          <router-link to="/login" class="btn btn-outline-light px-4 rounded-pill">
            <i class="bi bi-box-arrow-in-right me-2"></i>
            <span class="d-none d-sm-inline">Login</span>
          </router-link>
        </div>
      </div>
    </nav>
  
    <header class="hero-section text-white text-center">
      <div class="container">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="display-4 fw-bold mb-4">Find & Reserve Parking Easily</h1>
            <p class="lead mb-4">Secure, real-time parking solutions for your vehicle — anytime, anywhere.</p>
            <div class="d-flex justify-content-center align-items-center">
              <router-link to="/register" class="btn btn-success btn-lg px-4">Get Started </router-link>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="stats-bar py-4 bg-light">
      <div class="container">
        <div class="row text-center">
          <div class="col-md-3">
            <h3 class="fw-bold text-primary">10K+</h3>
            <p class="mb-0">Active Users</p>
          </div>
          <div class="col-md-3">
            <h3 class="fw-bold text-primary">1K+</h3>
            <p class="mb-0">Parking Spots</p>
          </div>
          <div class="col-md-3">
            <h3 class="fw-bold text-primary">100+</h3>
            <p class="mb-0">Cities Covered</p>
          </div>
          <div class="col-md-3">
            <h3 class="fw-bold text-primary">99.9%</h3>
            <p class="mb-0">Uptime & Reliability</p>
          </div>
        </div>
      </div>
    </section>

    <section id="services" class="py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">Parking Features</h2>
          <p class="text-muted">Smart, secure, and scalable parking management</p>
        </div>
        <div class="row g-4">
          <div v-for="feature in features" :key="feature.id" class="col-md-4">
            <div class="card service-card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="service-icon rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                  <i :class="feature.icon" class="fs-3 text-primary"></i>
                </div>
                <h4 class="card-title">{{ feature.name }}</h4>
                <p class="card-text text-muted">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">How It Works</h2>
          <p class="text-muted">Reserve a parking spot in just 3 simple steps</p>
        </div>
        <div class="row g-4">
          <div class="col-md-4">
            <div class="step-card text-center p-4 bg-white rounded h-100">
              <div class="step-number rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 text-white fw-bold fs-5">1</div>
              <h4>Select</h4>
              <p class="text-muted">Find nearby parking spots</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="step-card text-center p-4 bg-white rounded h-100">
              <div class="step-number rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 text-white fw-bold fs-5">2</div>
              <h4>Reserve Instantly</h4>
              <p class="text-muted">Book your preferred slot in advance with real-time availability</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="step-card text-center p-4 bg-white rounded h-100">
              <div class="step-number rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 text-white fw-bold fs-5">3</div>
              <h4>Park & Go</h4>
              <p class="text-muted">Drive in, show your booking, and enjoy hassle-free parking</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section py-5 text-white">
      <div class="container text-center">
        <h2 class="mb-4">Reserve Your Spot Now!</h2>
        <p class="lead mb-4">Joined thousands of satisfied users and experienced the future of parking.</p>
      </div>
    </section>

    <footer class="footer py-5 bg-dark text-white">
      <div class="container">
        <div class="row">
          <div class="col-md-6 text-center text-md-start"> 
            <p>Smart parking for smart cities. Find, book, and park with confidence.</p>
            <p class="mb-0">&copy; 2025 WheelSpot. All rights reserved.</p>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <ul class="list-inline mb-0">
              <li class="list-inline-item">Privacy Policy</li>
              <li class="list-inline-item">Terms of Service</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  </div>
  `,
  data() {
    return {
      features: [
        {
          id: 1,
          name: "Advance Booking",
          description: "Secure your parking spot before you arrive.",
          icon: "bi bi-calendar-check",
        },
        {
          id: 2,
          name: "Secure Locations",
          description: "Monitored and verified parking zones for peace of mind.",
          icon: "bi bi-shield-check",
        },
        {
          id: 3,
          name: "Flexible Duration",
          description: "Choose hourly parking option.",
          icon: "bi bi-hourglass-split",
        },
      ],
    };
  },
};
