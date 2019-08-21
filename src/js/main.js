// CSS
import '../scss/style.scss';

// Chartjs
import Chart from 'chart.js';

// Service Worker Webpack Plugin Runtime
import runtime from 'serviceworker-webpack-plugin/lib/runtime';

// jsPDF
import * as jsPDF from 'jspdf';

// Custom Font for jsPDF
import font from '../font/base64_for_jspdf';

// jsPDF AutoTable
import 'jspdf-autotable';

// Global
const form = document.querySelector('#form');
window.addEventListener('load', () => {
	// Register Service Worker
	if ('serviceWorker' in navigator) {
		const registration = runtime.register();
	}
	// Toggle Loading
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
	constructor(amount, interest, tenure, tenureType) {
		this.amount = parseFloat(amount).toFixed(2);
		this.interest = parseFloat(interest);
		this.monthlyInterest = this.interest / 100 / 12;
		this.tenure = tenureType === 'year' ? parseFloat(tenure) : parseFloat(tenure / 12);
		this.totalMonths = tenureType === 'month' ? parseFloat(tenure) : parseFloat(tenure * 12);
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
		for (let i = 0; i < Math.ceil(this.tenure); i++) {
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
			tBodyStr += `<tr><th>${i}</th><td>${formatCurrency(newBalance)}</td><td>${formatCurrency(
				this.emi(),
			)}</td><td>${formatCurrency(interestPaid)}</td><td>${formatCurrency(principalPaid)}</td><td>${formatCurrency(
				(newBalance -= principalPaid),
			)}</td></tr>`;
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
	constructor(
		principal,
		interest,
		emi,
		totalMonths,
		totalAmount,
		totalInterest,
		timeArr,
		yearlyPrincipalArr,
		yearlyInterestArr,
		yearlyTotalArr,
		tBodyStr,
	) {
		this.principal = principal;
		this.interest = interest;
		this.emi = emi;
		this.totalMonths = totalMonths;
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
				labels: ['Total Principal', 'Total Interest'],
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
						//prettier-ignore
						label: (tooltipItem, data) => {
							const label = `${data.labels[tooltipItem.index]} : ${uiCurrency.options[uiCurrency.selectedIndex].innerText}${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]}  (${((parseFloat(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]) / this.totalAmount) * 100).toFixed(2)}%)`;
							return label;
						}
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
		const uiLineChartContainer = document.querySelector('.uiLineChartContainer');
		const uiLineChartContext = uiLineChart.getContext('2d');
		const uiCurrency = document.querySelector('#uiCurrency');
		uiLineChart.innerHTML = null;

		if (this.totalMonths < 12) {
			uiLineChartContainer.classList.add('is-hidden');
		} else {
			uiLineChartContainer.classList.remove('is-hidden');
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
							//prettier-ignore
							label: (tooltipItem, data) => {
								const label = `${data.datasets[tooltipItem.datasetIndex].label}: ${uiCurrency.options[uiCurrency.selectedIndex].innerText}${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]}  (${((parseFloat(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]) / this.totalAmount) * 100).toFixed(2)}%)`;
								return label;
							}
						},
					},
				},
			});
		}
	}

	scrollElem() {
		window.onscroll = () => {
			if (window.pageYOffset > 0) {
				document.querySelector('#uiScrollTop').classList.remove('is-hidden');
			} else {
				document.querySelector('#uiScrollTop').classList.add('is-hidden');
			}
		};
	}

	generateTablePDF(selector, table) {
		try {
			document.querySelector(selector).onclick = function() {
				let callAddFont = function() {
					this.addFileToVFS('robotoCondensed-normal.ttf', font);
					this.addFont('robotoCondensed-normal.ttf', 'robotoCondensed', 'normal');
				};
				jsPDF.API.events.push(['addFonts', callAddFont]);
				let doc = new jsPDF();
				doc.setFont('robotoCondensed', 'normal');
				doc.setFontSize(10);
				doc.setTextColor('rgb(128,128,128)');
				doc.autoTable({
					html: table,
					theme: 'grid',
					useCss: false,
					styles: { font: 'robotoCondensed', fontStyle: 'normal', halign: 'center' },
					headStyles: { font: 'helvetica', fontStyle: 'bold', fillColor: [0, 150, 136] },
					footStyles: { fillColor: [202, 202, 202], textColor: [48, 48, 48] },
					margin: {
						top: 10,
						right: 10,
						bottom: 10,
						left: 10,
					},
					showFoot: 'lastPage',
				});
				doc.text(`- Created from (${document.URL})`, 145, 285);
				doc.text(`- By Abdul Samad`, 145, 290);
				doc.save('Monthwise-EMI-Report.pdf');
			};
		} catch (err) {
			alert('Something Wrong Happened!');
			return console.log('Error: ' + err);
		}
	}

	printData(selector, target) {
		try {
			document.querySelector(selector).onclick = function() {
				let printBlock = document.querySelector(target);
				let newWin = window.open('', 'Print Window');
				newWin.document.write(`
				<html>
				<head>
				<title>Created From (${document.URL})</title>
				<style>
				table {
					font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
					border-collapse: collapse;
					border: 1px solid black;
					width: 100%;
					text-align: center;
					page-break-inside: auto;
				}
				th,td {
					border: 1px solid black;
					text-align: center;
					padding: 4pt;
					page-break-inside:avoid;
					page-break-after:auto;
				}
				thead {
					display: table-header-group;
				}
				tfoot {
					display: table-footer-group;
				}
				</style>
				</head>
				<body>${printBlock.outerHTML}</body>
				</html>`);
				newWin.print();
				newWin.close();
			};
		} catch (err) {
			alert('Something Wrong Happened!');
			return console.log('Error: ' + err);
		}
	}

	reset(selector) {
		document.querySelector(selector).onclick = () => {
			this.pieChart.destroy();
			if (document.querySelector('.uiLineChartContainer').classList.contains('is-hidden') === false) {
				this.lineChart.destroy();
			}
			document.body.scrollIntoView({
				behavior: 'smooth',
			});
			document.querySelector('#footer').classList.add('is-hidden');
			document.querySelectorAll('.uiResultItem').forEach(e => e.classList.add('fadeOut'));
			setTimeout(() => document.querySelectorAll('.uiResultItem').forEach(e => e.classList.add('is-hidden')), 500);
		};
	}

	showResults(delay) {
		setTimeout(() => {
			// Toggle All Result
			document.querySelectorAll('.uiResultItem').forEach(e => {
				e.classList.remove('is-hidden', 'fadeOut');
			});

			// Footer
			document.querySelector('#footer').classList.remove('is-hidden');

			// Remove Loading Class
			uiSubmitBtn.classList.remove('is-loading');

			//  Generate PDF
			this.generateTablePDF('#uiDownloadBtn', '#monthwiseTable');

			//  Generate PDF
			this.printData('#uiPrintBtn', '#monthwiseTable');
		}, delay);
	}
}

