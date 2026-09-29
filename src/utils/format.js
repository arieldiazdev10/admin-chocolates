const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const LOW_STOCK_THRESHOLD = 5;

export const formatCurrency = (value) => currencyFormatter.format(value ?? 0);
