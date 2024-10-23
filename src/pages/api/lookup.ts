import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { input } = req.body;

  try {
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

    const result = await client.execute({ sql: query, args: params });

    if (result.rows.length > 0) {
      res.status(200).json({ address: result.rows[0].address });
    } else {
      res.status(404).json({ message: "Address not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error looking up address " });
  }
}
