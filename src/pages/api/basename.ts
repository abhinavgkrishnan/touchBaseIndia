import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { createClient } from "@libsql/client";

interface VerificationData {
  fid: string;
  address: string;
}

interface baseNameData {
  address: string;
  name: string;
}

type FidBaseAddressMap = {
  [address: string]: {
    basename: string;
    fid: number;
    pfp: string;
  };
};

const client = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { fid } = req.body;

  try {
    // Step 1: Fetch links by FID
    const url = "https://hub.pinata.cloud/v1/linksByFid";
    const response = await axios.get(url, { params: { fid } });
    const fidFollowData = response.data;

    // Step 2: Extract follower FIDs
    const followersFid: number[] = fidFollowData.messages.map(
      (message: any) => message.data.linkBody.targetFid,
    );
    const followersFidString = followersFid.join(",");

    // Step 3 & 4: Query the Turso database
    const query = `
      SELECT
        v.fid,
        v.address,
        b.name,
        p.data AS profileData
      FROM verifications v
      LEFT JOIN basenames b ON v.address = b.address
      LEFT JOIN profiles p ON v.fid = p.fid
      WHERE v.fid IN (${followersFidString})
    `;
    const result = await client.execute(query);

    // Step 5: Process the data and build the response
    let fidBaseAddressMapTemp: FidBaseAddressMap = {};
    result.rows.forEach((row: any) => {
      const dbFid = parseInt(row.fid);
      const dbAdd = row.address;
      const dbName = row.name;

      if (dbFid && dbAdd && dbName) {
        let pfp = "";
        try {
          if (
            typeof row.profileData === "string" &&
            row.profileData.trim() !== "" &&
            row.profileData !== "undefined"
          ) {
            const profileData = JSON.parse(row.profileData);
            pfp = profileData.pfp;
          }
        } catch (error) {
          console.error("Error parsing JSON for FID:", dbFid, error);
        }

        fidBaseAddressMapTemp[dbAdd] = {
          basename: dbName,
          fid: dbFid,
          pfp: pfp,
        };
      }
    });

    // Return the results
    res.status(200).json(fidBaseAddressMapTemp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching data " });
  }
}
