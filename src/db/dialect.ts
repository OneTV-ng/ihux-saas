const rawDialect = process.env.DB_DIALECT || "postgresql";

export type NormalizedDialect = "mysql" | "postgresql" | "sqlite";

export const NORMALIZED_DIALECT: NormalizedDialect =
  rawDialect === "mysql" || rawDialect === "mysql2"
    ? "mysql"
    : rawDialect === "sqlite"
      ? "sqlite"
      : "postgresql";

export function getAuthProvider(): "mysql" | "pg" | "sqlite" {
  if (NORMALIZED_DIALECT === "mysql") return "mysql";
  if (NORMALIZED_DIALECT === "sqlite") return "sqlite";
  return "pg";
}
