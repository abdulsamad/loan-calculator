// CSS
import '../scss/style.scss';

// JavaScript
import Chart from 'chart.js';

// Global
window.addEventListener('load', () => {
	setTimeout(() => {
		document.querySelector('#main').classList.remove('is-hidden');
		document.querySelector('#loadElem').classList.add('is-hidden');
	}, 1000);
});

// Helper

function formatCurrency(val) {
	const uiCurrency = document.querySelector('#uiCurrency');
	const str = Number(val);
	return new Intl.NumberFormat(uiCurrency.value, {
		style: 'currency',
		currency: uiCurrency.options[uiCurrency.selectedIndex].getAttribute('data-currency'),
	}).format(str);
}

// Classes
class CalcEMI {
	constructor(amount, interest, tenure) {
		this.amount = parseFloat(amount).toFixed(2);
		this.interest = parseFloat(interest);
		this.monthlyInterest = this.interest / 100 / 12;
		this.tenure = parseFloat(tenure);
		this.totalMonths = parseFloat(tenure) * 12;
	}

	emi() {
		const x = Math.pow(1 + this.monthlyInterest, this.totalMonths);
		const emi = ((this.amount * x * this.monthlyInterest) / (x - 1)).toFixed(2);
		return emi;
	}

	totalAmount() {
		return (this.emi() * this.totalMonths).toFixed(2);
	}

	totalInterest() {
		return (this.emi() * this.totalMonths - this.amount).toFixed(2);
	}

	timeArr() {
		const str = [];
		for (let i = 0; i < this.tenure; i++) {
			str.push('Year ' + (i + 1));
		}
		return str;
	}

	yearlyArr() {
		let tBodyStr = '';
		const yearlyInterestArr = [];
		const yearlyPrincipalArr = [];
		const yearlyTotalArr = [];
		const monthlyInterestArr = [];
		const monthlyPrincipalArr = [];

		let newBalance = this.amount;
		let interestAmount = 0;
		let principalAmount = 0;

		for (let i = 1; i <= this.totalMonths; i++) {
			const interestPaid = newBalance * this.monthlyInterest,
				principalPaid = this.emi() - interestPaid;
			// Adding Monthly Payments
			interestAmount += interestPaid;
			principalAmount += principalPaid;
			// Pushing to an Array in Month
			monthlyInterestArr.push(interestPaid.toFixed(2));
			monthlyPrincipalArr.push(principalPaid.toFixed(2));
			// Pushing to an Array in Year
			if (i % 12 === 0) {
				yearlyInterestArr.push(interestAmount.toFixed(2));
				yearlyPrincipalArr.push(principalAmount.toFixed(2));
				yearlyTotalArr.push((this.emi() * 12).toFixed(2));
				interestAmount = 0;
				principalAmount = 0;
			}
			tBodyStr += `<tr><th>${i}</th><td>${formatCurrency(newBalance)}</td><td>${formatCurrency(this.emi())}</td><td>${formatCurrency(interestPaid)}</td><td>${formatCurrency(principalPaid)}</td><td>${formatCurrency((newBalance -= principalPaid))}</td></tr>`;
		}
		// Returning Value
		const arrObj = {
			yearlyInterestArr: yearlyInterestArr,
			yearlyPrincipalArr: yearlyPrincipalArr,
			tBodyStr: tBodyStr,
			yearlyTotalArr: yearlyTotalArr,
		};
		return arrObj;
	}
}

class UI {
	constructor(principal, interest, emi, totalAmount, totalInterest, timeArr, yearlyPrincipalArr, yearlyInterestArr, yearlyTotalArr, tBodyStr) {
		this.principal = principal;
		this.interest = interest;
		this.emi = emi;
		this.totalAmount = totalAmount;
		this.totalInterest = totalInterest;
		this.timeArr = timeArr;
		this.yearlyPrincipalArr = yearlyPrincipalArr;
		this.yearlyInterestArr = yearlyInterestArr;
		this.yearlyTotalArr = yearlyTotalArr;
		this.tBodyStr = tBodyStr;
	}

	detailsCard() {
		const uiEMI = document.querySelector('#uiEmi');
		const uiTotalInterest = document.querySelector('#uiTotalInterest');
		const uiTotalAmount = document.querySelector('#uiTotalAmount');

		setTimeout(() => {
			uiEMI.value = formatCurrency(this.emi);
			uiTotalInterest.value = formatCurrency(this.totalInterest);
			uiTotalAmount.value = formatCurrency(this.totalAmount);
		}, 500);

		setTimeout(() => {
			document.querySelector('.uiResultItem').scrollIntoView({
				behavior: 'smooth',
			});
		}, 1000);
	}

	pieChart() {
		const uiPieChart = document.querySelector('#pieChart');
		const uiPieChartContext = uiPieChart.getContext('2d');
		const uiCurrency = document.querySelector('#uiCurrency');
		uiPieChart.innerHTML = null;

		this.pieChart = new Chart(uiPieChartContext, {
			type: 'pie',
			data: {
				labels: ['Principal', 'Interest'],
				datasets: [
					{
						label: 'Loan Pie Chart',
						data: [this.principal, this.totalInterest],
						backgroundColor: ['rgb(35, 209, 96)', 'rgb(252, 69, 69)'],
						borderColor: ['rgb(35, 209, 96)', 'rgb(252, 69, 69)'],
						borderWidth: 1,
					},
				],
			},
			options: {
				tooltips: {
					callbacks: {
						label: function(tooltipItem, data) {
							const label = `${data.labels[tooltipItem.index]} : ${uiCurrency.options[uiCurrency.selectedIndex].innerText}${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]}`;
							return label;
						},
					},
				},
			},
		});
	}

