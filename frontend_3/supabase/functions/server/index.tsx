import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Create storage bucket on startup
const BUCKET_NAME = 'make-39e078d6-todo-images';
try {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: false });
    console.log(`Created bucket: ${BUCKET_NAME}`);
  }
} catch (error) {
  console.log(`Bucket creation error: ${error}`);
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-39e078d6/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all todos for a user
app.get("/make-server-39e078d6/todos", async (c) => {
  try {
    const userId = c.req.header('x-user-id') || 'anonymous';
    const userTodos = await kv.get(`todos:${userId}`);
    return c.json({ todos: userTodos || [] });
  } catch (error) {
    console.log(`Error fetching todos: ${error}`);
    return c.json({ error: 'Failed to fetch todos' }, 500);
  }
});

// Save todos for a user
app.post("/make-server-39e078d6/todos", async (c) => {
  try {
    const userId = c.req.header('x-user-id') || 'anonymous';
    const { todos } = await c.req.json();
    await kv.set(`todos:${userId}`, todos);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving todos: ${error}`);
    return c.json({ error: 'Failed to save todos' }, 500);
  }
});

// Upload image
app.post("/make-server-39e078d6/upload-image", async (c) => {
  try {
    const userId = c.req.header('x-user-id') || 'anonymous';
    const body = await c.req.json();
    const { imageData, fileName } = body;
    
    // Convert base64 to blob
    const base64Data = imageData.split(',')[1];
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const uniqueFileName = `${userId}/${Date.now()}-${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFileName, buffer, {
        contentType: 'image/jpeg',
      });
    
    if (error) {
      console.log(`Upload error: ${error}`);
      return c.json({ error: 'Failed to upload image' }, 500);
    }
    
    // Get signed URL for the uploaded image
    const { data: signedUrl } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(uniqueFileName, 60 * 60 * 24 * 7); // 7 days
    
    return c.json({ 
      success: true, 
      imageUrl: signedUrl?.signedUrl,
      path: uniqueFileName 
    });
  } catch (error) {
    console.log(`Error uploading image: ${error}`);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

// Get signed URL for an image
app.post("/make-server-39e078d6/get-image-url", async (c) => {
  try {
    const { path } = await c.req.json();
    
    const { data: signedUrl } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
    
    if (!signedUrl) {
      return c.json({ error: 'Failed to generate signed URL' }, 500);
    }
    
    return c.json({ imageUrl: signedUrl.signedUrl });
  } catch (error) {
    console.log(`Error getting image URL: ${error}`);
    return c.json({ error: 'Failed to get image URL' }, 500);
  }
});

Deno.serve(app.fetch);