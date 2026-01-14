import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const railwayResponse = await fetch(
      "https://7-star-pdf-service-production.up.railway.app/generate-invoice",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    if (!railwayResponse.ok) {
      const text = await railwayResponse.text();
      console.error(text);
      return res.status(500).json({ error: "PDF service failed" });
    }

    const buffer = Buffer.from(await railwayResponse.arrayBuffer());

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=invoice.pdf");

    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Proxy error" });
  }
}
