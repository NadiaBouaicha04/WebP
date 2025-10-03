const ctx1 = document.getElementById('revenueChart');
new Chart(ctx1, {
  type: 'line',
  data: {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Revenus',
      data: [1200, 1900, 3000, 2500, 3200, 4100, 5000],
      borderColor: 'green',
      backgroundColor: 'rgba(0, 200, 83, 0.2)',
      fill: true
    }]
  }
});

const ctx2 = document.getElementById('customersChart');
new Chart(ctx2, {
  type: 'doughnut',
  data: {
    labels: ['Clients existants', 'Nouveaux clients'],
    datasets: [{
      data: [65, 35],
      backgroundColor: ['#4CAF50', '#FFC107']
    }]
  }
});
