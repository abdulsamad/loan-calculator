export function formatCurrency(val) {
	const uiCurrency = document.querySelector('#uiCurrency');
	const str = Number(val);
	return new Intl.NumberFormat(uiCurrency.value, {
		style: 'currency',
		currency: uiCurrency.options[uiCurrency.selectedIndex].getAttribute(
			'data-currency',
		),
	}).format(str);
}
