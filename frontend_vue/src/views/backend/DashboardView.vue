<script setup>
import { reactive, ref, computed } from "vue";

// vue-chartjs, for more info and examples you can check out https://vue-chartjs.org/ and http://www.chartjs.org/docs/ -->
import { Line, Bar } from "vue-chartjs";
import { Chart, registerables } from "chart.js";
import { useAuthStore } from "@/stores/auth.store";

const authStore = useAuthStore();
const user = computed(() => authStore.getUser);


Chart.register(...registerables);

// Set Global Chart.js configuration
Chart.defaults.color = "#818d96";
Chart.defaults.scale.grid.lineWidth = 0;
Chart.defaults.scale.beginAtZero = true;
Chart.defaults.datasets.bar.maxBarThickness = 45;
Chart.defaults.elements.bar.borderRadius = 4;
Chart.defaults.elements.bar.borderSkipped = false;
Chart.defaults.elements.point.radius = 0;
Chart.defaults.elements.point.hoverRadius = 0;
Chart.defaults.plugins.tooltip.radius = 3;
Chart.defaults.plugins.legend.labels.boxWidth = 10;

// Helper variables
const orderSearch = ref(false);

// Chart Earnings data
const earningsData = reactive({
  labels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  datasets: [
    {
      label: "This Week",
      fill: true,
      backgroundColor: "rgba(100, 116, 139, .7)",
      borderColor: "transparent",
      pointBackgroundColor: "rgba(100, 116, 139, 1)",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(100, 116, 139, 1)",
      data: [716, 628, 1056, 560, 956, 890, 790],
    },
    {
      label: "Last Week",
      fill: true,
      backgroundColor: "rgba(100, 116, 139, .15)",
      borderColor: "transparent",
      pointBackgroundColor: "rgba(100, 116, 139, 1)",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(100, 116, 139, 1)",
      data: [1160, 923, 1052, 1300, 880, 926, 963],
    },
  ],
});

// Chart Earnings options
const earningsOptions = reactive({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      display: false,
      grid: {
        drawBorder: false,
      },
    },
    y: {
      display: false,
      grid: {
        drawBorder: false,
      },
    },
  },
  interaction: {
    intersect: false,
  },
  plugins: {
    legend: {
      labels: {
        boxHeight: 10,
        font: {
          size: 14,
        },
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return context.dataset.label + ": $" + context.parsed.y;
        },
      },
    },
  },
});

// Chart Total Orders data
const totalOrdersData = reactive({
  labels: [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
  ],
  datasets: [
    {
      label: "Total Orders",
      fill: true,
      backgroundColor: "rgba(220, 38, 38, .15)",
      borderColor: "transparent",
      pointBackgroundColor: "rgba(220, 38, 38, 1)",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(220, 38, 38, 1)",
      data: [33, 29, 32, 37, 38, 30, 34, 28, 43, 45, 26, 45, 49, 39],
    },
  ],
});

// Chart Total Orders options
const totalOrdersOptions = reactive({
  maintainAspectRatio: false,
  tension: 0.4,
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    },
  },
  interaction: {
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return " " + context.parsed.y + " Orders";
        },
      },
    },
  },
});

// Chart Total Earnings data
const totalEarningsData = reactive({
  labels: [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
  ],
  datasets: [
    {
      label: "Total Earnings",
      fill: true,
      backgroundColor: "rgba(101, 163, 13, .15)",
      borderColor: "transparent",
      pointBackgroundColor: "rgba(101, 163, 13, 1)",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(101, 163, 13, 1)",
      data: [
        716, 1185, 750, 1365, 956, 890, 1200, 968, 1158, 1025, 920, 1190, 720,
        1352,
      ],
    },
  ],
});

// Chart Total Earnings options
const totalEarningsOptions = reactive({
  maintainAspectRatio: false,
  tension: 0.4,
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    },
  },
  interaction: {
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return " $" + context.parsed.y;
        },
      },
    },
  },
});

// Chart New Customers data
const newCustomersData = reactive({
  labels: [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
  ],
  datasets: [
    {
      label: "Total Orders",
      fill: true,
      backgroundColor: "rgba(101, 163, 13, .15)",
      borderColor: "transparent",
      pointBackgroundColor: "rgba(101, 163, 13, 1)",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(101, 163, 13, 1)",
      data: [25, 15, 36, 14, 29, 19, 36, 41, 28, 26, 29, 33, 23, 41],
    },
  ],
});

// Chart New Customers options
const newCustomersOptions = reactive({
  maintainAspectRatio: false,
  tension: 0.4,
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    },
  },
  interaction: {
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return " " + context.parsed.y + " Customers";
        },
      },
    },
  },
});
</script>

<template>
  <!-- Hero -->
  <div class="content">
    <div
      class="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center py-2 text-center text-md-start"
    >
      <div class="flex-grow-1 mb-1 mb-md-0">
        <h1 class="h3 fw-bold mb-2">Dashboard</h1>
        <h2 class="h6 fw-medium fw-medium text-muted mb-0">
          Chào mừng
          <RouterLink
            :to="{ name: 'backend-dashboard' }"
            class="fw-semibold"
            >{{ user?.fullName }}</RouterLink
          > đến với hệ thống qHIS Plus.
        </h2>
      </div>
    </div>
  </div>
  <!-- END Hero -->

  <!-- Page Content -->
  <!-- END Page Content -->
</template>
