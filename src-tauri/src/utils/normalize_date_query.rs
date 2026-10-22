use chrono::NaiveDate;

/// Escapa los comodines de LIKE (`%`, `_`) y el carácter de escape `\`
/// para que el texto del usuario se busque de forma literal.
pub fn escape_like(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    for c in input.chars() {
        if matches!(c, '%' | '_' | '\\') {
            out.push('\\');
        }
        out.push(c);
    }
    out
}

pub fn normalize_date_query(q: &str) -> Option<String> {
    let q = q.trim();
    if q.is_empty() {
        return None;
    }

    // 1. Fechas completas
    const FULL_FORMATS: &[&str] = &["%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%Y-%m-%d", "%Y/%m/%d"];

    for fmt in FULL_FORMATS {
        if let Ok(date) = NaiveDate::parse_from_str(q, fmt) {
            return Some(date.format("%Y-%m-%d").to_string());
        }
    }

    // 2. Mes y año
    if let Ok(date) = NaiveDate::parse_from_str(&format!("01/{}", q), "%d/%m/%Y") {
        return Some(date.format("%Y-%m").to_string());
    }
    if let Ok(date) = NaiveDate::parse_from_str(&format!("01-{}", q), "%d-%m-%Y") {
        return Some(date.format("%Y-%m").to_string());
    }
    if let Ok(date) = NaiveDate::parse_from_str(&format!("{}-01", q), "%Y-%m-%d") {
        return Some(date.format("%Y-%m").to_string());
    }
    if let Ok(date) = NaiveDate::parse_from_str(&format!("{}/01", q), "%Y/%m/%d") {
        return Some(date.format("%Y-%m").to_string());
    }

    // 3. Año solo (4 dígitos)
    if q.len() == 4 && q.chars().all(|c| c.is_ascii_digit()) {
        if let Ok(year) = q.parse::<i32>() {
            if (1900..=2100).contains(&year) {
                return Some(year.to_string());
            }
        }
    }

    None
}
