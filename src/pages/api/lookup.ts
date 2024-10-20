import { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { input } = req.body;

  try {
    const dbPath = path.join(
      process.cwd(),
      "src",
      "pages",
      "api",
      "data",
      "basedb.db",
    );
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    let query: string;
    let params: string[];

    if (input.includes(".base")) {
      // Input is a basename
      query = "SELECT address FROM basenames WHERE name = ?";
      params = [input];
    } else {
      // Input is an FID
      query = `
        SELECT v.address
        FROM verifications v
        LEFT JOIN profiles p ON v.fid = p.fid
        WHERE json_valid(p.data) = 1
          AND json_extract(p.data, '$.username') = ?;
      `;
      params = [input];
    }

    const result = await db.get(query, params);

    if (result) {
      res.status(200).json({ address: result.address });
    } else {
      res.status(404).json({ message: "Address not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error looking up address" });
  }
}
