import { v2 as cloudinary } from "cloudinary";
import { requireAdminUser } from "@/lib/auth";

const MAX_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  await requireAdminUser();

  const valid = (() => {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return { ok: false as const, error: "Cloudinary is not configured." };
    }
    return { ok: true as const };
  })();
  if (!valid.ok) {
    return Response.json({ error: valid.error }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  const ext = ALLOWED_TYPES.get(file.type);
  if (!ext) {
    return Response.json({ error: "Only JPG, PNG, WEBP or GIF images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "Image must be under 10 MB." }, { status: 400 });
  }

  const publicId = `programs/${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: "image" },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult as unknown as { secure_url: string });
        }
      );
      stream.end(buffer);
    });

    return Response.json({ url: result.secure_url });
  } catch (error) {
    console.error("upload to cloudinary:", error);
    return Response.json({ error: "Could not upload the image. Please try again." }, { status: 500 });
  }
}