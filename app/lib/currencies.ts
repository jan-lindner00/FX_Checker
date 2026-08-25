export const currencies = [
    { countryCode: "AE", abbreviation: "AED", name: "UAE Dirham" },
    { countryCode: "AR", abbreviation: "ARS", name: "Argentine Peso" },
    { countryCode: "AU", abbreviation: "AUD", name: "Australian Dollar" },
    { countryCode: "BD", abbreviation: "BDT", name: "Bangladeshi Taka" },
    { countryCode: "BH", abbreviation: "BHD", name: "Bahraini Dinar" },
    { countryCode: "BR", abbreviation: "BRL", name: "Brazilian Real" },
    { countryCode: "CA", abbreviation: "CAD", name: "Canadian Dollar" },
    { countryCode: "CH", abbreviation: "CHF", name: "Swiss Franc" },
    { countryCode: "CL", abbreviation: "CLP", name: "Chilean Peso" },
    { countryCode: "CN", abbreviation: "CNY", name: "Chinese Yuan" },
    { countryCode: "CO", abbreviation: "COP", name: "Colombian Peso" },
    { countryCode: "CZ", abbreviation: "CZK", name: "Czech Koruna" },
    { countryCode: "DK", abbreviation: "DKK", name: "Danish Krone" },
    { countryCode: "EG", abbreviation: "EGP", name: "Egyptian Pound" },
    { countryCode: "EU", abbreviation: "EUR", name: "Euro", isPopular: true},
    { countryCode: "GB", abbreviation: "GBP", name: "British Pound Sterling", isPopular: true },
    { countryCode: "HK", abbreviation: "HKD", name: "Hong Kong Dollar" },
    { countryCode: "HN", abbreviation: "HNL", name: "Honduran Lempira" },
    { countryCode: "HT", abbreviation: "HTG", name: "Haitian Gourde" },
    { countryCode: "HU", abbreviation: "HUF", name: "Hungarian Forint" },
    { countryCode: "ID", abbreviation: "IDR", name: "Indonesian Rupiah" },
    { countryCode: "IN", abbreviation: "INR", name: "Indian Rupee" },
    { countryCode: "IS", abbreviation: "ISK", name: "Icelandic Krona" },
    { countryCode: "JO", abbreviation: "JOD", name: "Jordanian Dinar" },
    { countryCode: "JP", abbreviation: "JPY", name: "Japanese Yen", isPopular: true },
    { countryCode: "KE", abbreviation: "KES", name: "Kenyan Shilling" },
    { countryCode: "KR", abbreviation: "KRW", name: "South Korean Won" },
    { countryCode: "KW", abbreviation: "KWD", name: "Kuwaiti Dinar" },
    { countryCode: "LB", abbreviation: "LBP", name: "Lebanese Pound" },
    { countryCode: "LK", abbreviation: "LKR", name: "Sri Lankan Rupee" },
    { countryCode: "MA", abbreviation: "MAD", name: "Moroccan Dirham" },
    { countryCode: "MX", abbreviation: "MXN", name: "Mexican Peso" },
    { countryCode: "MY", abbreviation: "MYR", name: "Malaysian Ringgit" },
    { countryCode: "NG", abbreviation: "NGN", name: "Nigerian Naira" },
    { countryCode: "NO", abbreviation: "NOK", name: "Norwegian Krone" },
    { countryCode: "NP", abbreviation: "NPR", name: "Nepalese Rupee" },
    { countryCode: "NZ", abbreviation: "NZD", name: "New Zealand Dollar" },
    { countryCode: "OM", abbreviation: "OMR", name: "Omani Rial" },
    { countryCode: "PE", abbreviation: "PEN", name: "Peruvian Sol" },
    { countryCode: "PH", abbreviation: "PHP", name: "Philippine Peso" },
    { countryCode: "PK", abbreviation: "PKR", name: "Pakistani Rupee" },
    { countryCode: "PL", abbreviation: "PLN", name: "Polish Zloty" },
    { countryCode: "QA", abbreviation: "QAR", name: "Qatari Rial" },
    { countryCode: "RO", abbreviation: "RON", name: "Romanian Leu" },
    { countryCode: "RU", abbreviation: "RUB", name: "Russian Ruble" },
    { countryCode: "SA", abbreviation: "SAR", name: "Saudi Riyal" },
    { countryCode: "SE", abbreviation: "SEK", name: "Swedish Krona" },
    { countryCode: "SG", abbreviation: "SGD", name: "Singapore Dollar" },  
    { countryCode: "TH", abbreviation: "THB", name: "Thai Baht" },
    { countryCode: "TR", abbreviation: "TRY", name: "Turkish Lira" },
    { countryCode: "TW", abbreviation: "TWD", name: "New Taiwan Dollar" },
    { countryCode: "UA", abbreviation: "UAH", name: "Ukrainian Hryvnia" },
    { countryCode: "US", abbreviation: "USD", name: "United States Dollar", isPopular: true },
    { countryCode: "VN", abbreviation: "VND", name: "Vietnamese Dong" },
    { countryCode: "ZA", abbreviation: "ZAR", name: "South African Rand" }
];

export const compareCurrencies = [
    { countryCode: "EU", abbreviation: "EUR", name: "Euro"},
    { countryCode: "US", abbreviation: "USD", name: "United States Dollar" },
    { countryCode: "GB", abbreviation: "GBP", name: "British Pound Sterling"},
    { countryCode: "JP", abbreviation: "JPY", name: "Japanese Yen" },
    { countryCode: "CH", abbreviation: "CHF", name: "Swiss Franc" },
    { countryCode: "CA", abbreviation: "CAD", name: "Canadian Dollar" },
    { countryCode: "AU", abbreviation: "AUD", name: "Australian Dollar" },
    { countryCode: "IN", abbreviation: "INR", name: "Indian Rupee" },
    { countryCode: "CN", abbreviation: "CNY", name: "Chinese Yuan" },
    { countryCode: "BD", abbreviation: "BDT", name: "Bangladeshi Taka" }
]

export const currencyAbbreviations = currencies.map(cur => cur.abbreviation)

export function formatCurrency(amount: string): string{
    const numericAmount = parseFloat(amount)
    if(isNaN(numericAmount) || numericAmount <= 0){
        return "0.00"
    }
    const formattedAmount = `${parseFloat(numericAmount.toFixed(2)).toLocaleString("en-US")}`
    if(!formattedAmount.includes(".")){
        return formattedAmount + ".00"
    }
    if(formattedAmount.includes(".") && formattedAmount.split(".")[1].length < 2){
        return formattedAmount + "0"
    }
    return formattedAmount
}

export function calcSetAmount(amount: string):string{
    if(amount === ""){
        return ""
    }
    if(parseFloat(amount) > 10000000){
        return "10000000"
    }
    if(amount.split(".")[1]?.length > 2){
        return [amount.split(".")[0], amount.split(".")[1].slice(0, 2)].join(".")
    }
    if(amount.includes(".")){
        return [amount.split(".")[0], amount.split(".")[1]].join(".")
    }
    return amount   
}