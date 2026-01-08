import OpenAI from 'openai';
import Ticket from "@/models/Ticket";
import Case from "@/models/Case";
import fs from 'fs';
import path from 'path';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



export async function analyzeCase(caseId: string) {
  console.log(`[Analysis] Starting analysis for Case ID: ${caseId}`);
  const caseData = await Case.findById(caseId);
  if (!caseData) {
      console.error(`[Analysis] Case not found: ${caseId}`);
      throw new Error("Case not found");
  }

  // Step 0: Initialize
  console.log(`[Analysis] Initializing case status...`);
  caseData.status = 'Analysis In Progress';
  caseData.analysisLog = [];
  caseData.analysisLog.push(`[${new Date().toLocaleTimeString()}] Analysis started.`);
  await caseData.save();

  try {
      // Step 1: Read all uploaded documents
      console.log(`[Analysis] Step 1: Reading documents...`);
      if (!caseData.analysisLog) caseData.analysisLog = [];
      caseData.analysisLog.push(`[${new Date().toLocaleTimeString()}] Reading uploaded documents...`);
      await caseData.save();
      
      const tickets = await Ticket.find({ caseId });
      console.log(`[Analysis] Found ${tickets.length} tickets for case.`);
      if (tickets.length === 0) {
           console.warn(`[Analysis] No tickets found.`);
           throw new Error("No tickets found to analyze.");
      }

      // Step 2: Use LLM to extract all details
      console.log(`[Analysis] Step 2: Extracting details...`);
      caseData.analysisLog.push(`[${new Date().toLocaleTimeString()}] Extracting details from ${tickets.length} file(s)...`);
      await caseData.save();

      // Check for API Key
      if (!process.env.OPENAI_API_KEY) {
          throw new Error("OPENAI_API_KEY is not configured.");
      }

      // Prepare images/files for Vision API
      const contentParts: any[] = [
          { type: "text", text: "Analyze these traffic ticket images. Extract the following details into a JSON object: citationDate, violationCode, location, fineAmount, officerNotes, court." }
      ];

      for (const t of tickets) {
          const isImage = /\.(jpeg|jpg|png|webp|gif|bmp|tiff)$/i.test(t.fileUrl);
          const isPDF = /\.pdf$/i.test(t.fileUrl);
          
          if (isImage) {
              let imageUrl = t.fileUrl;

              // Handle local uploads (relative paths)
              if (imageUrl.startsWith('/')) {
                  try {
                      const filePath = path.join(process.cwd(), 'public', imageUrl);
                      const fileBuffer = fs.readFileSync(filePath);
                      const base64Image = fileBuffer.toString('base64');
                      const mimeType = imageUrl.split('.').pop()?.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
                      imageUrl = `data:${mimeType};base64,${base64Image}`;
                      console.log(`[Analysis] Converted local file to base64: ${t.fileUrl}`);
                  } catch (e) {
                      console.error(`[Analysis] Failed to read local file: ${t.fileUrl}`, e);
                      // Skip this file or continue with URL (will fail)
                  }
              }

              contentParts.push({
                  type: "image_url",
                  image_url: {
                      url: imageUrl,
                  }
              });
// ... no PDFParser

// ...

          } else if (isPDF) {
              console.log(`[Analysis] Processing PDF via OpenAI Files API: ${t.fileUrl}`);
              try {
                  // 1. Get the file locally (download if needed)
                  let filePath: string;
                  if (t.fileUrl.startsWith('/')) {
                       filePath = path.join(process.cwd(), 'public', t.fileUrl);
                  } else {
                       // Download to temp
                       const res = await fetch(t.fileUrl);
                       if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.statusText}`);
                       const buffer = Buffer.from(await res.arrayBuffer());
                       filePath = path.join('/tmp', `temp-${Date.now()}.pdf`);
                       await fs.promises.writeFile(filePath, buffer);
                  }

                  // 2. Upload to OpenAI Files
                  const fileUpload = await openai.files.create({
                      file: fs.createReadStream(filePath),
                      purpose: "assistants", // Generic purpose, often compatible
                  });
                  console.log(`[Analysis] Uploaded PDF to OpenAI, File ID: ${fileUpload.id}`);

                  // 3. Cleanup temp
                  if (!t.fileUrl.startsWith('/')) {
                      await fs.promises.unlink(filePath);
                  }

                  // 4. Pass File ID?
                  // NOTE: Official Chat Completions API generally supports image_url or text. 
                  // passing 'image_file' with a PDF file_id is the experimental/beta feature or implies internal conversion.
                  // We will try to pass it as a content part.
                  // If this fails, we effectively confirm Chat Completions strictly needs images.
                  /*
                    The user's example used "type": "input_file". 
                    Since we can't be sure of the SDK support for 'input_file' without types,
                    we will try standard extraction or fallback to text if this fails.
                    Actually, let's try to inject the specific user-requested format just in case the SDK passes it through.
                  */
                 
                 // However, since we are constrained, I will rely on the text extraction VIA Chat if possible.
                 // BUT wait, I will try to use the 'refusal' mechanism to debug.
                 
                 // Let's try passing the file_id as a "image_file" which works for images.
                 // If OpenAI supports PDF natively now, this might work.
                  // 5. Pass File ID using "file" type (as per supported values list)
                  contentParts.push({
                      type: "file",
                      file: {
                          file_id: fileUpload.id
                      }
                  });

              } catch (e) {
                   console.error(`[Analysis] PDF upload failed:`, e);
                   contentParts.push({ type: "text", text: `(Failed to process PDF file at ${t.fileUrl})`});
              }
          } else {
             // Fallback for non-images
             contentParts.push({ type: "text", text: `(Additional document at ${t.fileUrl} - format not supported)`});
          }
      }

      console.log(`[Analysis] Sending ${contentParts.length} parts to OpenAI (Images: ${contentParts.filter(p => p.type === 'image_url').length})`);

      const extractionResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
              {
                  role: "system",
                  content: "You are a data extraction assistant. You only output valid JSON."
              },
              {
                  role: "user",
                  content: contentParts
              }
          ],
          response_format: { type: "json_object" }
      });

      console.log("[Analysis] OpenAI Raw Response:", JSON.stringify(extractionResponse.choices[0], null, 2));

      const choice = extractionResponse.choices[0];
      if (choice.message.refusal) {
          throw new Error(`AI Refusal: ${choice.message.refusal}`);
      }

      const rawExtraction = choice.message.content;
      if (!rawExtraction) {
          console.error("[Analysis] Empty content received. Finish reason:", choice.finish_reason);
          throw new Error(`Failed to extract data. Finish reason: ${choice.finish_reason}`);
      }

      const extractedData = JSON.parse(rawExtraction);

      // Step 3: Consolidate details
      console.log(`[Analysis] Step 3: Consolidating details...`);
      
      caseData.structuredData = extractedData;
      console.log(`[Analysis] details consolidated:`, caseData.structuredData);
      caseData.analysisLog.push(`[${new Date().toLocaleTimeString()}] Details consolidated.`);
      await caseData.save();

      // Step 4: Analyze details for strategy
      console.log(`[Analysis] Step 4: Generating strategy...`);
      caseData.analysisLog.push(`[${new Date().toLocaleTimeString()}] Generating legal strategy...`);
      await caseData.save();
      
      console.log(`[Analysis] Calling OpenAI for strategy...`);
      // Call OpenAI with consolidated data for specific legal analysis
      const strategyResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
              {
                  role: "system",
                  content: "You are an expert traffic lawyer. Provide a detailed, formatted strategy based on the extracted ticket details. Use Markdown."
              },
              {
                  role: "user",
                  content: `Analyze this traffic ticket data: ${JSON.stringify(caseData.structuredData)}. 
                  Provide a strategy to fight this ticket, covering:
                  1. Discovery requests (what to ask for).
                  2. Specific defenses for the violation code.
                  3. Assessment of success probability.`
              }
          ]
      });

      caseData.analysis = strategyResponse.choices[0].message.content || "Analysis failed.";
      console.log(`[Analysis] OpenAI strategy received. \n ${caseData.analysis}`);

      // Step 5: Finalize
      console.log(`[Analysis] Step 5: Complete.`);
      caseData.analysisLog.push(`[${new Date().toLocaleTimeString()}] Analysis complete.`);
      caseData.status = 'Ready';
      await caseData.save();

  } catch (error) {
      console.error("[Analysis] Failed:", error);
      if (!caseData.analysisLog) caseData.analysisLog = [];
      caseData.analysisLog.push(`[${new Date().toLocaleTimeString()}] Error: ${(error as Error).message}`);
      caseData.status = 'Open'; 
      await caseData.save();
  }
}
