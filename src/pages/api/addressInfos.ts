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

  const { addresses } = req.body;

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

    const resultsBase = await db.all(queryBase, addresses);
    const resultsFc = await db.all(queryFc, addresses);

    const addressInfosBase = resultsBase.reduce((acc, result) => {
      const originalAddress = addresses.find(
        (addr) => addr.toLowerCase() === result.address.toLowerCase(),
      );
      acc[originalAddress] = {
        basename: result.basename,
      };
      return acc;
    }, {});

    const addressInfosFc = resultsFc.reduce((acc, result) => {
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
