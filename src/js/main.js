import CalcEMI from './calcemi';
import UI from './ui';

// CSS
import '../scss/style.scss';

// Global
window.addEventListener('load', () => {
	// Register Service Worker
	if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

	// Toggle Loading
	setTimeout(() => {
		document.querySelector('#main').classList.remove('is-hidden');
		document.querySelector('#loadElem').classList.add('is-hidden');
	}, 1000);
});

const form = document.querySelector('#form');
form.addEventListener('submit', (ev) => {
	ev.preventDefault();

	// UI Variables
	const amount = document.querySelector('#uiAmount').value,
		interest = document.querySelector('#uiInterest').value,
		uiTenure = document.querySelector('#uiTenure'),
		uiTenureType = document.querySelector('#uiTenureType').value,
		uiSubmitBtn = document.querySelector('#uiSubmitBtn');

	// Validating Tenure
	if (
		(uiTenureType === 'year' && uiTenure.value > 30) ||
		(uiTenureType === 'month' && uiTenure.value > 360)
	) {
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
