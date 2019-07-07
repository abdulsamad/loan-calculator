// CSS
import '../scss/style.scss';

// JavaScript
import Chart from 'chart.js';

// Global
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelector('#main').classList.remove('is-hidden');
    document.querySelector('#loadElem').classList.add('is-hidden');
  }, 1500);
}, false);

// Form 
const form = document.querySelector('#form');
form.addEventListener('submit', calcEMI, false);

function calcEMI(e) {
  e.preventDefault();

  // UI Variables
  const uiAmount = document.querySelector('#uiAmount');
  const uiCurrency = document.querySelector('#uiCurrency');
  const uiInterest = document.querySelector('#uiInterest');
  const uiTenure = document.querySelector('#uiTenure');
  const uiEmi = document.querySelector('#uiEmi');
  const uiTotalInterest = document.querySelector('#uiTotalInterest');
  const uiTotalAmount = document.querySelector('#uiTotalAmount');
  const uiResultItem = document.querySelectorAll('.uiResultItem');
  const uiSubmitBtn = document.querySelector('#uiSubmitBtn');
  const uiResetBtn = document.querySelector('#uiResetBtn');
  const uiTableBody = document.querySelector('#uiTableBody');
  const uiTableRepayTotal = document.querySelector('#uiTableRepayTotal');
  const uiTableInterestTotal = document.querySelector('#uiTableInterestTotal');
  const uiTablePrincipalPaidTotal = document.querySelector('#uiTablePrincipalPaidTotal');
  const uiPieChart = document.querySelector('#pie-chart').getContext('2d');
  const uiLineChart = document.querySelector('#lineChart').getContext('2d');
  const uiScrollTop = document.querySelector('#uiScrollTop');
  const footer = document.querySelector('#footer');
  let pieChart, lineChart;

  // UI Form Values
  const uiAmountVal = uiAmount.value;
  const uiCurrencyVal = uiCurrency.value;
  const uiInterestVal = uiInterest.value;
  const uiTenureVal = uiTenure.value;

  // Validating Tenure
  if (uiTenureVal > 30) {
    alert('Please enter a valid number');
    return false;
  } else {
    uiSubmitBtn.classList.add('is-loading');
    uiTenure.blur();
  }

  // Extra & Helper Functions

  function formatCurrency(val) {
    const str = Number(val);
    return new Intl.NumberFormat(uiCurrencyVal, {
      style: 'currency',
      currency: uiCurrency.options[uiCurrency.selectedIndex].getAttribute('data-currency'),
    }).format(str);
  }

  function timeArray() {
    const str = [];
    for (let i = 0; i < uiTenureVal; i++) {
      str.push('Year ' + (i + 1));
    }
    return str;
  }

  function dataArray(data) {
    const str = [];
    for (let i = 1; i <= uiTenureVal; i++) {
      str.push(data * i);
    }
    return str;
  }

  uiResetBtn.onclick = () => {
    pieChart.destroy();
    lineChart.destroy();
    document.body.scrollIntoView({
      behavior: 'smooth'
    });
    uiResultItem.forEach((e) => e.classList.add('is-hidden'));
  }

  // Calculation Variables
  const principal = (parseFloat(uiAmountVal)).toFixed(2);
  const monthlyInterest = parseFloat(uiInterestVal) / 100 / 12;
  const totalMonths = parseFloat(uiTenureVal) * 12;
  const x = Math.pow(1 + monthlyInterest, totalMonths);
  const emi = ((principal * x * monthlyInterest) / (x - 1)).toFixed(2);
  const totalAmount = (emi * totalMonths).toFixed(2);
  const totalInterest = (emi * totalMonths - principal).toFixed(2);

  // Pie Chart
  uiPieChart.innerHTML = null;

  pieChart = new Chart(uiPieChart, {
    type: 'pie',
    data: {
      labels: ['Principal', 'Interest'],
      datasets: [{
        label: 'Loan Pie Chart',
        data: [principal, totalInterest],
        backgroundColor: [
          'rgb(35, 209, 96)',
          'rgb(252, 69, 69)',
        ],
        borderColor: [
          'rgb(35, 209, 96)',
          'rgb(252, 69, 69)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            const label = `${data.labels[tooltipItem.index]} : ${uiCurrency.options[uiCurrency.selectedIndex].innerHTML}${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]}`;
            return label;
          }
        }
      }
    }
  });

  // MonthWise Table DOM Manipulation
  let newBalance = parseFloat(uiAmountVal);
  uiTableBody.innerHTML = null;
  let yearlyInterest = [];
  let yearAmount = 0;

  for (let i = 1; i <= totalMonths; i++) {
    const interestPaid = newBalance * monthlyInterest;
    const principalPaid = emi - interestPaid;
    yearAmount += Math.round(interestPaid);

    // Creating Yearly Interest Array
    if (i % 12 === 0) {
      yearlyInterest.push(yearAmount);
      yearAmount = 0;
    }

    uiTableBody.innerHTML +=
      `<tr>
        <th class='scaleUp'>${i}</th>
        <td class='scaleUp'>${formatCurrency(newBalance)}</td>
        <td class='scaleUp'>${formatCurrency(emi)}</td>
        <td class='scaleUp'>${formatCurrency(interestPaid)}</td>
        <td class='scaleUp'>${formatCurrency(principalPaid)}</td>
        <td class='scaleUp'>${formatCurrency(newBalance -= principalPaid)}</td>
        </tr>`;
  }

  uiTableRepayTotal.innerText = formatCurrency(totalAmount);
  uiTableInterestTotal.innerText = formatCurrency(totalInterest);
  uiTablePrincipalPaidTotal.innerText = formatCurrency(principal);

  // Line Chart 
  uiLineChart.innerHTML = null;

  lineChart = new Chart(uiLineChart, {
    type: 'bar',
    data: {
      labels: timeArray(),
      datasets: [{
          label: 'Principal',
          data: dataArray(Math.round(totalAmount / uiTenureVal)),
          backgroundColor: 'rgb(35, 209, 96)',
          borderColor: 'rgb(35, 209, 96)',
          borderWidth: 2,
        },
        {
          label: 'Interest',
          data: yearlyInterest,
          backgroundColor: 'rgb(252, 69, 69)',
          borderColor: 'rgb(252, 69, 69)',
          borderWidth: 2,
          fill: false,
        }
      ],
    },
    options: {
      scales: {
        yAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true,
          }
        }],
        xAxes: [{
          stacked: true,
        }]
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            const label = `${data.labels[tooltipItem.index]} : ${uiCurrency.options[uiCurrency.selectedIndex].innerHTML}${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]}`;
            return label;
          }
        }
      }
    },
  });

  // Manipulating All Results DOM
  setTimeout(() => {
    uiEmi.value = formatCurrency(emi);
    uiTotalInterest.value = formatCurrency(totalInterest);
    uiTotalAmount.value = formatCurrency(totalAmount);
    uiResultItem.forEach((e) => e.classList.remove('is-hidden'));
    uiSubmitBtn.classList.remove('is-loading');
  }, 500);
  setTimeout(() => {
    document.querySelector('.uiResultItem').scrollIntoView({
      behavior: 'smooth'
    });
  }, 1000);


  window.onscroll = () => {
    if (window.pageYOffset > 50) {
      uiScrollTop.classList.remove('is-hidden');
      footer.classList.remove('is-invisible');
    } else {
      uiScrollTop.classList.add('is-hidden');
      footer.classList.add('is-invisible');
    }
  }
}