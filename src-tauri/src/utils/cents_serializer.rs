use serde::{self, Deserialize, Deserializer, Serializer};

// Al serializar hacia el cliente: de centavos (i64) a decimal (f64)
pub fn serialize<S>(cents: &i64, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let decimal = (*cents as f64) / 100.0;
    serializer.serialize_f64(decimal)
}

// Al deserializar desde el cliente: acepta tanto f64 como i64 y lo pasa a centavos (i64)
pub fn deserialize<'de, D>(deserializer: D) -> Result<i64, D::Error>
where
    D: Deserializer<'de>,
{
    #[derive(Deserialize)]
    #[serde(untagged)]
    enum NumberOrFloat {
        Float(f64),
        Int(i64),
    }

    match NumberOrFloat::deserialize(deserializer)? {
        NumberOrFloat::Float(f) => Ok((f * 100.0).round() as i64),
        NumberOrFloat::Int(i) => Ok(i * 100), // Si enviaron un entero directo (ej: 12 -> 1200)
    }
}