// Form
form.addEventListener('submit', ev => {
	ev.preventDefault();

	// UI Variables
	const amount = document.querySelector('#uiAmount').value,
		interest = document.querySelector('#uiInterest').value,
		uiTenure = document.querySelector('#uiTenure'),
		uiTenureType = document.querySelector('#uiTenureType').value,
		uiSubmitBtn = document.querySelector('#uiSubmitBtn');

	// Validating Tenure
	if ((uiTenureType === 'year' && uiTenure.value > 30) || (uiTenureType === 'month' && uiTenure.value > 360)) {
		alert('Please enter a valid tenure (Maximum 30 Years or 360 Months)');
		return false;
	} else {
		uiSubmitBtn.classList.add('is-loading');
		uiTenure.blur();
	}

	// Intantiate EMI
	const emiObj = new CalcEMI(amount, interest, uiTenure.value, uiTenureType),
		emiYearObj = emiObj.yearlyArr();

	// Intantiate UI
	const ui = new UI(
		amount,
		interest,
		emiObj.emi(),
		emiObj.totalMonths,
		emiObj.totalAmount(),
		emiObj.totalInterest(),
		emiObj.timeArr(),
		emiYearObj.yearlyPrincipalArr,
		emiYearObj.yearlyInterestArr,
		emiYearObj.yearlyTotalArr,
		emiYearObj.tBodyStr,
	);

	// Details
	ui.detailsCard();

	// Pie Chart
	ui.pieChart();

	// Table
	ui.table();

	// Line Chart
	ui.lineChart();

	// Reveal After Scroll Elements
	ui.scrollElem();

	// Reset
	ui.reset('#uiResetBtn');

	// Show Results and Setting PDF Generation
	ui.showResults(500);
});
