import { formatCurrency } from './utils';

class CalcEMI {
	constructor(amount, interest, tenure, tenureType) {
		this.amount = parseFloat(amount).toFixed(2);
		this.interest = parseFloat(interest);
		this.monthlyInterest = this.interest / 100 / 12;
		this.tenure =
			tenureType === 'year' ? parseFloat(tenure) : parseFloat(tenure / 12);
		this.totalMonths =
			tenureType === 'month' ? parseFloat(tenure) : parseFloat(tenure * 12);
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
			tBodyStr += `<tr><th>${i}</th><td>${formatCurrency(
				newBalance,
			)}</td><td>${formatCurrency(this.emi())}</td><td>${formatCurrency(
				interestPaid,
			)}</td><td>${formatCurrency(principalPaid)}</td><td>${formatCurrency(
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

export default CalcEMI;
