import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
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
  console.error("Railway error:", text);
  return res.status(500).json({
    error: "PDF service failed",
    railwayStatus: railwayResponse.status,
    railwayBody: text,
  });
}


    const buffer = Buffer.from(await railwayResponse.arrayBuffer());

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=invoice.pdf"
    );

    res.status(200).send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Proxy error");
  }
}