	table() {
		const uiTableBody = document.querySelector('#uiTableBody'),
			uiTableRepayTotal = document.querySelector('#uiTableRepayTotal'),
			uiTableInterestTotal = document.querySelector('#uiTableInterestTotal'),
			uiTablePrincipalPaidTotal = document.querySelector('#uiTablePrincipalPaidTotal');

		uiTableBody.innerHTML = this.tBodyStr;

		uiTableRepayTotal.innerText = formatCurrency(this.totalAmount);
		uiTableInterestTotal.innerText = formatCurrency(this.totalInterest);
		uiTablePrincipalPaidTotal.innerText = formatCurrency(this.principal);
	}

	lineChart() {
		const uiLineChart = document.querySelector('#lineChart');
		const uiLineChartContext = uiLineChart.getContext('2d');
		const uiCurrency = document.querySelector('#uiCurrency');
		uiLineChart.innerHTML = null;

		this.lineChart = new Chart(uiLineChartContext, {
			type: 'bar',
			data: {
				labels: this.timeArr,
				datasets: [
					{
						label: 'Principal',
						data: this.yearlyPrincipalArr,
						backgroundColor: 'rgb(35, 209, 96)',
						borderColor: 'rgb(35, 209, 96)',
						borderWidth: 2,
					},
					{
						label: 'Interest',
						data: this.yearlyInterestArr,
						backgroundColor: 'rgb(252, 69, 69)',
						borderColor: 'rgb(252, 69, 69)',
						borderWidth: 2,
						fill: false,
					},
					{
						label: 'Total Amount',
						data: this.yearlyTotalArr,
						type: 'line',
						backgroundColor: 'rgb(33, 150, 243)',
						borderColor: 'rgb(33, 150, 243)',
						borderWidth: 2,
						fill: false,
						pointBorderWidth: 4,
						showline: true,
					},
				],
			},
			options: {
				scales: {
					yAxes: [
						{
							stacked: true,
							ticks: {
								beginAtZero: true,
							},
						},
					],
					xAxes: [
						{
							stacked: true,
						},
					],
				},
				tooltips: {
					callbacks: {
						label: function(tooltipItem, data) {
							const label = `${data.labels[tooltipItem.index]} : ${uiCurrency.options[uiCurrency.selectedIndex].innerHTML}${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]}`;
							return label;
						},
					},
				},
			},
		});
	}

	footer() {
		document.querySelector('#footer').classList.remove('is-hidden');
		window.onscroll = () => {
			if (window.pageYOffset > 50) {
				document.querySelector('#uiScrollTop').classList.remove('is-hidden');
			} else {
				document.querySelector('#uiScrollTop').classList.add('is-hidden');
			}
		};
	}

	reset() {
		this.pieChart.destroy();
		this.lineChart.destroy();
		document.body.scrollIntoView({
			behavior: 'smooth',
		});
		document.querySelector('#footer').classList.add('is-hidden');
		document.querySelectorAll('.uiResultItem').forEach(e => e.classList.add('fadeOut'));
		setTimeout(() => document.querySelectorAll('.uiResultItem').forEach(e => e.classList.add('is-hidden')), 500);
	}
}

// Form
const form = document.querySelector('#form');
form.addEventListener('submit', ev => {
	console.time('form');
	ev.preventDefault();

	// UI Variables
	const amount = document.querySelector('#uiAmount').value,
		interest = document.querySelector('#uiInterest').value,
		uiTenure = document.querySelector('#uiTenure'),
		uiSubmitBtn = document.querySelector('#uiSubmitBtn');

	// Validating Tenure
	if (uiTenure.value > 30) {
		alert('Please enter a valid number');
		return false;
	} else {
		uiSubmitBtn.classList.add('is-loading');
		uiTenure.blur();
	}

	// Intantiate EMI
	const emiObj = new CalcEMI(amount, interest, uiTenure.value),
		emiYearObj = emiObj.yearlyArr();

	// Intantiate UI
	const ui = new UI(amount, interest, emiObj.emi(), emiObj.totalAmount(), emiObj.totalInterest(), emiObj.timeArr(), emiYearObj.yearlyPrincipalArr, emiYearObj.yearlyInterestArr, emiYearObj.yearlyTotalArr, emiYearObj.tBodyStr);

	// Details
	ui.detailsCard();

	// Pie Chart
	ui.pieChart();

	// Table
	ui.table();

	// Line Chart
	ui.lineChart();

	// Reset
	document.querySelector('#uiResetBtn').onclick = () => {
		ui.reset();
	};

	// Show Results
	setTimeout(() => {
		// Toggle All Result
		document.querySelectorAll('.uiResultItem').forEach(e => {
			e.classList.remove('is-hidden', 'fadeOut');
		});

		// Footer
		ui.footer();

		// Remove Loading Class
		uiSubmitBtn.classList.remove('is-loading');
	}, 500);

	console.timeEnd('form');
});
