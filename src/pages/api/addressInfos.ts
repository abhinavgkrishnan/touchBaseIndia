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

  const { addresses } = req.body;

  try {
    const placeholders = addresses.map(() => "LOWER(?)").join(",");
    const queryBase = `
      SELECT address, name as basename
      FROM basenames
      WHERE LOWER(address) IN (${placeholders})
    `;

    const queryFc = `
      SELECT v.address as address, json_extract(p.data, '$.username') AS username
      FROM verifications v
      JOIN profiles p ON v.fid = p.fid
      WHERE v.address IN (${placeholders})
        AND json_valid(p.data) = 1
    `;

    const resultsBase = await client.execute({
      sql: queryBase,
      args: addresses,
    });
    const resultsFc = await client.execute({ sql: queryFc, args: addresses });

    const addressInfosBase = resultsBase.rows.reduce((acc, result: any) => {
      const originalAddress = addresses.find(
        (addr) => addr.toLowerCase() === result.address.toLowerCase(),
      );
      acc[originalAddress] = {
        basename: result.basename,
      };
      return acc;
    }, {});

    const addressInfosFc = resultsFc.rows.reduce((acc, result: any) => {
      const originalAddress = addresses.find(
        (addr) => addr.toLowerCase() === result.address.toLowerCase(),
      );
      acc[originalAddress] = {
        username: result.username,
      };
      return acc;
    }, {});

    res.status(200).json({
      base: addressInfosBase,
      fc: addressInfosFc,
    });
  } catch (error) {
    console.error("Error in addressInfos API:", error);
    res
      .status(500)
      .json({ message: "Error fetching address infos", error: error.message });
  }
}
